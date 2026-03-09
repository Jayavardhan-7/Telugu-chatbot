from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Base
from sqlalchemy import create_engine
from database import DATABASE_URL

from routes import chat, audio, admin

app = FastAPI(title="Telugu Multimodal Chatbot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
Base.metadata.create_all(bind=engine)

app.include_router(chat.router)
app.include_router(audio.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Telugu Multimodal Chatbot API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
