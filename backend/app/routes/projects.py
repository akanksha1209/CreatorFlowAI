from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.saved_project import SavedProject
from app.models.project_version import ProjectVersion
from app.models.chat_message import ChatMessage
import json
from typing import Optional, List
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    
    if search:
        query = query.filter(Project.topic.contains(search))
    
    total = query.count()
    projects = query.offset(skip).limit(limit).all()
    
    return ProjectListResponse(
        projects=[ProjectResponse.from_orm(p) for p in projects],
        total=total,
        page=(skip // limit) + 1,
        size=limit
    )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.from_orm(project)

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return ProjectResponse.from_orm(db_project)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return ProjectResponse.from_orm(db_project)

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete related records
    db.query(ProjectVersion).filter(ProjectVersion.project_id == project_id).delete()
    db.query(ChatMessage).filter(ChatMessage.project_id == project_id).delete()
    db.query(SavedProject).filter(SavedProject.project_id == project_id).delete()
    db.delete(db_project)
    db.commit()
    
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/save")
async def save_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if already saved
    existing_save = db.query(SavedProject).filter(
        SavedProject.project_id == project_id
    ).first()
    
    if existing_save:
        # Toggle favorite status
        existing_save.is_favorite = not existing_save.is_favorite
        db.commit()
        return {"message": f"Project {'favorited' if existing_save.is_favorite else 'unfavorited'} successfully"}
    else:
        # Create new save
        db_save = SavedProject(project_id=project_id, is_favorite=True)
        db.add(db_save)
        db.commit()
        return {"message": "Project saved successfully"}

@router.get("/{project_id}/history")
async def get_project_history(
    project_id: int,
    db: Session = Depends(get_db)
):
    # Get project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get versions
    versions = db.query(ProjectVersion).filter(
        ProjectVersion.project_id == project_id
    ).order_by(ProjectVersion.version_number.desc()).all()
    
    # Get chat messages
    chat_messages = db.query(ChatMessage).filter(
        ChatMessage.project_id == project_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return {
        "project": ProjectResponse.from_orm(project),
        "versions": [
            {
                "id": v.id,
                "version_number": v.version_number,
                "titles": json.loads(v.titles) if v.titles else [],
                "hooks": json.loads(v.hooks) if v.hooks else [],
                "script": v.script,
                "caption": v.caption,
                "hashtags": json.loads(v.hashtags) if v.hashtags else [],
                "cta": v.cta,
                "alternative_angles": json.loads(v.alternative_angles) if v.alternative_angles else [],
                "future_ideas": json.loads(v.future_ideas) if v.future_ideas else [],
                "repurposing_suggestions": json.loads(v.repurposing_suggestions) if v.repurposing_suggestions else {},
                "created_at": v.created_at
            }
            for v in versions
        ],
        "chat_messages": [
            {
                "id": msg.id,
                "message_type": msg.message_type,
                "content": msg.content,
                "created_at": msg.created_at
            }
            for msg in chat_messages
        ]
    }