from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlmodel import Session, select
from app.api import deps
from app.db.session import get_session
from app.models.models import Business, User
from pydantic import BaseModel
from typing import Optional
import os
import uuid
import shutil

router = APIRouter()

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    system_prompt: Optional[str] = None
    employee_name: Optional[str] = None
    welcome_message: Optional[str] = None
    primary_color: Optional[str] = None
    button_color: Optional[str] = None
    header_color: Optional[str] = None
    text_color: Optional[str] = None
    background_color: Optional[str] = None
    widget_icon: Optional[str] = None
    logo_url: Optional[str] = None
    onboarding_completed: Optional[bool] = None

from app.models.models import Business, User, Lead, ChatSession
from sqlmodel import func

@router.get("/stats")
def get_business_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_staff)
):
    business_id = current_user.business_id
    
    total_leads = db.exec(select(func.count(Lead.id)).where(Lead.business_id == business_id)).one()
    total_chats = db.exec(select(func.count(ChatSession.id)).where(ChatSession.business_id == business_id)).one()
    new_leads = db.exec(select(func.count(Lead.id)).where(Lead.business_id == business_id, Lead.status == "new")).one()
    
    return {
        "total_leads": total_leads,
        "total_chats": total_chats,
        "new_leads": new_leads
    }

@router.get("/me")
def get_my_business(
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_staff)
):
    business = db.get(Business, current_user.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.patch("/me")
def update_my_business(
    update_data: BusinessUpdate,
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    business = db.get(Business, current_admin.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(business, key, value)
    
    db.add(business)
    db.commit()
    db.refresh(business)
    return business

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join("static/uploads", filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative URL
    return {"logo_url": f"/static/uploads/{filename}"}
