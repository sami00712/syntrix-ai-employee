from fastapi import APIRouter
from app.api.v1.endpoints import chat, leads, auth, widget, business, team, feedback

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(widget.router, prefix="/widget", tags=["widget"])
api_router.include_router(business.router, prefix="/business", tags=["business"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(feedback.router, prefix="", tags=["feedback"])
