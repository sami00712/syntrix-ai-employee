from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api import deps
from app.db.session import get_session
from app.models.models import Lead, ChatSession, User
from app.schemas.chat import SessionRead, MessageRead
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    intent: Optional[str] = None
    business_type: Optional[str] = None
    requested_service: Optional[str] = None

@router.get("/", response_model=List[Lead])
def read_leads(
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    return db.exec(
        select(Lead)
        .where(Lead.business_id == current_admin.business_id)
        .order_by(Lead.created_at.desc())
    ).all()

@router.get("/{lead_id}", response_model=Lead)
def read_lead(
    lead_id: int, 
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    lead = db.get(Lead, lead_id)
    if not lead or lead.business_id != current_admin.business_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.patch("/{lead_id}", response_model=Lead)
def update_lead(
    lead_id: int, 
    update_data: LeadUpdate, 
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    lead = db.get(Lead, lead_id)
    if not lead or lead.business_id != current_admin.business_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if update_data.status and update_data.status not in ["new", "contacted", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.get("/{lead_id}/sessions", response_model=List[SessionRead])
def get_lead_sessions(
    lead_id: int, 
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    lead = db.get(Lead, lead_id)
    if not lead or lead.business_id != current_admin.business_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # sessions are already available via relationship
    sessions_read = []
    for session in lead.sessions:
        conversations = [
            MessageRead(role=c.role, message=c.message, timestamp=c.timestamp)
            for c in sorted(session.conversations, key=lambda x: x.timestamp)
        ]
        sessions_read.append(SessionRead(
            id=session.id,
            lead_id=session.lead_id,
            created_at=session.created_at,
            conversations=conversations
        ))
    return sessions_read

@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int, 
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    lead = db.get(Lead, lead_id)
    if not lead or lead.business_id != current_admin.business_id:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}
