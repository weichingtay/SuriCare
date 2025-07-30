import os
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.schema import Document
from typing import List, Dict, Optional
import json
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models import Symptom, Sleep_Time, Meal, Growth
from app.services.chatbot_guardrails import ChatbotGuardrails
import statistics

GEMINI_MODEL = "gemini-2.0-flash"
AI_TEMPERATURE = 0.3


class RAGService:
    """RAG service using LangChain + FAISS + Google Gemini"""

    def __init__(self, session: Optional[Session] = None):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        # Initialize Gemini LLM and embeddings
        self.llm = GoogleGenerativeAI(
            model=GEMINI_MODEL, google_api_key=self.api_key, temperature=AI_TEMPERATURE
        )

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", google_api_key=self.api_key
        )

        self.vectorstore = None
        self.qa_chain = None
        self.session = session
        
        # Initialize guardrails system
        self.guardrails = ChatbotGuardrails()

    def initialize_knowledge_base(self, knowledge_file_path: str):
        """
        Initialize the knowledge base from a JSON file.
        The JSON file is at the path specified by the knowledge_file_path.
        """
        try:
            with open(knowledge_file_path, "r") as f:
                knowledge_data = json.load(f)

            # Convert knowledge to documents
            documents = self._create_documents_from_knowledge(knowledge_data)

            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200, length_function=len
            )

            split_docs = text_splitter.split_documents(documents)

            # Create vector store
            self.vectorstore = FAISS.from_documents(split_docs, self.embeddings)

            # Create QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True,
            )

            print(f"Knowledge base initialized with {len(split_docs)} document chunks")

        except Exception as e:
            print(f"Error initializing knowledge base: {e}")
            raise

    def _create_documents_from_knowledge(self, knowledge_data: Dict) -> List[Document]:
        """Convert knowledge data to LangChain documents"""
        documents = []

        for category, items in knowledge_data.items():
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        # Create document from structured data
                        content = f"Category: {category}\n"
                        content += f"Topic: {item.get('topic', 'N/A')}\n"
                        content += f"Content: {item.get('content', '')}\n"
                        if "age_range" in item:
                            content += f"Age Range: {item['age_range']}\n"
                        if "tags" in item:
                            content += f"Tags: {', '.join(item['tags'])}\n"

                        documents.append(
                            Document(
                                page_content=content,
                                metadata={
                                    "category": category,
                                    "topic": item.get("topic", "N/A"),
                                    "age_range": item.get("age_range", "all"),
                                    "tags": item.get("tags", []),
                                },
                            )
                        )
                    else:
                        # Simple string item
                        documents.append(
                            Document(
                                page_content=f"Category: {category}\nContent: {item}",
                                metadata={"category": category},
                            )
                        )

        return documents

    def get_weekly_patterns(self, child_id: int) -> Dict:
        """Analyze child's patterns from the last week (or available recent data)"""
        if not self.session:
            return {"status": "no_database_access"}
        
        try:
            one_week_ago = datetime.now() - timedelta(days=7)
            
            patterns = {
                "sleep_patterns": self._analyze_sleep_patterns(child_id, one_week_ago),
                "nutrition_patterns": self._analyze_nutrition_patterns(child_id, one_week_ago),
                "symptom_patterns": self._analyze_symptom_patterns(child_id, one_week_ago),
                "growth_trends": self._analyze_recent_growth(child_id, one_week_ago)
            }
            
            return patterns
        except Exception as e:
            print(f"Error getting weekly patterns: {e}")
            return {"status": "error", "message": str(e)}

    def _analyze_sleep_patterns(self, child_id: int, since_date: datetime) -> Dict:
        """Analyze sleep patterns from recent data"""
        try:
            sleep_records = self.session.exec(
                select(Sleep_Time)
                .where(Sleep_Time.child_id == child_id, Sleep_Time.check_in >= since_date)
                .order_by(Sleep_Time.check_in.desc())
            ).all()
            
            if not sleep_records:
                return {"status": "no_data"}
            
            # Calculate daily sleep durations
            daily_sleep = []
            sleep_quality_scores = []
            
            for record in sleep_records:
                if record.start_time and record.end_time:
                    try:
                        duration = (record.end_time - record.start_time).total_seconds() / 3600
                        if 0 < duration < 24:  # Valid duration
                            daily_sleep.append(duration)
                            # Simple quality score based on duration
                            if 8 <= duration <= 12:
                                sleep_quality_scores.append("good")
                            elif 6 <= duration < 8 or 12 < duration <= 14:
                                sleep_quality_scores.append("fair")
                            else:
                                sleep_quality_scores.append("poor")
                    except:
                        continue  # Skip invalid records
            
            if not daily_sleep:
                return {"status": "incomplete_data"}
            
            avg_sleep = statistics.mean(daily_sleep)
            sleep_consistency = statistics.stdev(daily_sleep) if len(daily_sleep) > 1 else 0
            
            # Determine pattern
            pattern = "consistent" if sleep_consistency < 1.5 else "inconsistent"
            trend = self._calculate_trend(daily_sleep) if len(daily_sleep) > 1 else "stable"
            
            days_analyzed = len(set(record.check_in.date() for record in sleep_records))
            
            return {
                "status": "available",
                "average_hours": round(avg_sleep, 1),
                "consistency": pattern,
                "trend": trend,
                "quality_distribution": {
                    "good": sleep_quality_scores.count("good"),
                    "fair": sleep_quality_scores.count("fair"),
                    "poor": sleep_quality_scores.count("poor")
                },
                "records_count": len(sleep_records),
                "days_analyzed": days_analyzed
            }
        except Exception as e:
            print(f"Error analyzing sleep patterns: {e}")
            return {"status": "error"}

    def _analyze_nutrition_patterns(self, child_id: int, since_date: datetime) -> Dict:
        """Analyze nutrition patterns from recent data"""
        try:
            meals = self.session.exec(
                select(Meal)
                .where(Meal.child_id == child_id, Meal.check_in >= since_date)
                .order_by(Meal.check_in.desc())
            ).all()
            
            if not meals:
                return {"status": "no_data"}
            
            consumption_levels = [m.consumption_level for m in meals if m.consumption_level is not None]
            
            if not consumption_levels:
                return {"status": "incomplete_data"}
            
            avg_consumption = statistics.mean(consumption_levels)
            consistency = statistics.stdev(consumption_levels) if len(consumption_levels) > 1 else 0
            trend = self._calculate_trend(consumption_levels) if len(consumption_levels) > 1 else "stable"
            
            # Analyze meal frequency
            daily_meals = {}
            for meal in meals:
                try:
                    date_key = meal.check_in.date()
                    daily_meals[date_key] = daily_meals.get(date_key, 0) + 1
                except:
                    continue
            
            avg_meals_per_day = statistics.mean(daily_meals.values()) if daily_meals else 0
            days_analyzed = len(daily_meals)
            
            return {
                "status": "available",
                "average_consumption": round(avg_consumption, 1),
                "consistency": "consistent" if consistency < 20 else "inconsistent",
                "trend": trend,
                "average_meals_per_day": round(avg_meals_per_day, 1),
                "total_meals": len(meals),
                "days_analyzed": days_analyzed
            }
        except Exception as e:
            print(f"Error analyzing nutrition patterns: {e}")
            return {"status": "error"}

    def _analyze_symptom_patterns(self, child_id: int, since_date: datetime) -> Dict:
        """Analyze symptom patterns from recent data"""
        try:
            symptoms = self.session.exec(
                select(Symptom)
                .where(Symptom.child_id == child_id, Symptom.check_in >= since_date)
                .order_by(Symptom.check_in.desc())
            ).all()
            
            if not symptoms:
                return {"status": "no_symptoms"}
            
            # Group symptoms by type
            symptom_frequency = {}
            daily_symptoms = {}
            
            for symptom in symptoms:
                try:
                    # Count symptom types
                    symptom_type = symptom.symptom.lower() if symptom.symptom else "unknown"
                    symptom_frequency[symptom_type] = symptom_frequency.get(symptom_type, 0) + 1
                    
                    # Count daily occurrences
                    date_key = symptom.check_in.date()
                    daily_symptoms[date_key] = daily_symptoms.get(date_key, 0) + 1
                except:
                    continue
            
            if not symptom_frequency:
                return {"status": "no_symptoms"}
            
            most_common_symptom = max(symptom_frequency, key=symptom_frequency.get)
            avg_symptoms_per_day = statistics.mean(daily_symptoms.values()) if daily_symptoms else 0
            
            # Determine if symptoms are increasing, decreasing, or stable
            symptom_counts = list(daily_symptoms.values())
            trend = self._calculate_trend(symptom_counts) if len(symptom_counts) > 1 else "stable"
            
            return {
                "status": "has_symptoms",
                "total_count": len(symptoms),
                "most_common": most_common_symptom,
                "frequency_distribution": symptom_frequency,
                "average_per_day": round(avg_symptoms_per_day, 1),
                "trend": trend,
                "days_with_symptoms": len(daily_symptoms)
            }
        except Exception as e:
            print(f"Error analyzing symptom patterns: {e}")
            return {"status": "error"}

    def _analyze_recent_growth(self, child_id: int, since_date: datetime) -> Dict:
        """Analyze growth trends from recent data"""
        try:
            growth_records = self.session.exec(
                select(Growth)
                .where(Growth.child_id == child_id, Growth.check_in >= since_date)
                .order_by(Growth.check_in.desc())
            ).all()
            
            if len(growth_records) < 2:
                return {"status": "insufficient_data"}
            
            # Sort by date for trend analysis
            sorted_records = sorted(growth_records, key=lambda r: r.check_in)
            
            weight_values = [r.weight for r in sorted_records if r.weight is not None]
            height_values = [r.height for r in sorted_records if r.height is not None]
            
            result = {"status": "available", "records_count": len(growth_records)}
            
            if len(weight_values) >= 2:
                weight_trend = self._calculate_trend(weight_values)
                weight_change = weight_values[-1] - weight_values[0]
                result["weight_trend"] = weight_trend
                result["weight_change_kg"] = round(weight_change, 2)
            
            if len(height_values) >= 2:
                height_trend = self._calculate_trend(height_values)
                height_change = height_values[-1] - height_values[0]
                result["height_trend"] = height_trend
                result["height_change_cm"] = round(height_change, 1)
            
            return result
        except Exception as e:
            print(f"Error analyzing growth trends: {e}")
            return {"status": "error"}

    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction from a list of values"""
        if len(values) < 2:
            return "stable"
        
        # Simple linear trend calculation
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        first_avg = statistics.mean(first_half)
        second_avg = statistics.mean(second_half)
        
        change_percentage = ((second_avg - first_avg) / first_avg) * 100 if first_avg != 0 else 0
        
        if change_percentage > 5:
            return "increasing"
        elif change_percentage < -5:
            return "decreasing"
        else:
            return "stable"

    def format_weekly_patterns_for_context(self, patterns: Dict) -> str:
        """Format weekly patterns into readable context for AI"""
        if patterns.get("status") in ["no_database_access", "error"]:
            return ""
        
        context_parts = []
        
        try:
            # Sleep patterns
            sleep = patterns.get("sleep_patterns", {})
            if sleep.get("status") == "available":
                days_info = f" over {sleep.get('days_analyzed', 'recent')} days" if sleep.get('days_analyzed') else ""
                context_parts.append(
                    f"Sleep Pattern{days_info}: {sleep['average_hours']}h average, "
                    f"{sleep['consistency']} pattern, {sleep['trend']} trend"
                )
            
            # Nutrition patterns
            nutrition = patterns.get("nutrition_patterns", {})
            if nutrition.get("status") == "available":
                days_info = f" over {nutrition.get('days_analyzed', 'recent')} days" if nutrition.get('days_analyzed') else ""
                context_parts.append(
                    f"Nutrition Pattern{days_info}: {nutrition['average_consumption']}% consumption, "
                    f"{nutrition['consistency']}, {nutrition['average_meals_per_day']} meals/day, {nutrition['trend']} trend"
                )
            
            # Symptom patterns
            symptoms = patterns.get("symptom_patterns", {})
            if symptoms.get("status") == "has_symptoms":
                context_parts.append(
                    f"Symptom Pattern: {symptoms['total_count']} symptoms over {symptoms['days_with_symptoms']} days, "
                    f"most common: {symptoms['most_common']}, {symptoms['trend']} trend"
                )
            elif symptoms.get("status") == "no_symptoms":
                context_parts.append("No symptoms reported in recent days")
            
            # Growth trends
            growth = patterns.get("growth_trends", {})
            if growth.get("status") == "available":
                growth_info = []
                if "weight_trend" in growth:
                    growth_info.append(f"weight {growth['weight_trend']} ({growth['weight_change_kg']:+.2f}kg)")
                if "height_trend" in growth:
                    growth_info.append(f"height {growth['height_trend']} ({growth['height_change_cm']:+.1f}cm)")
                if growth_info:
                    context_parts.append(f"Growth Trends: {', '.join(growth_info)}")
            
            return "\n".join(context_parts)
        except Exception as e:
            print(f"Error formatting weekly patterns: {e}")
            return ""

    def _analyze_query_for_needed_patterns(self, query: str) -> Dict[str, bool]:
        """Analyze the user's query to determine which patterns are needed"""
        query_lower = query.lower()
        
        return {
            "sleep": any(keyword in query_lower for keyword in [
                'sleep', 'sleeping', 'tired', 'nap', 'bedtime', 'night', 'wake', 'insomnia', 'rest'
            ]),
            "nutrition": any(keyword in query_lower for keyword in [
                'eat', 'eating', 'food', 'meal', 'hungry', 'appetite', 'nutrition', 'feeding', 'drink', 'milk', 'formula'
            ]),
            "symptoms": any(keyword in query_lower for keyword in [
                'symptom', 'sick', 'fever', 'cough', 'rash', 'pain', 'hurt', 'ache', 'illness', 'doctor', 'medical'
            ]),
            "growth": any(keyword in query_lower for keyword in [
                'growth', 'weight', 'height', 'tall', 'heavy', 'size', 'develop', 'milestone', 'benchmark'
            ])
        }

    def _get_enhanced_context_with_patterns(self, child_context: str, child_id: Optional[int], query: str = "") -> str:
        """Get enhanced context that includes only relevant weekly patterns based on query"""
        enhanced_context = child_context
        
        if child_id and self.session and query:
            try:
                # Analyze what patterns are needed for this specific query
                needed_patterns = self._analyze_query_for_needed_patterns(query)
                
                if any(needed_patterns.values()):  # Only if we need any patterns
                    one_week_ago = datetime.now() - timedelta(days=7)
                    pattern_context_parts = []
                    
                    # Only fetch the patterns that are relevant to the query
                    if needed_patterns["sleep"]:
                        sleep_data = self._analyze_sleep_patterns(child_id, one_week_ago)
                        if sleep_data.get("status") == "available":
                            days_info = f" over {sleep_data.get('days_analyzed', 'recent')} days" if sleep_data.get('days_analyzed') else ""
                            pattern_context_parts.append(
                                f"Sleep Pattern{days_info}: {sleep_data['average_hours']}h average, "
                                f"{sleep_data['consistency']} pattern, {sleep_data['trend']} trend"
                            )
                    
                    if needed_patterns["nutrition"]:
                        nutrition_data = self._analyze_nutrition_patterns(child_id, one_week_ago)
                        if nutrition_data.get("status") == "available":
                            days_info = f" over {nutrition_data.get('days_analyzed', 'recent')} days" if nutrition_data.get('days_analyzed') else ""
                            pattern_context_parts.append(
                                f"Nutrition Pattern{days_info}: {nutrition_data['average_consumption']}% consumption, "
                                f"{nutrition_data['consistency']}, {nutrition_data['average_meals_per_day']} meals/day, {nutrition_data['trend']} trend"
                            )
                    
                    if needed_patterns["symptoms"]:
                        symptom_data = self._analyze_symptom_patterns(child_id, one_week_ago)
                        if symptom_data.get("status") == "has_symptoms":
                            pattern_context_parts.append(
                                f"Symptom Pattern: {symptom_data['total_count']} symptoms over {symptom_data['days_with_symptoms']} days, "
                                f"most common: {symptom_data['most_common']}, {symptom_data['trend']} trend"
                            )
                        elif symptom_data.get("status") == "no_symptoms":
                            pattern_context_parts.append("No symptoms reported in recent days")
                    
                    if needed_patterns["growth"]:
                        growth_data = self._analyze_recent_growth(child_id, one_week_ago)
                        if growth_data.get("status") == "available":
                            growth_info = []
                            if "weight_trend" in growth_data:
                                growth_info.append(f"weight {growth_data['weight_trend']} ({growth_data['weight_change_kg']:+.2f}kg)")
                            if "height_trend" in growth_data:
                                growth_info.append(f"height {growth_data['height_trend']} ({growth_data['height_change_cm']:+.1f}cm)")
                            if growth_info:
                                pattern_context_parts.append(f"Growth Trends: {', '.join(growth_info)}")
                    
                    if pattern_context_parts:
                        enhanced_context += f"\n\nRelevant Weekly Patterns:\n" + "\n".join(pattern_context_parts)
                    
            except Exception as e:
                print(f"Error getting contextual patterns: {e}")
        
        return enhanced_context

    # NOTE: THere are 2 ways to get repsonses, 1 is contextual from
    def get_contextual_response(self, query: str, child_context: str, child_id: Optional[int] = None) -> Dict:
        """Get AI response with child context and knowledge retrieval, with fallback to general AI"""
        try:
            # Get enhanced context with relevant weekly patterns based on query
            enhanced_context = self._get_enhanced_context_with_patterns(child_context, child_id, query)
            
            # First, try to get a knowledge-based response
            knowledge_response = self._get_knowledge_based_response(
                query, enhanced_context
            )

            # Check if the knowledge response is relevant/useful
            if self._is_response_relevant(knowledge_response, query):
                return knowledge_response

            # If knowledge base doesn't have relevant info, use general AI
            return self._get_general_ai_response(query, enhanced_context)

        except Exception as e:
            print(f"Error getting contextual response: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "error": str(e),
            }

    def _get_knowledge_based_response(self, query: str, child_context: str) -> Dict:
        """Get response using knowledge base"""
        if not self.qa_chain:
            # Fall back to general AI if knowledge base not available
            return self._get_general_ai_response(query, child_context)

        # Enhanced prompt with child context and guardrails system prompt
        enhanced_query = f"""
                        {self.guardrails.get_system_prompt()}

                        Based on the following child information:
                        {child_context}

                        Please answer this question: {query}

                        Provide observations about data trends specific to this child's age, developmental stage, current health status, and recent patterns/trends.
                        Pay special attention to any patterns or trends mentioned in the weekly data.
                        Focus on describing what the data shows rather than making medical interpretations.

                        FORMATTING INSTRUCTIONS: 
                        - Use clear paragraph breaks (double line breaks) between different topics or ideas
                        - Structure your response with proper spacing for readability
                        - Separate key points into distinct paragraphs
                        """

        # Get response from RAG chain
        result = self.qa_chain({"query": enhanced_query})
        
        # Apply guardrails to the response
        guardrail_result = self.guardrails.apply_guardrails(result["result"], query)
        
        # Extract source information
        sources = []
        if "source_documents" in result:
            for doc in result["source_documents"]:
                sources.append(
                    {
                        "content": (
                            doc.page_content[:200] + "..."
                            if len(doc.page_content) > 200
                            else doc.page_content
                        ),
                        "category": doc.metadata.get("category", "unknown"),
                        "topic": doc.metadata.get("topic", "N/A"),
                    }
                )

        response_data = {
            "response": guardrail_result["fixed_response"],
            "sources": sources,
            "context_used": child_context,
            "response_type": "knowledge_based",
        }
        
        # Add guardrail information for debugging/monitoring
        if guardrail_result["violations"]:
            response_data["guardrail_info"] = {
                "violations_detected": guardrail_result["violation_count"],
                "response_modified": guardrail_result["response_modified"],
                "high_severity_violations": guardrail_result["high_severity_violations"]
            }
        
        return response_data

    def _get_general_ai_response(self, query: str, child_context: str) -> Dict:
        """Get general AI response when knowledge base doesn't have relevant information"""
        try:
            # Create a comprehensive prompt for general AI with guardrails
            prompt = f"""
                    {self.guardrails.get_system_prompt()}

                    Child Context:
                    {child_context}

                    User Question: {query}

                    Please provide observations about the child's data trends based on the context provided. Focus on:
                    1. Describing patterns you observe in the data
                    2. Noting trends without making medical interpretations
                    3. Providing general information about child development when relevant
                    4. Being empathetic and supportive while maintaining appropriate boundaries

                    Response:
                    """

            # Use the LLM directly for general response
            raw_response = self.llm.invoke(prompt)
            
            # Apply guardrails to the response
            guardrail_result = self.guardrails.apply_guardrails(raw_response, query)

            response_data = {
                "response": guardrail_result["fixed_response"],
                "sources": [],
                "context_used": child_context,
                "response_type": "general_ai",
            }
            
            # Add guardrail information for debugging/monitoring
            if guardrail_result["violations"]:
                response_data["guardrail_info"] = {
                    "violations_detected": guardrail_result["violation_count"],
                    "response_modified": guardrail_result["response_modified"],
                    "high_severity_violations": guardrail_result["high_severity_violations"]
                }
            
            return response_data

        except Exception as e:
            print(f"Error getting general AI response: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "error": str(e),
            }

    def stream_contextual_response(self, query: str, child_context: str, child_id: Optional[int] = None):
        """Stream AI response with child context and knowledge retrieval"""
        try:
            # Get enhanced context with relevant weekly patterns based on query
            enhanced_context = self._get_enhanced_context_with_patterns(child_context, child_id, query)
            
            # First, try to get knowledge-based sources
            sources = []
            response_type = "general_ai"

            if self.vectorstore:
                try:
                    # Search for relevant documents
                    docs = self.vectorstore.similarity_search(query, k=3)
                    if docs:
                        sources = [
                            {
                                "content": (
                                    doc.page_content[:200] + "..."
                                    if len(doc.page_content) > 200
                                    else doc.page_content
                                ),
                                "category": doc.metadata.get("category", "unknown"),
                                "topic": doc.metadata.get("topic", "N/A"),
                            }
                            for doc in docs
                        ]

                        # If we have good sources, include them in the prompt
                        if sources:
                            response_type = "knowledge_based"
                            context_info = "\n".join(
                                [
                                    f"Relevant Information: {source['content']}"
                                    for source in sources[:2]  # Use top 2 sources
                                ]
                            )

                            prompt = f"""
                            {self.guardrails.get_system_prompt()}

                            Relevant Knowledge:
                            {context_info}

                            Child Context:
                            {enhanced_context}

                            User Question: {query}

                            Please provide observations based on the data trends and relevant information. Focus on:
                            1. Describing what the data shows without medical interpretation
                            2. Using relevant knowledge when applicable
                            3. Noting patterns and trends objectively
                            4. Providing general developmental information when appropriate

                            Response:
                            """
                        else:
                            prompt = self._create_general_prompt(query, enhanced_context)
                    else:
                        prompt = self._create_general_prompt(query, enhanced_context)
                except:
                    prompt = self._create_general_prompt(query, enhanced_context)
            else:
                prompt = self._create_general_prompt(query, enhanced_context)

            # Collect the full response for guardrail validation
            full_response = ""
            
            # Stream the response
            for chunk in self.llm.stream(prompt):
                full_response += chunk
                yield {
                    "content": chunk,
                    "sources": sources if sources else [],
                    "response_type": response_type,
                    "context_used": enhanced_context,
                    "done": False,
                }

            # Apply guardrails to the complete response
            guardrail_result = self.guardrails.apply_guardrails(full_response, query)
            
            # If the response was modified by guardrails, send the corrected version
            if guardrail_result["response_modified"]:
                # Send a separator and the corrected response
                yield {
                    "content": "",
                    "sources": sources,
                    "response_type": response_type,
                    "context_used": enhanced_context,
                    "done": False,
                }
                
                # Send the fixed response
                yield {
                    "content": guardrail_result["fixed_response"],
                    "sources": sources,
                    "response_type": response_type,
                    "context_used": enhanced_context,
                    "done": False,
                    "guardrail_modified": True,
                }
            
            # Send final message with guardrail info
            final_message = {
                "content": "",
                "sources": sources,
                "response_type": response_type,
                "context_used": enhanced_context,
                "done": True,
            }
            
            # Add guardrail information if there were violations
            if guardrail_result["violations"]:
                final_message["guardrail_info"] = {
                    "violations_detected": guardrail_result["violation_count"],
                    "response_modified": guardrail_result["response_modified"],
                    "high_severity_violations": guardrail_result["high_severity_violations"]
                }
            
            yield final_message

        except Exception as e:
            print(f"Error in streaming response: {e}")
            yield {
                "content": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "response_type": "error",
                "context_used": enhanced_context if 'enhanced_context' in locals() else child_context,
                "done": True,
                "error": str(e),
            }

    def _create_general_prompt(self, query: str, child_context: str) -> str:
        """Create a general AI prompt"""
        return f"""
{self.guardrails.get_system_prompt()}

Child Context:
{child_context}

User Question: {query}

Please provide observations about the child's data based on the context provided. Focus on:
1. Describing patterns and trends you observe in the data
2. Referencing specific patterns or trends when relevant to the question
3. Providing general developmental information when appropriate
4. Being empathetic and supportive while maintaining proper boundaries
5. If the question is outside childcare topics, politely acknowledge and try to help if appropriate

FORMATTING INSTRUCTIONS:
- Use clear paragraph breaks (double line breaks) between different topics or ideas
- Add a clear line break between paragraphs, dont make the response too tight
- Structure your response with proper spacing for readability  
- Separate key points into distinct paragraphs
- Use bullet points or numbered lists when appropriate
- Make your response easy to scan and read

Response:
"""

    def _is_response_relevant(self, response: Dict, query: str) -> bool:
        """Check if the knowledge-based response is relevant to the query"""
        response_text = response.get("response", "").lower()

        # Check for common indicators that the knowledge base didn't have relevant info
        irrelevant_indicators = [
            "i don't have specific information",
            "i don't have enough information",
            "i cannot provide specific",
            "i'm not able to provide",
            "based on the information provided, i cannot",
            "i don't have access to",
            "the provided context doesn't contain",
        ]

        # If response contains these phrases, it's likely not relevant
        for indicator in irrelevant_indicators:
            if indicator in response_text:
                return False

        # If response is very short (likely generic), consider it not relevant
        if len(response_text.strip()) < 50:
            return False

        # If we have sources, the response is likely relevant
        if response.get("sources") and len(response["sources"]) > 0:
            return True

        # Default to relevant if none of the above conditions are met
        return True

    def search_knowledge_base(self, query: str, k: int = 5) -> List[Dict]:
        """Search the knowledge base directly"""
        if not self.vectorstore:
            return []

        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            return [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": "high",  # FAISS doesn't return scores by default
                }
                for doc in docs
            ]
        except Exception as e:
            print(f"Error searching knowledge base: {e}")
            return []

    def add_knowledge_item(self, category: str, content: str, metadata: Dict = None):
        """Add a new knowledge item to the vector store"""
        if not self.vectorstore:
            print("Knowledge base not initialized")
            return

        try:
            doc = Document(
                page_content=f"Category: {category}\nContent: {content}",
                metadata=metadata or {"category": category},
            )

            # Add to existing vector store
            self.vectorstore.add_documents([doc])
            print(f"Added new knowledge item to category: {category}")

        except Exception as e:
            print(f"Error adding knowledge item: {e}")

    def get_health_status(self) -> Dict:
        """Get the health status of the RAG service"""
        return {
            "knowledge_base_initialized": self.vectorstore is not None,
            "qa_chain_ready": self.qa_chain is not None,
            "embeddings_model": "models/embedding-001",
            "llm_model": GEMINI_MODEL,
        }
