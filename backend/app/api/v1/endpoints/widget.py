from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header, Body
from sqlmodel import Session, select
from app.db.session import get_session, engine
from app.models.models import Conversation, ChatSession, Lead, Business
from app.services.ai_service import get_chat_response, extract_lead_info
from app.services.memory_service import MemoryService
from app.schemas.chat import ChatRequest, ChatResponse, MessageRead
from typing import List, Optional

router = APIRouter()

@router.get("/config/{api_key}")
async def get_widget_config(api_key: str, db: Session = Depends(get_session)):
    business = db.exec(select(Business).where(Business.api_key == api_key)).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return {
        "business_name": business.name,
        "employee_name": business.employee_name,
        "primary_color": business.primary_color,
        "button_color": business.button_color,
        "header_color": business.header_color,
        "text_color": business.text_color,
        "background_color": business.background_color,
        "widget_icon": business.widget_icon,
        "welcome_message": business.welcome_message,
        "logo_url": business.logo_url,
        "api_key": business.api_key
    }

@router.get("/{session_id}/history", response_model=List[MessageRead])
async def get_widget_session_history(
    session_id: int, 
    db: Session = Depends(get_session)
):
    chat_session = db.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    history = MemoryService.get_history(db, session_id)
    return [MessageRead(role=m.role, message=m.message, timestamp=m.timestamp) for m in history]

@router.post("/session", response_model=ChatSession)
def create_widget_session(api_key: str = Body(...), db: Session = Depends(get_session)):
    business = db.exec(select(Business).where(Business.api_key == api_key)).first()
    if not business:
        raise HTTPException(status_code=404, detail="Invalid API Key")
    
    session = ChatSession(business_id=business.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/chat", response_model=ChatResponse)
async def widget_chat(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    # 1. Verify session exists and get business prompt
    chat_session = db.get(ChatSession, request.session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    business = db.get(Business, chat_session.business_id)
    system_prompt = business.system_prompt if business else "You are a helpful AI assistant."

    # 2. Save user message
    MemoryService.add_message(db, request.session_id, "user", request.message)

    # 3. Prepare messages for LLM
    llm_messages = MemoryService.get_context_for_ai(db, request.session_id, limit=10)

    # 4. Get AI response with business prompt
    reply_content = await get_chat_response(llm_messages, system_prompt_content=system_prompt)
    
    # 5. Save assistant message
    MemoryService.add_message(db, request.session_id, "assistant", reply_content)

    # 6. Queue lead extraction (Modified to be business-aware)
    background_tasks.add_task(process_widget_lead_extraction, request.session_id, chat_session.business_id)
    
    return ChatResponse(reply=reply_content)

async def process_widget_lead_extraction(session_id: int, business_id: int):
    """Background task to extract lead info and link to business."""
    with Session(engine) as db:
        chat_session = db.get(ChatSession, session_id)
        if not chat_session: return

        full_history = MemoryService.get_history(db, session_id)
        extraction_messages = [{"role": m.role, "content": m.message} for m in full_history]
        
        lead_data = await extract_lead_info(extraction_messages)
        if lead_data and lead_data.get("email"):
            # Ensure lead is unique per business
            lead_stmt = select(Lead).where(
                Lead.email == lead_data["email"], 
                Lead.business_id == business_id
            )
            existing_lead = db.exec(lead_stmt).first()
            
            if existing_lead:
                for key, value in lead_data.items():
                    if value and hasattr(existing_lead, key):
                        setattr(existing_lead, key, value)
                db.add(existing_lead)
                db.commit()
                db.refresh(existing_lead)
                lead_id = existing_lead.id
            else:
                new_lead = Lead(**lead_data, business_id=business_id)
                db.add(new_lead)
                db.commit()
                db.refresh(new_lead)
                lead_id = new_lead.id
            
            if chat_session.lead_id != lead_id:
                MemoryService.link_session_to_lead(db, session_id, lead_id)
