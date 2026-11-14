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
# SOUNDFILE PATCHES AND TEXT NORMALIZATION
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

def clean_text_for_f5(text):
    text_nfd = unicodedata.normalize('NFD', text)
    text_no_accents = ''.join(c for c in text_nfd if unicodedata.category(c) != 'Mn')
    cleaned_text = text_no_accents.replace('ñ', 'n').replace('Ñ', 'N')
    cleaned_text = re.sub(r'[^a-zA-Z0-9\s.,?!]', '', cleaned_text)
    return cleaned_text.strip()

from f5_tts.api import F5TTS

try:
    torchaudio.set_audio_backend("soundfile")
except Exception:
    pass

app = Flask(__name__)
CORS(app)

print("Loading F5-TTS model into memory...")
tts_engine = F5TTS()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO_PATH = os.path.join(BASE_DIR, "AI_Ranni.wav")

# Ensure this text matches the first sentence of your AI_Ranni.wav (6-8 seconds)
REF_TEXT = "Hello Tarnished, my name is Rani. I am a witch in the video game Elden Ring."

@app.route('/', methods=['GET'])
def health_check():
    return "🚀 Mars Voice Server Ready", 200

@app.route('/api/narrate', methods=['POST'])
def narrate():
    data = request.json or {}
    raw_text = data.get("text", "")

    if not raw_text:
        return jsonify({"error": "No text provided"}), 400

    if not os.path.exists(REF_AUDIO_PATH):
        print(f"❌ Error: Base voice file not found at '{REF_AUDIO_PATH}'.")
        return jsonify({"error": f"Base voice file missing: {REF_AUDIO_PATH}"}), 404

    try:
        target_text = clean_text_for_f5(raw_text)
        print(f"🎙️ Original text: '{raw_text}'")
        print(f"🧹 Processed text for F5: '{target_text}'")

        # Split text into sentences
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', target_text) if s.strip()]
        if not sentences:
            sentences = [target_text]

        audio_chunks = []
        final_sample_rate = 24000

        # Synthesize each sentence individually to keep latency low
        for i, sentence in enumerate(sentences):
            if len(sentence) < 2:
                continue

            print(f"  ├─ Generating chunk {i+1}/{len(sentences)}: '{sentence}'")
            wav_chunk, sr, _ = tts_engine.infer(
                ref_file=REF_AUDIO_PATH,
                ref_text=REF_TEXT,
                gen_text=sentence,
                nfe_step=8,
                cfg_strength=1.5
            )
            audio_chunks.append(wav_chunk)
            final_sample_rate = sr

        if not audio_chunks:
            return jsonify({"error": "Could not synthesize text"}), 500

        # Concatenate audio chunks
        wav_np = np.concatenate(audio_chunks, axis=0)

        # Normalize output volume
        max_val = np.max(np.abs(wav_np))
        if max_val > 0:
            wav_np = (wav_np / max_val) * 0.95

        wav_tensor = torch.from_numpy(wav_np).unsqueeze(0)

        buffer = io.BytesIO()
        torchaudio.save(buffer, wav_tensor, final_sample_rate, format="wav")
        buffer.seek(0)

        print("✅ Full audio generated in RAM. Sending to Vite...")
        return send_file(
            buffer,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="narration.wav"
        )

    except Exception as e:
        print("❌ Inference error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)