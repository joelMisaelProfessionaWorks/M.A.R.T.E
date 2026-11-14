import hashlib
import io
import os
import re
import unicodedata
import torch

# Usa todos los hilos asignados por el contenedor (default 4 en local, 8 en Cloud Run)
NUM_THREADS = int(os.environ.get("OMP_NUM_THREADS", 4))
torch.set_num_threads(NUM_THREADS)

import torchaudio
import soundfile as sf
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import numpy as np

# ==========================================================
# PARCHES SOUNDFILE Y NORMALIZACIÓN
# ==========================================================
def mock_load_with_torchcodec(uri, *args, **kwargs):
    data, sr = sf.read(uri, dtype='float32')
    tensor = torch.from_numpy(data)
    if tensor.ndim == 1:
        tensor = tensor.unsqueeze(0)
    elif tensor.ndim == 2:
        tensor = tensor.T
    return tensor, sr

def mock_save_with_torchcodec(uri, src, sample_rate, *args, **kwargs):
    if isinstance(src, torch.Tensor):
        data = src.detach().cpu().numpy()
    else:
        data = src
    if data.ndim == 2 and data.shape[0] < data.shape[1]:
        data = data.T
    if isinstance(uri, io.BytesIO) or not isinstance(uri, (str, bytes, os.PathLike)) or not str(uri).lower().endswith(('.wav', '.flac', '.ogg')):
        sf.write(uri, data, sample_rate, format='WAV', subtype='PCM_16')
    else:
        sf.write(uri, data, sample_rate)

torchaudio.load_with_torchcodec = mock_load_with_torchcodec
torchaudio.save_with_torchcodec = mock_save_with_torchcodec

def limpiar_texto_para_f5(texto):
    texto_nfd = unicodedata.normalize('NFD', texto)
    texto_sin_acentos = ''.join(c for c in texto_nfd if unicodedata.category(c) != 'Mn')
    texto_limpio = texto_sin_acentos.replace('ñ', 'n').replace('Ñ', 'N')
    texto_limpio = re.sub(r'[^a-zA-Z0-9\s.,?!]', '', texto_limpio)
    return texto_limpio.strip()

from f5_tts.api import F5TTS

try:
    torchaudio.set_audio_backend("soundfile")
except Exception:
    pass

app = Flask(__name__)
CORS(app)

print(f"Cargando modelo F5-TTS en memoria usando {NUM_THREADS} hilos...")
tts_engine = F5TTS()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO_PATH = os.path.join(BASE_DIR, "AI_Ranni.wav")
CACHE_DIR = os.path.join(BASE_DIR, "audio_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

REF_TEXT = "Hello Tarnished, my name is Rani. I am a witch in the video game Elden Ring."

@app.route('/', methods=['GET'])
def health_check():
    return f"🚀 Servidor de Voz de Marte listo (Hilos CPU: {NUM_THREADS})", 200

@app.route('/api/narrate', methods=['POST'])
def narrate():
    data = request.json or {}
    raw_text = data.get("text", "")

    if not raw_text:
        return jsonify({"error": "Texto no proporcionado"}), 400

    if not os.path.exists(REF_AUDIO_PATH):
        return jsonify({"error": f"Falta archivo de voz base: {REF_AUDIO_PATH}"}), 404

    try:
        target_text = limpiar_texto_para_f5(raw_text)
        
        # 1. Revisar si esta frase ya fue sintetizada (respuesta instantánea)
        text_hash = hashlib.md5(target_text.encode('utf-8')).hexdigest()
        cached_file = os.path.join(CACHE_DIR, f"{text_hash}.wav")
        if os.path.exists(cached_file):
            print(f"⚡ Sirviendo desde caché: '{target_text}'")
            return send_file(cached_file, mimetype="audio/wav", as_attachment=False, download_name="narration.wav")

        print(f"🎙️ Generando nuevo audio: '{target_text}'")
        oraciones = [s.strip() for s in re.split(r'(?<=[.!?])\s+', target_text) if s.strip()]
        if not oraciones:
            oraciones = [target_text]

        fragmentos_audio = []
        sample_rate_final = 24000

        # 2. torch.inference_mode() acelera la inferencia y reduce consumo de RAM
        with torch.inference_mode():
            for i, oracion in enumerate(oraciones):
                if len(oracion) < 2:
                    continue
                print(f"  ├─ Fragmento {i+1}/{len(oraciones)}: '{oracion}'")
                wav_chunk, sr, _ = tts_engine.infer(
                    ref_file=REF_AUDIO_PATH,
                    ref_text=REF_TEXT,
                    gen_text=oracion,
                    nfe_step=8,
                    cfg_strength=1.5
                )
                fragmentos_audio.append(wav_chunk)
                sample_rate_final = sr

        if not fragmentos_audio:
            return jsonify({"error": "No se pudo sintetizar el texto"}), 500

        wav_np = np.concatenate(fragmentos_audio, axis=0)
        max_val = np.max(np.abs(wav_np))
        if max_val > 0:
            wav_np = (wav_np / max_val) * 0.95

        wav_tensor = torch.from_numpy(wav_np).unsqueeze(0)
        
        # Guardar en caché en disco y enviar
        torchaudio.save(cached_file, wav_tensor, sample_rate_final, format="wav")
        print("✅ Audio generado y guardado en caché.")

        return send_file(
            cached_file,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="narration.wav"
        )

    except Exception as e:
        print("❌ Error en inferencia:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)