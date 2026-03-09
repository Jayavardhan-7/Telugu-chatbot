import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from database import get_db
from models import InterviewSession, Recording
from services.audio import transcribe_audio_telugu, generate_tts_telugu, AUDIO_DIR

router = APIRouter(prefix="/audio", tags=["Audio"])

@router.post("/transcribe_and_save")
async def transcribe_and_save(
    file: UploadFile = File(...),
    topic: str = Form(""),
    location: str = Form(""),
    speaker_age: int = Form(None),
    speaker_gender: str = Form(""),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith((".wav", ".mp3", ".m4a", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(AUDIO_DIR, filename)
    with open(filepath, "wb") as buffer:
        import shutil
        shutil.copyfileobj(file.file, buffer)
        
    transcript = transcribe_audio_telugu(filepath)
    
    # Create simple session & recording link
    session = InterviewSession(interviewer_name="Anonymous", location=location, topic=topic)
    db.add(session)
    db.commit()
    db.refresh(session)
    
    recording = Recording(
        session_id=session.id,
        audio_file_path=filename,
        speaker_age=speaker_age,
        speaker_gender=speaker_gender,
        transcript=transcript,
        status="pending"
    )
    db.add(recording)
    db.commit()
    
    return {"filename": filename, "transcription": transcript}

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Receives an audio file, transcribes it, and saves it.
    """
    if not file.filename.endswith((".wav", ".mp3", ".m4a", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(AUDIO_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    transcription = transcribe_audio_telugu(filepath)
    
    return {"filename": filename, "transcription": transcription}

class TTSRequest(BaseModel):
    text: str

@router.post("/tts")
async def generate_tts(request: TTSRequest):
    """
    Generates Telugu speech from text and returns the audio file path.
    """
    audio_path = generate_tts_telugu(request.text)
    filename = os.path.basename(audio_path)
    return {"audio_path": f"/audio/file/{filename}", "message": "TTS generated"}

@router.get("/file/{filename}")
async def get_audio_file(filename: str):
    """
    Serves the audio file back to the frontend.
    """
    filepath = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(filepath)
