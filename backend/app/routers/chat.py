from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from app.db import get_session
from app.models import ChatbotChat, ChatMessage, Primary_Care_Giver
from app.services.context_aggregator import ChildContextAggregator
from app.services.rag_service import RAGService
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
import os
import json

router = APIRouter(
    tags=["chat"],
)

class ChatRequest(BaseModel):
    message: str
    child_id: Optional[int] = None
    
class ContextualChatRequest(BaseModel):
    message: str
    child_id: int  # Single child
    carer_id: int

class ChatCreateRequest(BaseModel):
    title: str = "New Chat"
    child_id: int | None = None  # Single child to associate with this chat

class ChatResponse(BaseModel):
    reply: str
    context_used: Optional[str] = None
    sources: Optional[list] = None
    response_type: Optional[str] = None

# Initialize RAG service (singleton pattern)
rag_service = None

def get_rag_service():
    global rag_service
    if rag_service is None:
        try:
            rag_service = RAGService()
            knowledge_base_path = os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge_base.json')
            rag_service.initialize_knowledge_base(knowledge_base_path)
        except Exception as e:
            print(f"Error initializing RAG service: {e}")
    return rag_service

@router.post('/chat/', response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """Basic chat endpoint (non-contextual)"""
    try:
        rag = get_rag_service()
        if not rag:
            return ChatResponse(reply="AI service is currently unavailable. Please try again later.")
        
        # Simple response without child context
        result = rag.get_contextual_response(payload.message, "General pediatric consultation")
        
        return ChatResponse(
            reply=result["response"],
            sources=result.get("sources", []),
            response_type=result.get("response_type", "general")
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/chat/stream')
def chat_stream_endpoint(payload: ChatRequest):
    """Basic streaming chat endpoint (non-contextual)"""
    try:
        rag = get_rag_service()
        if not rag:
            def error_stream():
                yield f"data: {json.dumps({'content': 'AI service is currently unavailable. Please try again later.', 'done': True, 'error': True})}\n\n"
            return StreamingResponse(error_stream(), media_type="text/plain")
        
        def generate_response():
            try:
                for chunk in rag.stream_contextual_response(payload.message, "General pediatric consultation"):
                    yield f"data: {json.dumps(chunk)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'content': 'Error generating response', 'done': True, 'error': True})}\n\n"
        
        return StreamingResponse(generate_response(), media_type="text/plain")
    except Exception as exc:
        def error_stream():
            yield f"data: {json.dumps({'content': str(exc), 'done': True, 'error': True})}\n\n"
        return StreamingResponse(error_stream(), media_type="text/plain")

@router.post('/chat/contextual', response_model=ChatResponse)
def contextual_chat_endpoint(payload: ContextualChatRequest, session: Session = Depends(get_session)):
    """Contextual chat endpoint with single child"""
    try:
        # Verify carer exists
        carer = session.exec(
            select(Primary_Care_Giver).where(Primary_Care_Giver.id == payload.carer_id)
        ).first()
        
        if not carer:
            raise HTTPException(status_code=404, detail="Caregiver not found")
        
        # Get context for the single child
        context_aggregator = ChildContextAggregator(session)
        child_context = context_aggregator.get_context_for_chatbot(
            payload.child_id, payload.carer_id
        )
        
        if "Child not found" in child_context:
            raise HTTPException(status_code=404, detail=f"Child {payload.child_id} not found or access denied")
        
        # Get RAG response with child context
        rag = get_rag_service()
        if not rag:
            return ChatResponse(reply="AI service is currently unavailable. Please try again later.")
        
        result = rag.get_contextual_response(payload.message, child_context)
        
        return ChatResponse(
            reply=result["response"],
            context_used=child_context,
            sources=result.get("sources", []),
            response_type=result.get("response_type", "general")
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Error in contextual chat: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post('/chat/contextual/stream')
def contextual_chat_stream_endpoint(payload: ContextualChatRequest, session: Session = Depends(get_session)):
    """Contextual streaming chat endpoint with single child"""
    try:
        # Verify carer exists
        carer = session.exec(
            select(Primary_Care_Giver).where(Primary_Care_Giver.id == payload.carer_id)
        ).first()
        
        if not carer:
            def error_stream():
                yield f"data: {json.dumps({'content': 'Caregiver not found', 'done': True, 'error': True})}\n\n"
            return StreamingResponse(error_stream(), media_type="text/plain")
        
        # Get context for the single child
        context_aggregator = ChildContextAggregator(session)
        child_context = context_aggregator.get_context_for_chatbot(
            payload.child_id, payload.carer_id
        )
        
        if "Child not found" in child_context:
            def error_stream():
                yield f"data: {json.dumps({'content': f'Child {payload.child_id} not found or access denied', 'done': True, 'error': True})}\n\n"
            return StreamingResponse(error_stream(), media_type="text/plain")
        
        # Get RAG service
        rag = get_rag_service()
        if not rag:
            def error_stream():
                yield f"data: {json.dumps({'content': 'AI service is currently unavailable. Please try again later.', 'done': True, 'error': True})}\n\n"
            return StreamingResponse(error_stream(), media_type="text/plain")
        
        def generate_response():
            try:
                for chunk in rag.stream_contextual_response(payload.message, child_context):
                    yield f"data: {json.dumps(chunk)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'content': 'Error generating response', 'done': True, 'error': True})}\n\n"
        
        return StreamingResponse(generate_response(), media_type="text/plain")
        
    except Exception as exc:
        print(f"Error in contextual streaming chat: {exc}")
        def error_stream():
            yield f"data: {json.dumps({'content': str(exc), 'done': True, 'error': True})}\n\n"
        return StreamingResponse(error_stream(), media_type="text/plain")

@router.get('/chats/{owner_id}')
def get_chats_by_owner(*, owner_id: int, child_id: Optional[int] = None, session: Session = Depends(get_session)):
    """Get chats by owner, optionally filtered by child"""
    if child_id is not None:
        # Get chats for this specific child (including general chats with no child)
        chats = session.exec(
            select(ChatbotChat).where(
                ChatbotChat.owner_id == owner_id,
                (ChatbotChat.child_id == child_id) | (ChatbotChat.child_id.is_(None))
            )
        ).all()
    else:
        # Get all chats for owner
        chats = session.exec(
            select(ChatbotChat).where(ChatbotChat.owner_id == owner_id)
        ).all()
    
    # Convert to response format
    result = []
    for chat in chats:
        chat_dict = {
            "id": str(chat.id),
            "title": chat.title,
            "owner_id": chat.owner_id,
            "child_id": chat.child_id,
            "created_at": chat.created_at.isoformat(),
            "updated_at": chat.updated_at.isoformat()
        }
        result.append(chat_dict)
    
    return result

@router.post('/chats')
def create_chat(*, payload: ChatCreateRequest, owner_id: int, session: Session = Depends(get_session)):
    """Create a new chat with optional child association"""
    try:
        # Create the chat
        chat = ChatbotChat(
            title=payload.title,
            owner_id=owner_id,
            child_id=payload.child_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(chat)
        session.commit()
        session.refresh(chat)
        
        # Return chat data
        return {
            "id": str(chat.id),
            "title": chat.title,
            "owner_id": chat.owner_id,
            "child_id": chat.child_id,
            "created_at": chat.created_at.isoformat(),
            "updated_at": chat.updated_at.isoformat()
        }
        
    except Exception as exc:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(exc)}")


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

class ChatUpdateRequest(BaseModel):
    title: str

@router.put('/chats/{chat_id}', response_model=ChatbotChat)
def update_chat(*, chat_id: UUID, chat_update: ChatUpdateRequest, session: Session = Depends(get_session)):
    """Update chat title"""
    chat = session.exec(select(ChatbotChat).where(ChatbotChat.id == chat_id)).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat.title = chat_update.title
    chat.updated_at = datetime.utcnow()
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

@router.delete('/chats/{chat_id}')
def delete_chat(*, chat_id: UUID, session: Session = Depends(get_session)):
    """Delete a chat and all its messages"""
    try:
        # Delete all messages associated with this chat
        messages = session.exec(select(ChatMessage).where(ChatMessage.chat_id == chat_id)).all()
        for message in messages:
            session.delete(message)
        
        # Delete the chat itself
        chat = session.exec(select(ChatbotChat).where(ChatbotChat.id == chat_id)).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        session.delete(chat)
        session.commit()
        return {"message": "Chat deleted successfully"}
        
    except Exception as exc:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(exc))
