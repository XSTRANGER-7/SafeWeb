FROM python:3.12-slim

WORKDIR /app

# Install OS deps if needed
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend_api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project (src and model are required)
COPY src /app/src
COPY model /app/model
COPY backend_api /app/backend_api

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

CMD ["python", "-m", "backend_api.main"]


