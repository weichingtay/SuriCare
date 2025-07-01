import os
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.schema import Document
from typing import List, Dict, Optional
import json

class RAGService:
    """RAG service using LangChain + FAISS + Google Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Initialize Gemini LLM and embeddings
        self.llm = GoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=self.api_key,
            temperature=0.7
        )
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=self.api_key
        )
        
        self.vectorstore = None
        self.qa_chain = None
        
    def initialize_knowledge_base(self, knowledge_file_path: str):
        """Initialize the knowledge base from a JSON file"""
        try:
            with open(knowledge_file_path, 'r') as f:
                knowledge_data = json.load(f)
            
            # Convert knowledge to documents
            documents = self._create_documents_from_knowledge(knowledge_data)
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            
            split_docs = text_splitter.split_documents(documents)
            
            # Create vector store
            self.vectorstore = FAISS.from_documents(split_docs, self.embeddings)
            
            # Create QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True
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
                        if 'age_range' in item:
                            content += f"Age Range: {item['age_range']}\n"
                        if 'tags' in item:
                            content += f"Tags: {', '.join(item['tags'])}\n"
                        
                        documents.append(Document(
                            page_content=content,
                            metadata={
                                "category": category,
                                "topic": item.get('topic', 'N/A'),
                                "age_range": item.get('age_range', 'all'),
                                "tags": item.get('tags', [])
                            }
                        ))
                    else:
                        # Simple string item
                        documents.append(Document(
                            page_content=f"Category: {category}\nContent: {item}",
                            metadata={"category": category}
                        ))
        
        return documents

    def get_contextual_response(self, query: str, child_context: str) -> Dict:
        """Get AI response with child context and knowledge retrieval"""
        if not self.qa_chain:
            return {
                "response": "Knowledge base not initialized. Please contact support.",
                "sources": []
            }
        
        try:
            # Enhanced prompt with child context
            enhanced_query = f"""
Based on the following child information:
{child_context}

Please answer this question: {query}

Provide advice specific to this child's age, developmental stage, and current health status.
Always include a disclaimer to consult healthcare professionals for serious concerns.
"""
            
            # Get response from RAG chain
            result = self.qa_chain({"query": enhanced_query})
            
            # Extract source information
            sources = []
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    sources.append({
                        "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "category": doc.metadata.get("category", "unknown"),
                        "topic": doc.metadata.get("topic", "N/A")
                    })
            
            return {
                "response": result["result"],
                "sources": sources,
                "context_used": child_context
            }
            
        except Exception as e:
            print(f"Error getting contextual response: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "sources": [],
                "error": str(e)
            }

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
                    "relevance_score": "high"  # FAISS doesn't return scores by default
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
                metadata=metadata or {"category": category}
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
            "llm_model": "gemini-pro"
        }
