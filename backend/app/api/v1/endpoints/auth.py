from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.api import deps
from app.core.config import settings
from app.db.session import get_session
from app.models.models import User, OTPVerification, Business, Invitation
from app.schemas.token import Token
from app.schemas.user import UserRead, UserCreate, UserCreateInvite, SendOTPRequest, VerifyOTPRequest
from app.services import auth_service

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": auth_service.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/send-otp")
def send_otp(
    *,
    db: Session = Depends(get_session),
    req: SendOTPRequest,
) -> Any:
    """
    Send OTP to email for verification.
    OTP length is configured via OTP_DIGITS env var (default: 6).
    """
    existing_otps = db.exec(select(OTPVerification).where(
        OTPVerification.email == req.email,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    )).all()
    for otp in existing_otps:
        otp.expires_at = datetime.utcnow()

    otp_code = auth_service.generate_otp(settings.OTP_DIGITS)
    otp = OTPVerification(email=req.email, code=otp_code)
    db.add(otp)
    db.commit()

    auth_service.send_otp_email(req.email, otp_code)
    return {"message": "OTP sent successfully", "digits": settings.OTP_DIGITS}

@router.post("/verify-otp")
def verify_otp(
    *,
    db: Session = Depends(get_session),
    req: VerifyOTPRequest,
) -> Any:
    """
    Verify OTP code.
    """
    otp = db.exec(select(OTPVerification).where(
        OTPVerification.email == req.email,
        OTPVerification.code == req.code,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    )).first()
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp.is_used = True
    db.add(otp)
    db.commit()
    return {"message": "OTP verified successfully"}

@router.post("/signup", response_model=UserRead)
def create_user(
    *,
    db: Session = Depends(get_session),
    user_in: UserCreate,
) -> Any:
    """
    Create new user and a new business for them.
    """
    user = db.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Generate business slug and check for existence
    biz_slug = f"biz-{user_in.email.replace('@', '-').replace('.', '-')}"
    existing_biz = db.exec(select(Business).where(Business.slug == biz_slug)).first()
    if existing_biz:
         raise HTTPException(
            status_code=400,
            detail="A business with this email/slug already exists.",
        )

    # Create Business first
    biz_name = f"{user_in.full_name or 'My'}'s Business"
    
    new_biz = Business(
        name=biz_name,
        slug=biz_slug,
        employee_name="Aria"
    )
    db.add(new_biz)
    db.commit()
    db.refresh(new_biz)
    
    db_user = User(
        email=user_in.email,
        hashed_password=auth_service.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="owner", # Every signup is an owner of their own biz
        business_id=new_biz.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/signup-invite", response_model=UserRead)
def create_user_invite(
    *,
    db: Session = Depends(get_session),
    user_in: UserCreateInvite,
) -> Any:
    """
    Create new user from an invitation.
    """
    invite = db.exec(select(Invitation).where(Invitation.token == user_in.token)).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if invite.is_used:
        raise HTTPException(status_code=400, detail="Invitation already used")
    
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation expired")
    
    existing_user = db.exec(select(User).where(User.email == invite.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    db_user = User(
        email=invite.email,
        hashed_password=auth_service.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=invite.role,
        business_id=invite.business_id
    )
    db.add(db_user)
    
    invite.is_used = True
    db.add(invite)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/invite-info/{token}")
def get_invite_info(token: str, db: Session = Depends(get_session)):
    invite = db.exec(select(Invitation).where(Invitation.token == token)).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if invite.is_used:
        raise HTTPException(status_code=400, detail="Invitation already used")
    
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation expired")
        
    return {
        "email": invite.email,
        "business_name": invite.business.name,
        "role": invite.role
    }
