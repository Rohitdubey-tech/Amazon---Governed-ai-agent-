from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class UserRegister(BaseModel):
    email: str = Field(..., min_length=5, pattern=r"^[^@]+@[^@]+\.[^@]+$")
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    department: Optional[str] = "Product Engineering"

class UserLogin(BaseModel):
    email: str = Field(..., min_length=5)
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    department: str
    status: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
