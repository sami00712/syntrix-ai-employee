from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MessageRead(BaseModel):
    role: str
    message: str
    timestamp: datetime

class ChatRequest(BaseModel):
    session_id: int
    message: str
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class SessionRead(BaseModel):
    id: int
    lead_id: Optional[int]
    created_at: datetime
    conversations: List[MessageRead]
