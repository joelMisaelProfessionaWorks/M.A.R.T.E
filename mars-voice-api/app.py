import io
import os
import re
import unicodedata
import torch
torch.set_num_threads(2)
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

print("Cargando modelo F5-TTS en memoria...")
tts_engine = F5TTS()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO_PATH = os.path.join(BASE_DIR, "AI_Ranni.wav")

# Asegúrate de que este texto coincida EXACTAMENTE con la primera frase de tu AI_Ranni.wav (6-8 segundos)
REF_TEXT = "Hello Tarnished, my name is Rani. I am a witch in the video game Elden Ring."

@app.route('/', methods=['GET'])
def health_check():
    return "🚀 Servidor de Voz de Marte listo", 200

@app.route('/api/narrate', methods=['POST'])
def narrate():
    data = request.json or {}
    raw_text = data.get("text", "")

    if not raw_text:
        return jsonify({"error": "Texto no proporcionado"}), 400

    if not os.path.exists(REF_AUDIO_PATH):
        print(f"❌ Error: No se encontró el archivo '{REF_AUDIO_PATH}' en la carpeta raíz del backend.")
        return jsonify({"error": f"Falta archivo de voz base: {REF_AUDIO_PATH}"}), 404

    try:
        target_text = limpiar_texto_para_f5(raw_text)
        print(f"🎙️ Texto original: '{raw_text}'")
        print(f"🧹 Texto procesado para F5: '{target_text}'")

        # Dividir texto por oraciones
        oraciones = [s.strip() for s in re.split(r'(?<=[.!?])\s+', target_text) if s.strip()]
        if not oraciones:
            oraciones = [target_text]

        fragmentos_audio = []
        sample_rate_final = 24000

        # El ciclo for define 'oracion' para cada iteración
        for i, oracion in enumerate(oraciones):
            if len(oracion) < 2:
                continue
            
            print(f"  ├─ Generando fragmento {i+1}/{len(oraciones)}: '{oracion}'")
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

        # Unir fragmentos
        wav_np = np.concatenate(fragmentos_audio, axis=0)

        # Normalizar volumen
        max_val = np.max(np.abs(wav_np))
        if max_val > 0:
            wav_np = (wav_np / max_val) * 0.95

        wav_tensor = torch.from_numpy(wav_np).unsqueeze(0)
        
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav_tensor, sample_rate_final, format="wav")
        buffer.seek(0)

        print("✅ Audio completo generado en RAM. Enviando a Vite...")
        return send_file(
            buffer,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="narration.wav"
        )

    except Exception as e:
        print("❌ Error en inferencia:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)