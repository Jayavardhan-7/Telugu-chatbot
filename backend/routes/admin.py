from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Recording

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/recordings")
async def list_recordings(db: Session = Depends(get_db)):
    recordings = db.query(Recording).all()
    return recordings

@router.put("/recordings/{recording_id}/status")
async def update_status(recording_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
        
    recording.status = status
    db.commit()
    db.refresh(recording)
    return {"message": "Status updated", "recording": recording}
