from sqlmodel import Session, select
from app.models.models import Conversation, ChatSession, Lead
from typing import List, Optional

class MemoryService:
    @staticmethod
    def add_message(db: Session, session_id: int, role: str, message: str) -> Conversation:
        conversation = Conversation(
            user_id=session_id,
            role=role,
            message=message
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def get_history(db: Session, session_id: int, limit: Optional[int] = None) -> List[Conversation]:
        statement = select(Conversation).where(Conversation.user_id == session_id).order_by(Conversation.timestamp.desc())
        if limit:
            statement = statement.limit(limit)
        
        results = db.exec(statement).all()
        # Return in chronological order
        return sorted(results, key=lambda x: x.timestamp)

    @staticmethod
    def get_context_for_ai(db: Session, session_id: int, limit: int = 10) -> List[dict]:
        # Fetch only the last N messages for AI context
        history = MemoryService.get_history(db, session_id, limit=limit)
        messages = [{"role": conv.role, "content": conv.message} for conv in history]
        
        # Add lead info to context if available
        session_stmt = select(ChatSession).where(ChatSession.id == session_id)
        chat_session = db.exec(session_stmt).first()
        
        if chat_session and chat_session.lead_id:
            lead = db.get(Lead, chat_session.lead_id)
            if lead:
                context_msg = f"User Info: Name={lead.name or 'Unknown'}, Email={lead.email}, Intent={lead.intent or 'Unknown'}."
                messages.insert(0, {"role": "system", "content": f"Context: {context_msg}"})
        
        return messages

    @staticmethod
    def link_session_to_lead(db: Session, session_id: int, lead_id: int):
        session = db.get(ChatSession, session_id)
        if session:
            session.lead_id = lead_id
            db.add(session)
            db.commit()
            db.refresh(session)
        return session
