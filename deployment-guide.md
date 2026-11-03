# Deployment & Operations Guide — AgentShield AI

## 1. Environment Prerequisites

AgentShield AI is packaged as a modular monolith designed for frictionless local execution and containerized cloud deployment:

- **Python Runtime:** Python 3.10+ (Standard virtual environment)
- **Node.js Runtime:** Node.js v18+ / npm v9+
- **Database:** MongoDB Atlas (Cloud) or local MongoDB Community Server (v6.0+)
- **Optional Containerization:** Docker Engine 24+ & Docker Compose v2+

---

## 2. Configuration & Environment Variables

Create a root `.env` file based on `.env.example`:

```bash
# Application Environment
APP_ENV=development
APP_SECRET_KEY=generate-a-secure-random-64-character-secret
JWT_SECRET_KEY=generate-a-secure-random-64-character-jwt-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Persistence Layer
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/
MONGODB_DATABASE=agentshield_ai

# LLM Configuration
# Options: "mock" (offline/deterministic for tests) or "gemini" (live multimodal)
LLM_PROVIDER=mock
GEMINI_API_KEY=AIzaSy...

# Network & Storage
FRONTEND_ORIGIN=http://localhost:5173
STORAGE_MODE=local
LOCAL_STORAGE_PATH=./storage
```

---

## 3. Local Development Setup (Step-by-Step)

### Step 1: Clone Repository & Create Virtual Environment
```bash
git clone https://github.com/your-org/agentshield-ai.git
cd agentshield-ai

# Backend environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### Step 2: Initialize Database & Seed Policies
```bash
# Seed initial organization policies and verify MongoDB connection
python -m backend.app.database.indexes
```

### Step 3: Run Automated Test & Evaluation Suite
```bash
# Execute unit & governance security tests
pytest backend/tests/ -v

# Run the 50-task evaluation benchmark
python -m eval.run_eval
```

### Step 4: Launch Backend API Server
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
# API Documentation will be available at: http://localhost:8000/docs
```

### Step 5: Launch React Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard accessible at: http://localhost:5173
```

---

## 4. Docker Deployment

AgentShield AI includes full containerization via `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/agentshield_ai
      - LLM_PROVIDER=mock
    depends_on:
      - mongo
    volumes:
      - receipt_storage:/app/storage

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
  receipt_storage:
```

### Run with Docker Compose:
```bash
docker-compose up --build -d
```

---

## 5. Health Checks & Smoke Tests

Verify system readiness using the standard health probe:

```bash
curl -X GET http://localhost:8000/health
```
**Expected Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "llm_provider": "mock",
  "version": "1.0.0"
}
```
