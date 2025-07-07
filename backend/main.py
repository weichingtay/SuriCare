from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, children, growth, sleep, chat, guidance

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(children.router)
app.include_router(growth.router)
app.include_router(sleep.router)
app.include_router(chat.router)
app.include_router(guidance.router)
