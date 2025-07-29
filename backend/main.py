from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, children, growth, sleep, chat, meal, poop, symptom, reference, analytics, guidance, health_alerts  # ← Make sure health_alerts is here

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include all routers
@app.get("/")
async def root():
    return {"message": "SuriCare API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main"}

app.include_router(users.router)
app.include_router(children.router)
app.include_router(growth.router)
app.include_router(sleep.router)
app.include_router(chat.router)
app.include_router(meal.router)
app.include_router(poop.router)
app.include_router(symptom.router)
app.include_router(reference.router)
app.include_router(analytics.router)
app.include_router(guidance.router)
app.include_router(health_alerts.router)  # ← Make sure this line exists

# Skip saved_articles for now since you don't have that model yet

@app.get("/")
def read_root():
    return {"message": "ParentPal API", "status": "running"}
