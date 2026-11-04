from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Request, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database.mongodb import db_manager
from backend.app.database.sqlalchemy_db import init_sql_database

# Routers
from backend.app.api.auth_routes import router as auth_router
from backend.app.api.agent_routes import router as agent_router
from backend.app.api.claim_routes import router as claim_router
from backend.app.api.approval_routes import router as approval_router
from backend.app.api.policy_routes import router as policy_router
from backend.app.api.audit_routes import router as audit_router
from backend.app.api.evaluation_routes import router as evaluation_router
from backend.app.api.dashboard_routes import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and initialize SQLAlchemy ORM tables
    db_manager.connect()
    init_sql_database()
    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    description="A Policy-Governed Framework for Secure and Autonomous AI Agent Execution",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Readiness checks
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": f"connected ({settings.MONGODB_DATABASE})" if db_manager.is_connected else "in_memory_ready"
    }

@app.get("/ready", tags=["Health"])
def readiness_check():
    return {
        "ready": True,
        "trust_boundary": "active",
        "governance_engine": "online"
    }

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@app.websocket("/ws/tasks/{task_id}")
async def websocket_task_stream(websocket: WebSocket, task_id: str):
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "SUBSCRIBED",
            "task_id": task_id,
            "message": "Connected to real-time agent workflow stream."
        })
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "PONG", "echo": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.websocket("/ws/agent-stream")
async def websocket_agent_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "SUBSCRIBED",
            "stream": "global_agent_events",
            "message": "Connected to global agent activity channel."
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# Include REST API Routers under /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(claim_router, prefix="/api/v1")
app.include_router(approval_router, prefix="/api/v1")
app.include_router(policy_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(evaluation_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": str(exc) if settings.APP_ENV == "development" else "An unexpected error occurred",
            "path": str(request.url.path)
        }
    )
