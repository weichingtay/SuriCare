import os
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.schema import Document
from typing import List, Dict, Optional
import json

GEMINI_MODEL = "gemini-2.0-flash"
AI_TEMPERATURE = 0.3


class RAGService:
    """RAG service using LangChain + FAISS + Google Gemini"""

    def __init__(self):
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

    def initialize_knowledge_base(self, knowledge_file_path: str):
        """Initialize the knowledge base from a JSON file"""
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

    def get_contextual_response(self, query: str, child_context: str) -> Dict:
        """Get AI response with child context and knowledge retrieval, with fallback to general AI"""
        try:
            # First, try to get a knowledge-based response
            knowledge_response = self._get_knowledge_based_response(query, child_context)
            
            # Check if the knowledge response is relevant/useful
            if self._is_response_relevant(knowledge_response, query):
                return knowledge_response
            
            # If knowledge base doesn't have relevant info, use general AI
            return self._get_general_ai_response(query, child_context)
            
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

        # Enhanced prompt with child context
        enhanced_query = f"""
Based on the following child information:
{child_context}

Please answer this question: {query}

Provide advice specific to this child's age, developmental stage, and current health status.
Always include a disclaimer to consult healthcare professionals for serious concerns.

FORMATTING INSTRUCTIONS: 
- Use clear paragraph breaks (double line breaks) between different topics or ideas
- Structure your response with proper spacing for readability
- Separate key points into distinct paragraphs
"""

        # Get response from RAG chain
        result = self.qa_chain({"query": enhanced_query})

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

        return {
            "response": result["result"],
            "sources": sources,
            "context_used": child_context,
            "response_type": "knowledge_based"
        }
    
    def _get_general_ai_response(self, query: str, child_context: str) -> Dict:
        """Get general AI response when knowledge base doesn't have relevant information"""
        try:
            # Create a comprehensive prompt for general AI
            prompt = f"""
You are SuriAI, a helpful pediatric health assistant. You have access to general medical knowledge but should always remind users to consult healthcare professionals for medical concerns.

Child Context:
{child_context}

User Question: {query}

Please provide a helpful response based on general pediatric knowledge. Be sure to:
1. Consider the child's age and any provided context
2. Provide practical, safe advice
3. Always recommend consulting a healthcare professional for medical concerns
4. Be empathetic and supportive
5. If the question is outside medical/childcare topics, politely acknowledge and try to help if appropriate

Response:
"""
            
            # Use the LLM directly for general response
            response = self.llm.invoke(prompt)
            
            return {
                "response": response,
                "sources": [],
                "context_used": child_context,
                "response_type": "general_ai"
            }
            
        except Exception as e:
            print(f"Error getting general AI response: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "error": str(e),
            }
    
    def stream_contextual_response(self, query: str, child_context: str):
        """Stream AI response with child context and knowledge retrieval"""
        try:
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
                            context_info = "\n".join([
                                f"Relevant Information: {source['content']}"
                                for source in sources[:2]  # Use top 2 sources
                            ])
                            
                            prompt = f"""
You are SuriAI, a helpful pediatric health assistant. Use the following relevant information from your knowledge base along with your general medical knowledge.

Relevant Knowledge:
{context_info}

Child Context:
{child_context}

User Question: {query}

Please provide a helpful response considering both the specific knowledge provided and general pediatric knowledge. Be sure to:
1. Use the relevant information if it applies to the question
2. Consider the child's age and any provided context
3. Provide practical, safe advice
4. Always recommend consulting a healthcare professional for medical concerns
5. Be empathetic and supportive

Response:
"""
                        else:
                            prompt = self._create_general_prompt(query, child_context)
                    else:
                        prompt = self._create_general_prompt(query, child_context)
                except:
                    prompt = self._create_general_prompt(query, child_context)
            else:
                prompt = self._create_general_prompt(query, child_context)
            
            # Stream the response
            for chunk in self.llm.stream(prompt):
                yield {
                    "content": chunk,
                    "sources": sources if sources else [],
                    "response_type": response_type,
                    "context_used": child_context,
                    "done": False
                }
            
            # Send final message
            yield {
                "content": "",
                "sources": sources,
                "response_type": response_type,
                "context_used": child_context,
                "done": True
            }
            
        except Exception as e:
            print(f"Error in streaming response: {e}")
            yield {
                "content": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "response_type": "error",
                "context_used": child_context,
                "done": True,
                "error": str(e)
            }
    
    def _create_general_prompt(self, query: str, child_context: str) -> str:
        """Create a general AI prompt"""
        return f"""
You are SuriAI, a helpful pediatric health assistant. You have access to general medical knowledge but should always remind users to consult healthcare professionals for medical concerns.

Child Context:
{child_context}

User Question: {query}

Please provide a helpful response based on general pediatric knowledge. Be sure to:
1. Consider the child's age and any provided context
2. Provide practical, safe advice
3. Always recommend consulting a healthcare professional for medical concerns
4. Be empathetic and supportive
5. If the question is outside medical/childcare topics, politely acknowledge and try to help if appropriate

FORMATTING INSTRUCTIONS:
- Use clear paragraph breaks (double line breaks) between different topics or ideas
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
            "the provided context doesn't contain"
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
