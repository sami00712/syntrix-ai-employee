from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import get_current_user, get_current_active_staff
from app.db.session import get_session
from app.models.models import Testimonial, User

router = APIRouter()

@router.get("/feedback", response_model=List[dict])
def list_feedback(session: Session = Depends(get_session)):
    testimonials = session.exec(
        select(Testimonial).where(Testimonial.is_approved == True).order_by(Testimonial.created_at.desc())
    ).all()
    return [
        {
            "id": t.id,
            "user_name": t.user_name,
            "business_name": t.business_name,
            "content": t.content,
            "rating": t.rating,
            "created_at": t.created_at.isoformat()
        }
        for t in testimonials
    ]

@router.post("/feedback", response_model=dict)
def create_feedback(
    user_name: str,
    business_name: str,
    content: str,
    rating: int = 5,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Feedback content is required")
    
    testimonial = Testimonial(
        business_id=current_user.business_id,
        user_id=current_user.id,
        user_name=user_name or current_user.full_name or current_user.email.split('@')[0],
        business_name=business_name or "",
        content=content,
        rating=rating,
        is_approved=True
    )
    session.add(testimonial)
    session.commit()
    session.refresh(testimonial)
    return {
        "id": testimonial.id,
        "user_name": testimonial.user_name,
        "business_name": testimonial.business_name,
        "content": testimonial.content,
        "rating": testimonial.rating,
        "created_at": testimonial.created_at.isoformat()
    }
