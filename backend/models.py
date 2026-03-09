from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class InterviewSession(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    interviewer_name = Column(String, index=True)
    location = Column(String)
    topic = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recordings = relationship("Recording", back_populates="session")

class Recording(Base):
    __tablename__ = "recordings"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    audio_file_path = Column(String, unique=True)
    speaker_age = Column(Integer, nullable=True)
    speaker_gender = Column(String, nullable=True)
    
    transcript = Column(Text, nullable=True)
    translated_transcript = Column(Text, nullable=True)
    
    status = Column(String, default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="recordings")
