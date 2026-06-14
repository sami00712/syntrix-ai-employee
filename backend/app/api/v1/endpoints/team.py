from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.api import deps
from app.db.session import get_session
from app.models.models import User, Business, Invitation
from app.schemas.user import UserRead, InviteRequest, TeamMemberUpdate

router = APIRouter()

@router.get("/", response_model=List[UserRead])
def get_team_members(
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """
    List all team members for the current business.
    """
    return db.exec(
        select(User).where(User.business_id == current_user.business_id)
    ).all()

@router.post("/invite", response_model=Any)
def invite_team_member(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_owner),
    invite_in: InviteRequest
) -> Any:
    """
    Invite a new team member.
    """
    # Check if user already exists
    existing_user = db.exec(select(User).where(User.email == invite_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
        
    # Check for existing active invite
    existing_invite = db.exec(
        select(Invitation).where(
            Invitation.email == invite_in.email,
            Invitation.business_id == current_user.business_id,
            Invitation.is_used == False
        )
    ).first()
    
    if existing_invite:
        # Check if expired
        from datetime import datetime
        if existing_invite.expires_at > datetime.utcnow():
            return {"message": "Invitation already sent", "token": existing_invite.token}
        else:
            db.delete(existing_invite)
            db.commit()

    invite = Invitation(
        business_id=current_user.business_id,
        email=invite_in.email,
        role=invite_in.role
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    
    # In a real app, you would send an email here
    return {"message": "Invitation sent successfully", "token": invite.token}

@router.get("/invites", response_model=List[Any])
def list_invitations(
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """
    List pending invitations for the current business.
    """
    return db.exec(
        select(Invitation).where(
            Invitation.business_id == current_user.business_id,
            Invitation.is_used == False
        )
    ).all()

@router.delete("/invites/{invite_id}")
def revoke_invitation(
    invite_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_owner)
) -> Any:
    """
    Revoke an invitation.
    """
    invite = db.get(Invitation, invite_id)
    if not invite or invite.business_id != current_user.business_id:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    db.delete(invite)
    db.commit()
    return {"message": "Invitation revoked"}

@router.patch("/{user_id}", response_model=UserRead)
def update_team_member_role(
    user_id: int,
    update_data: TeamMemberUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_owner)
) -> Any:
    """
    Update a team member's role.
    """
    user = db.get(User, user_id)
    if not user or user.business_id != current_user.business_id:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    user.role = update_data.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def remove_team_member(
    user_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_active_owner)
) -> Any:
    """
    Remove a team member from the business.
    """
    user = db.get(User, user_id)
    if not user or user.business_id != current_user.business_id:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
        
    db.delete(user)
    db.commit()
    return {"message": "Member removed successfully"}
