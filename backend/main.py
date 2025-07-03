from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, children, growth, sleep, chat, meal, poop, symptom, reference, analytics

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
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

# Skip saved_articles for now since you don't have that model yet

@app.get("/")
def read_root():
    return {"message": "ParentPal API", "status": "running"}