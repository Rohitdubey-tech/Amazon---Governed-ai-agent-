FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (handles both root context and backend/ context)
COPY requirements.txt* backend/requirements.txt* /tmp/
RUN if [ -f "/tmp/requirements.txt" ]; then pip install --no-cache-dir -r /tmp/requirements.txt; elif [ -f "/tmp/backend/requirements.txt" ]; then pip install --no-cache-dir -r /tmp/backend/requirements.txt; fi

# Copy application source
COPY . /tmp/src/
RUN if [ -d "/tmp/src/backend" ]; then \
      cp -r /tmp/src/backend /app/backend; \
    elif [ -d "/tmp/src/app" ]; then \
      mkdir -p /app/backend && cp -r /tmp/src/* /app/backend/; \
    fi && rm -rf /tmp/src

ENV PYTHONPATH=/app
ENV APP_ENV=production
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
