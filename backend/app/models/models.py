from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from sqlmodel import Field, Relationship, SQLModel

class Business(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    api_key: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    system_prompt: str = Field(default="You are a helpful AI assistant.")
    employee_name: str = Field(default="Assistant")
    welcome_message: str = Field(default="Hello! How can I help you today?")
    primary_color: str = Field(default="#4F46E5")
    button_color: str = Field(default="#4F46E5")
    header_color: str = Field(default="#4F46E5")
    text_color: str = Field(default="#FFFFFF")
    background_color: str = Field(default="#FFFFFF")
    widget_icon: str = Field(default="bot") # 'bot' or 'message'
    logo_url: Optional[str] = None
    onboarding_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    users: List["User"] = Relationship(back_populates="business")
    leads: List["Lead"] = Relationship(back_populates="business")
    sessions: List["ChatSession"] = Relationship(back_populates="business")
    invitations: List["Invitation"] = Relationship(back_populates="business")

class ChatSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: Optional[int] = Field(default=None, foreign_key="business.id", index=True)
    lead_id: Optional[int] = Field(default=None, foreign_key="lead.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    business: Optional[Business] = Relationship(back_populates="sessions")
    conversations: List["Conversation"] = Relationship(back_populates="session")
    lead: Optional["Lead"] = Relationship(back_populates="sessions")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: Optional[int] = Field(default=None, foreign_key="business.id", index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="staff") # 'owner', 'admin', 'staff'
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    business: Optional[Business] = Relationship(back_populates="users")

class Invitation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    email: str = Field(index=True)
    role: str = Field(default="admin") # 'admin', 'staff'
    token: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=7))
    is_used: bool = Field(default=False)
    
    business: Business = Relationship(back_populates="invitations")

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="chatsession.id", index=True) # Maps to session ID for storage
    role: str  # 'user' or 'assistant'
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    session: ChatSession = Relationship(back_populates="conversations")

class Lead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    email: str = Field(index=True)
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    intent: Optional[str] = None
    business_type: Optional[str] = None
    requested_service: Optional[str] = None
    status: str = Field(default="new") # 'new', 'contacted', 'closed'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    business: Business = Relationship(back_populates="leads")
    sessions: List["ChatSession"] = Relationship(back_populates="lead")

class Testimonial(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    user_name: str = Field(default="")
    business_name: str = Field(default="")
    content: str
    rating: int = Field(default=5)
    is_approved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    business: Business = Relationship()
    user: "User" = Relationship()

class OTPVerification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    code: str
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=10))
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
