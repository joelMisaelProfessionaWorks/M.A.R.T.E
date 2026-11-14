FROM python:3.10-slim

# Librerías de sistema requeridas por torchaudio, soundfile y compilación ligera
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Ruta fija para que el caché de HuggingFace persista dentro de la imagen
ENV HF_HOME=/app/.cache/huggingface
ENV OMP_NUM_THREADS=8
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# 1. Instalar PyTorch CPU + dependencias manteniendo el índice CPU
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# 2. Pre-descargar los pesos del modelo F5-TTS y Vocos dentro de la imagen
RUN python -c "from f5_tts.api import F5TTS; F5TTS(device='cpu')"

# 3. Copiar código y audio base AI_Ranni.wav
COPY . .

# 4. Arrancar Gunicorn (1 worker en RAM, 4 hilos HTTP)
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --threads 4 --timeout 300 app:app