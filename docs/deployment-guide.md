# Deployment & Configuration Guide — AgentShield AI

## 1. Quick Local Start (Zero External Dependencies)

AgentShield AI includes thread-safe, in-memory repository fallbacks and mock LLM provider modes so you can test the entire platform without requiring live cloud databases or paid API keys.

### 1.1 Backend Setup
```bash
# Clone and enter directory
cd "AgentShield Ai"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Run backend with uvicorn
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
* **Health Check**: `http://localhost:8000/health`
* **Readiness Check**: `http://localhost:8000/ready`

### 1.2 Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend dev server
npm run dev
```
* **Frontend UI Dashboard**: `http://localhost:5173`

---

## 2. Docker Compose Deployment (Production Monolith)

AgentShield AI is containerized with multi-stage Docker builds:

```bash
# Start MongoDB, FastAPI backend, and Nginx frontend
docker-compose up --build -d
```

Services exposed:
* **Frontend UI**: `http://localhost:3000`
* **FastAPI Backend**: `http://localhost:8000`
* **MongoDB**: `localhost:27017`

---

## 3. Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```dotenv
# Runtime Environment
APP_ENV=production
APP_SECRET_KEY=generate_a_random_32_char_secret_key_here
JWT_SECRET_KEY=generate_another_random_jwt_secret_key_here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# MongoDB Atlas (Optional: leave blank for built-in in-memory fallback)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=agentshield_ai

# Google Gemini API (Optional: leave blank for deterministic local provider mode)
GEMINI_API_KEY=

# CORS Allowed Origins
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3000

# File Storage Configuration
STORAGE_MODE=local
LOCAL_STORAGE_PATH=./storage
```

---

## 4. Deployed Smoke-Test Checklist

Run this command to execute the automated test suite against the backend:

```bash
# Run pytest verification
python3 -m pytest backend/tests

# Run 50-case benchmark harness
PYTHONPATH=. python3 backend/evaluation/benchmark_runner.py
```

