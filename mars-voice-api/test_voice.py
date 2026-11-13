import io
import os
import torch
import torchaudio
import soundfile as sf

# ==========================================================
# PARCHES SOUNDFILE PARA OMITIR TORCHCODEC
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
# ==========================================================

from f5_tts.api import F5TTS

print("Cargando F5-TTS...")
tts = F5TTS()

# Asegúrate de que REF_TEXT coincida con la primera frase de tu AI_Ranni.wav
ref_audio = "AI_Ranni.wav"
ref_text = "Hello Tarnished, my name is Rani. I am a witch in the video game Elden Ring."
gen_text = "Testing voice synthesis for Mars navigation system."

print("Sintetizando prueba corta...")
wav, sr, _ = tts.infer(
    ref_file=ref_audio,
    ref_text=ref_text,
    gen_text=gen_text,
    nfe_step=32
)

# Guardar en PCM 16-bit
sf.write("resultado_test.wav", wav, sr, format='WAV', subtype='PCM_16')
print("✅ Archivo 'resultado_test.wav' guardado correctamente.")