from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import asyncio

from app.db import get_session
from app.models import Child 
from app.services.ai_guidance_service import AIGuidanceService

router = APIRouter()

@router.get("/articles/{child_id}")
async def get_child_guidance_articles(
    child_id: int,
    db: Session = Depends(get_session),
    user_id: int = Query(..., description="User ID for authentication")
) -> Dict[str, Any]:
    """
    Get AI-curated guidance articles for a specific child
    """
    try:
        # Verify child exists and belongs to user
        child = db.query(Child).filter(
            Child.id == child_id,
            Child.user_id == user_id
        ).first()
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Prepare child data for AI analysis
        child_data = {
            'id': child.id,
            'name': child.name,
            'age': child.age,
            'birth_date': child.birth_date.isoformat() if child.birth_date else None,
            'gender': child.gender
        }
        
        # Get AI-curated articles
        ai_service = AIGuidanceService()
        articles = await ai_service.get_child_specific_articles(child_data)
        
        return {
            'success': True,
            'child_id': child_id,
            'child_name': child.name,
            'articles': articles,
            'total_articles': len(articles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get guidance articles: {str(e)}")

@router.post("/articles/{child_id}/refresh")
async def refresh_child_guidance_articles(
    child_id: int,
    db: Session = Depends(get_session),
    user_id: int = Query(..., description="User ID for authentication")
) -> Dict[str, Any]:
    """
    Force refresh of AI-curated guidance articles for a specific child
    """
    try:
        # Verify child exists and belongs to user
        child = db.query(Child).filter(
            Child.id == child_id,
            Child.user_id == user_id
        ).first()
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Prepare child data for AI analysis
        child_data = {
            'id': child.id,
            'name': child.name,
            'age': child.age,
            'birth_date': child.birth_date.isoformat() if child.birth_date else None,
            'gender': child.gender
        }
        
        # Get fresh AI-curated articles
        ai_service = AIGuidanceService()
        articles = await ai_service.get_child_specific_articles(child_data)
        
        return {
            'success': True,
            'child_id': child_id,
            'child_name': child.name,
            'articles': articles,
            'total_articles': len(articles),
            'refreshed_at': asyncio.get_event_loop().time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh guidance articles: {str(e)}")

@router.get("/articles/{child_id}/summary")
async def get_child_guidance_summary(
    child_id: int,
    db: Session = Depends(get_session),
    user_id: int = Query(..., description="User ID for authentication")
) -> Dict[str, Any]:
    """
    Get AI-generated summary of guidance topics for a specific child
    """
    try:
        # Verify child exists and belongs to user
        child = db.query(Child).filter(
            Child.id == child_id,
            Child.user_id == user_id
        ).first()
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Prepare child data for AI analysis
        child_data = {
            'id': child.id,
            'name': child.name,
            'age': child.age,
            'birth_date': child.birth_date.isoformat() if child.birth_date else None,
            'gender': child.gender
        }
        
        # Get AI-curated articles and generate summary
        ai_service = AIGuidanceService()
        articles = await ai_service.get_child_specific_articles(child_data)
        
        # Extract key topics from articles
        all_topics = []
        for article in articles:
            topics = article.get('key_topics', [])
            all_topics.extend(topics)
        
        # Count topic frequency
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        # Get top topics
        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'success': True,
            'child_id': child_id,
            'child_name': child.name,
            'total_articles': len(articles),
            'top_topics': [{'topic': topic, 'count': count} for topic, count in top_topics],
            'avg_relevance_score': sum(article.get('relevance_score', 0) for article in articles) / len(articles) if articles else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get guidance summary: {str(e)}")
