from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from app.api import deps
from app.db.session import get_session, engine
from app.models.models import Conversation, ChatSession, Lead, User, Business
from app.services.ai_service import get_chat_response, extract_lead_info, get_system_prompt
from app.services.memory_service import MemoryService
from app.schemas.chat import ChatRequest, ChatResponse, MessageRead
from typing import List

router = APIRouter()

async def process_lead_extraction(session_id: int):
    """Background task to extract lead info and link session."""
    # Create a new session for background processing to avoid thread issues
    with Session(engine) as db:
        chat_session = db.get(ChatSession, session_id)
        if not chat_session:
            return

        # Use full history for extraction to be more accurate
        full_history = MemoryService.get_history(db, session_id)
        extraction_messages = [{"role": m.role, "content": m.message} for m in full_history]
        
        lead_data = await extract_lead_info(extraction_messages)
        if lead_data and lead_data.get("email"):
            # Check if lead exists
            lead_stmt = select(Lead).where(Lead.email == lead_data["email"])
            existing_lead = db.exec(lead_stmt).first()
            
            lead_id = None
            if existing_lead:
                # Update existing lead with new info
                for key, value in lead_data.items():
                    if value and hasattr(existing_lead, key):
                        setattr(existing_lead, key, value)
                db.add(existing_lead)
                db.commit()
                db.refresh(existing_lead)
                lead_id = existing_lead.id
            else:
                new_lead = Lead(**lead_data)
                db.add(new_lead)
                db.commit()
                db.refresh(new_lead)
                lead_id = new_lead.id
            
            # Link session to lead if not already linked
            if chat_session.lead_id != lead_id:
                MemoryService.link_session_to_lead(db, session_id, lead_id)

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    # 1. Verify session exists
    chat_session = db.get(ChatSession, request.session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get system prompt from business or fallback
    system_prompt = get_system_prompt()
    
    # Use system prompt from request if provided (useful for preview)
    if request.system_prompt:
        system_prompt = request.system_prompt
    elif chat_session.business_id:
        business = db.get(Business, chat_session.business_id)
        if business and business.system_prompt:
            system_prompt = business.system_prompt

    # 2. Save user message
    MemoryService.add_message(db, request.session_id, "user", request.message)

    # 3. Prepare messages for LLM with limited context window (last 10)
    llm_messages = MemoryService.get_context_for_ai(db, request.session_id, limit=10)

    # 4. Get AI response
    reply_content = await get_chat_response(llm_messages, system_prompt_content=system_prompt)
    
    # 5. Save assistant message
    MemoryService.add_message(db, request.session_id, "assistant", reply_content)

    # 6. Queue lead extraction in the background
    background_tasks.add_task(process_lead_extraction, request.session_id)
    
    return ChatResponse(reply=reply_content)

@router.get("/", response_model=List[ChatSession])
def read_sessions(
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    return db.exec(
        select(ChatSession)
        .where(ChatSession.business_id == current_admin.business_id)
        .order_by(ChatSession.created_at.desc())
    ).all()

@router.get("/{session_id}/history", response_model=List[MessageRead])
async def get_session_history(
    session_id: int, 
    db: Session = Depends(get_session),
    current_admin: User = Depends(deps.get_current_active_admin)
):
    chat_session = db.get(ChatSession, session_id)
    if not chat_session or chat_session.business_id != current_admin.business_id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    history = MemoryService.get_history(db, session_id)
    return [MessageRead(role=m.role, message=m.message, timestamp=m.timestamp) for m in history]

@router.post("/session", response_model=ChatSession)
def create_session(db: Session = Depends(get_session)):
    session = ChatSession()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
