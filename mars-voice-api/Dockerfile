FROM python:3.10-slim

# Librerías de audio requeridas por torchaudio y soundfile en Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Instalar PyTorch versión CPU (reduce el tamaño de la imagen en ~4 GB)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# 2. Instalar el resto de dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Pre-descargar los pesos del modelo F5-TTS dentro de la imagen
RUN python -c "from f5_tts.api import F5TTS; F5TTS()"

# 4. Copiar app.py y AI_Ranni.wav
COPY . .

ENV OMP_NUM_THREADS=8
ENV PYTHONUNBUFFERED=1

# Arranca con 1 worker para mantener el modelo cargado una sola vez en RAM
CMD exec gunicorn --bind :$PORT --workers 1 --threads 4 --timeout 300 app:app