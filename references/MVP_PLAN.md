# SuriCare MVP Plan
*Target: Working demo, not production*

## 🎯 MVP Goal
**Build a functioning demo where users can log in, select their child, see/add health data, and get AI-powered health insights**

## 🚫 What We're NOT Fixing (MVP Scope)
- Perfect security (basic auth is fine)
- Production-ready code
- Comprehensive error handling 
- Performance optimization
- Mobile responsiveness
- Complete testing

## ✅ What We MUST Fix (MVP Scope)
1. **Basic user login** - Users can sign in
2. **User-specific data** - Data loads for the logged-in user only
3. **Child selection** - Users can pick which child's data to view
4. **Working forms** - Health check-ins actually save to database
5. **Basic navigation** - App flows work without breaking
6. **AI RAG System** - Personalized health insights based on child's data

---

## 📋 Implementation Plan

### Phase 1: Fix Core Authentication & User Context
**Goal**: Users can log in and see their own children

#### Step 1: Simplify Authentication
```typescript
// Keep it simple - just use Supabase Auth properly
// frontend/src/stores/auth.ts - Remove all the complex dual-auth stuff
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) user.value = data.user
    return { error }
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
  }
  
  return { user, isAuthenticated, login, logout }
})
```

#### Step 2: Add Simple Route Guards
```typescript
// frontend/src/router/index.ts - Basic protection
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const publicPages = ['/login', '/signup', '/']
  
  if (!publicPages.includes(to.path) && !authStore.isAuthenticated) {
    return '/login'
  }
})
```

#### Step 3: Connect Users to Children
```python
# backend/app/routers/children.py - Simple user filtering
@router.get("/my-children")
def get_my_children(user_email: str):  # Pass email as query param for now
    # Query children by user email (keep it simple)
    user = session.query(Primary_Care_Giver).filter(Primary_Care_Giver.email == user_email).first()
    if user:
        return session.query(Child).filter(Child.carer_id == user.id).all()
    return []
```

### Phase 2: Child Selection & Data Context
**Goal**: When user selects a child, all data shows for that child

#### Step 1: Child Selection UI
```typescript
// frontend/src/stores/children.ts - Simple child switching
export const useChildrenStore = defineStore('children', () => {
  const children = ref([])
  const currentChildId = ref(null)
  const currentChild = computed(() => 
    children.value.find(c => c.id === currentChildId.value)
  )
  
  const selectChild = (childId) => {
    currentChildId.value = childId
    // Trigger data refresh for all other stores
  }
  
  return { children, currentChild, selectChild }
})
```

#### Step 2: Update All Data to Use Current Child
```typescript
// Update dashboard, sleep, meals, growth to use currentChild.id
// Replace hardcoded child_id=1 with reactive currentChild.id
```

### Phase 3: Replace Mock Data with Real Data
**Goal**: Forms save to database, dashboard shows real data

#### Step 1: Fix Backend Endpoints (Keep Simple)
```python
# Fix the SQL injection with basic SQLModel queries (not perfect, but works)
# backend/app/routers/growth.py
@router.get("/{child_id}")
def get_growth(child_id: int):
    return session.query(Growth).filter(Growth.child_id == child_id).all()

@router.post("/")
def add_growth(growth_data: Growth):
    session.add(growth_data)
    session.commit()
    return growth_data
```

#### Step 2: Connect Frontend Forms to Backend
```typescript
// Update all dialog components to actually POST to backend
// Remove mock data generators
// Make forms save real data
```

### Phase 4: AI RAG System Implementation
**Goal**: Build personalized AI assistant using child's health data with LangChain

#### Step 1: Setup LangChain RAG Pipeline
```python
# backend/app/services/rag_service.py - LangChain-based RAG system with Google Gemini
from langchain.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA

class ChildHealthRAG:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)
        
    def create_child_knowledge_base(self, child_id: int):
        # Extract all child data
        child_data = self._extract_child_data(child_id)
        
        # Split into chunks for vector storage
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        texts = text_splitter.split_text(child_data)
        
        # Create vector store
        vectorstore = FAISS.from_texts(texts, self.embeddings)
        
        # Create retrieval chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever()
        )
        
        return qa_chain
        
    def _extract_child_data(self, child_id: int) -> str:
        # Gather comprehensive child health data
        child = session.query(Child).filter(Child.id == child_id).first()
        growth_data = session.query(Growth).filter(Growth.child_id == child_id).all()
        sleep_data = session.query(Sleep).filter(Sleep.child_id == child_id).all()
        meal_data = session.query(Meal).filter(Meal.child_id == child_id).all()
        
        # Format as structured text for RAG
        return self._format_health_context(child, growth_data, sleep_data, meal_data)
```

#### Step 2: Create Dynamic RAG Chat Endpoint
```python
# backend/app/routers/chat.py - LangChain RAG endpoint
from app.services.rag_service import ChildHealthRAG

@router.post("/ask")
def ask_health_question(request: ChatRequest):
    # Initialize RAG system for specific child
    rag_system = ChildHealthRAG()
    qa_chain = rag_system.create_child_knowledge_base(request.child_id)
    
    # Add pediatric health context to prompt
    enhanced_prompt = f"""
    Context: You are a pediatric health assistant analyzing data for a specific child.
    
    Question: {request.message}
    
    Please provide personalized advice based on this child's health data patterns.
    Always recommend consulting healthcare professionals for serious concerns.
    """
    
    # Query the RAG system
    response = qa_chain.run(enhanced_prompt)
    
    return {"response": response, "child_id": request.child_id}
```

#### Step 3: Real-time Data Integration
```python
# backend/app/services/rag_service.py - Dynamic data updates
class ChildHealthRAG:
    def update_knowledge_base(self, child_id: int, new_data: dict):
        # Add new health data to existing knowledge base
        formatted_data = self._format_new_data(new_data)
        
        # Update vector store with new information
        # This ensures AI has latest health data for recommendations
        pass
        
    def get_health_insights(self, child_id: int) -> dict:
        # Generate proactive health insights
        qa_chain = self.create_child_knowledge_base(child_id)
        
        insights = {
            "growth_trends": qa_chain.run("Analyze growth patterns and trends"),
            "sleep_analysis": qa_chain.run("Evaluate sleep quality and patterns"),
            "nutrition_review": qa_chain.run("Assess feeding patterns and nutrition"),
            "health_alerts": qa_chain.run("Identify any concerning patterns")
        }
        
        return insights
```

#### Step 4: Frontend RAG Chat Interface
```typescript
// frontend/src/stores/chat.ts - Enhanced chat with RAG context
export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const insights = ref({})
  const isLoading = ref(false)
  
  const sendMessage = async (message: string, childId: number) => {
    isLoading.value = true
    
    const response = await api.post('/chat/ask', {
      message,
      child_id: childId
    })
    
    messages.value.push({
      user: message,
      ai: response.data.response,
      timestamp: new Date(),
      child_id: childId
    })
    
    isLoading.value = false
  }
  
  const getHealthInsights = async (childId: number) => {
    const response = await api.get(`/chat/insights/${childId}`)
    insights.value = response.data
  }
  
  return { messages, insights, isLoading, sendMessage, getHealthInsights }
})
```

### Phase 5: Polish & Demo Prep
**Goal**: Clean up obvious bugs, make demo-ready

#### Step 1: Fix Major Bugs
- Remove console errors
- Fix broken navigation
- Ensure all forms work
- Add basic loading states

#### Step 2: Demo Polish
- Clean up UI rough edges
- Add sample data for demo
- Test full user flow
- Prepare demo script

---

## 🛠️ MVP Implementation Strategy

### Quick Wins (Do These First)
1. **Remove dual authentication** - Just use Supabase Auth
2. **Fix hardcoded child_id=1** - Use dynamic child selection
3. **Replace f-string SQL** - Use SQLModel queries (simple fix)
4. **Connect forms to backend** - Make health check-ins save

### MVP Authentication (Simple but Works)
```typescript
// frontend - Keep it minimal
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (data.user) {
    // Store user info
    // Fetch user's children
    // Redirect to dashboard
  }
}
```

### MVP Data Flow (User → Child → Health Data)
```
1. User logs in
2. App loads user's children list
3. User selects a child (or auto-select if only one)
4. All health data loads for selected child
5. Forms save data for selected child
```

### MVP Backend (Minimal Security)
```python
# Just add basic user email check to endpoints
def get_user_from_email(email: str):
    return session.query(Primary_Care_Giver).filter(email=email).first()

# Pass user email in requests for now (not secure but works for MVP)
```

---

## 📋 MVP Completion Checklist

### Phase 1 ✅
- [ ] Simplified auth store (Supabase only)
- [ ] Basic route guards added
- [ ] User can log in/logout
- [ ] Children load for logged-in user

### Phase 2 ✅  
- [ ] Child selection component works
- [ ] Current child context in all stores
- [ ] Dashboard shows selected child's data
- [ ] Navigation updates based on child selection

### Phase 3 ✅
- [ ] Growth form saves to database
- [ ] Sleep form saves to database  
- [ ] Meal form saves to database
- [ ] Dashboard loads real data (not mock)

### Phase 4 ✅
- [ ] No console errors
- [ ] All major flows work
- [ ] Demo data populated
- [ ] Demo script prepared

---

## 🎬 MVP Demo Script

### Demo Flow (5 minutes)
1. **Login** - "Users can securely log in"
2. **Child Selection** - "Parents can manage multiple children"
3. **Health Check-in** - "Log daily health metrics"
4. **Data Visualization** - "Track child's progress over time"
5. **AI Assistant** - "Get personalized health guidance"

### MVP Success Criteria
✅ User can log in with email/password
✅ User sees only their children  
✅ Selecting different child shows different data
✅ Health forms save and display correctly
✅ Basic navigation works without errors

---

## 🚨 MVP Shortcuts (Acceptable for Demo)

### Security Shortcuts
- Pass user email in API calls (instead of proper JWT)
- Basic Supabase Auth (no advanced security)
- Hardcode CORS to allow localhost

### Data Shortcuts  
- Minimal validation (just prevent crashes)
- Simple error messages
- Basic loading states (no fancy skeletons)

### UI Shortcuts
- Desktop-only (ignore mobile)
- Basic error handling
- Simplified navigation

---

**This plan gets you to a working MVP. Focus on making it work, not making it perfect.**