from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import ChatbotChat, ChatMessage
from pydantic import BaseModel
from uuid import UUID
# from chatbot.app.model import generate_reply

router = APIRouter(
    tags=["chat"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post('/chat/', response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """Relay the user's message to the Gemini model and return its reply."""
    try:
        # reply_text = generate_reply(payload.message)
        reply_text = "This is a placeholder reply."
        return ChatResponse(reply=reply_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get('/chats/{owner_id}', response_model=list[ChatbotChat])
def get_chats_by_owner(*, owner_id: int, session: Session = Depends(get_session)):
    chats = session.exec(select(ChatbotChat).where(ChatbotChat.owner_id == owner_id)).all()
    return chats

@router.post('/chats', response_model=ChatbotChat)
def create_chat(*, session: Session = Depends(get_session), chat: ChatbotChat):
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

@router.get('/chats/{chat_id}/messages', response_model=list[ChatMessage])
def get_messages_by_chat(*, chat_id: UUID, session: Session = Depends(get_session)):
    messages = session.exec(select(ChatMessage).where(ChatMessage.chat_id == chat_id)).all()
    return messages

@router.post('/chats/{chat_id}/messages', response_model=ChatMessage)
def create_message_for_chat(*, chat_id: UUID, message: ChatMessage, session: Session = Depends(get_session)):
    message.chat_id = chat_id
    session.add(message)
    session.commit()
    session.refresh(message)
    return message
