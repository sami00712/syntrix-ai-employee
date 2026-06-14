from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str = "staff"
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserCreateInvite(BaseModel):
    token: str
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None

class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "staff"

class TeamMemberUpdate(BaseModel):
    role: str

class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
