from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, Project
from app.core.deps import get_current_user

router = APIRouter(tags=["Projects"])


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.project import Project as ProjectModel
    db_project = db.query(ProjectModel).filter(ProjectModel.code == project_in.code).first()
    if db_project:
        raise HTTPException(status_code=400, detail="Project code already exists")
    project = ProjectModel(**project_in.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[Project])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.project import Project as ProjectModel
    query = db.query(ProjectModel)
    if status:
        query = query.filter(ProjectModel.status == status)
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=Project)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.project import Project as ProjectModel
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.project import Project as ProjectModel
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.project import Project as ProjectModel
    from app.models.journal import JournalEntryLine
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    has_lines = db.query(JournalEntryLine).filter(JournalEntryLine.project_id == project_id).first()
    if has_lines:
        raise HTTPException(status_code=400, detail="Cannot delete project with transactions")
    db.delete(project)
    db.commit()
    return None
