FROM python:3.11-slim
 
WORKDIR /app
 
# System deps for faiss
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*
 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . .
 
EXPOSE 8000
 
# Note: No model pre-download step needed — embeddings are generated via
# the OpenAI API at runtime, so there is no local model to cache.
 
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
 