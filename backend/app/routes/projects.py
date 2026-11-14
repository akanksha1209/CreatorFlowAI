import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.saved_project import SavedProject
from app.models.project_version import ProjectVersion
from app.models.chat_message import ChatMessage
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse

router = APIRouter()


def project_response(project: Project, is_saved: bool = False) -> ProjectResponse:
    data = {column.name: getattr(project, column.name) for column in Project.__table__.columns}
    data["is_saved"] = is_saved
    return ProjectResponse.model_validate(data)


@router.get("/", response_model=ProjectListResponse)
async def get_projects(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100),
                       search: Optional[str] = None, saved_only: bool = False,
                       db: Session = Depends(get_db)):
    query = db.query(Project)
    if saved_only:
        query = query.join(SavedProject, SavedProject.project_id == Project.id).filter(SavedProject.is_favorite.is_(True))
    if search:
        query = query.filter(Project.topic.ilike(f"%{search}%"))
    total = query.count()
    projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    saved_ids = {row[0] for row in db.query(SavedProject.project_id).filter(SavedProject.is_favorite.is_(True)).all()}
    return ProjectListResponse(projects=[project_response(p, p.id in saved_ids) for p in projects],
                               total=total, page=(skip // limit) + 1, size=limit)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    saved = db.query(SavedProject).filter(SavedProject.project_id == project_id, SavedProject.is_favorite.is_(True)).first()
    return project_response(project, bool(saved))


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    data = project.model_dump()
    for key in ("key_points", "things_to_avoid"):
        if data.get(key) is not None:
            data[key] = json.dumps(data[key])
    db_project = Project(**data)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return project_response(db_project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    data = project_update.model_dump(exclude_unset=True)
    for key in ("key_points", "things_to_avoid"):
        if key in data and data[key] is not None:
            data[key] = json.dumps(data[key])
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    saved = db.query(SavedProject).filter(SavedProject.project_id == project_id, SavedProject.is_favorite.is_(True)).first()
    return project_response(project, bool(saved))


@router.delete("/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.query(ProjectVersion).filter(ProjectVersion.project_id == project_id).delete()
    db.query(ChatMessage).filter(ChatMessage.project_id == project_id).delete()
    db.query(SavedProject).filter(SavedProject.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/save")
async def save_project(project_id: int, db: Session = Depends(get_db)):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    saved = db.query(SavedProject).filter(SavedProject.project_id == project_id).first()
    if saved:
        saved.is_favorite = not saved.is_favorite
    else:
        saved = SavedProject(project_id=project_id, is_favorite=True)
        db.add(saved)
    db.commit()
    return {"is_saved": saved.is_favorite}


@router.get("/{project_id}/history")
async def get_project_history(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    versions = db.query(ProjectVersion).filter(ProjectVersion.project_id == project_id).order_by(ProjectVersion.version_number.desc()).all()
    messages = db.query(ChatMessage).filter(ChatMessage.project_id == project_id).order_by(ChatMessage.created_at.asc()).all()

    def parse(value, default):
        if not value:
            return default
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return default

    return {
        "project": project_response(project),
        "versions": [{"id": v.id, "project_id": v.project_id, "version_number": v.version_number,
                      "titles": parse(v.titles, [v.title] if v.title else []),
                      "hooks": parse(v.hooks, [v.hook] if v.hook else []), "script": v.script or "",
                      "caption": v.caption or "", "hashtags": parse(v.hashtags, []), "cta": v.cta or "",
                      "alternative_angles": parse(v.alternative_angles, []), "future_ideas": parse(v.future_ideas, []),
                      "repurposing_suggestions": parse(v.repurposing_suggestions, {}), "created_at": v.created_at}
                     for v in versions],
        "chat_messages": [{"id": m.id, "message_type": m.message_type, "content": m.content, "created_at": m.created_at} for m in messages],
    }
