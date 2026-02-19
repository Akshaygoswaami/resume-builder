from collections.abc import Generator
import os

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Resume, ResumeSection
from .schemas import ResumeCreate, ResumeSectionCreate, ResumeRead, ResumeUpdate

app = FastAPI(title="Resume Builder API")


@app.on_event("startup")
def on_startup() -> None:
    # MVP bootstrap: create tables directly at service startup.
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def replace_sections(
    resume: Resume,
    sections: list[ResumeSectionCreate],
) -> None:
    resume.sections.clear()
    for section in sections:
        resume.sections.append(
            ResumeSection(
                section_type=section.section_type,
                title=section.title,
                content=section.content,
                sort_order=section.sort_order,
            )
        )


allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Resume Builder API"}


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except SQLAlchemyError:
        return {"status": "degraded", "database": "unavailable"}


@app.post("/api/resumes", response_model=ResumeRead, status_code=201)
def create_resume(payload: ResumeCreate, db: Session = Depends(get_db)):
    resume = Resume(
        user_id=payload.user_id,
        title=payload.title,
        template=payload.template,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        location=payload.location,
        website=payload.website,
        linkedin=payload.linkedin,
        github=payload.github,
        summary=payload.summary,
    )
    db.add(resume)
    db.flush()

    for section in payload.sections:
        resume.sections.append(
            ResumeSection(
                section_type=section.section_type,
                title=section.title,
                content=section.content,
                sort_order=section.sort_order,
            )
        )

    db.commit()
    db.refresh(resume)
    return resume


@app.get("/api/resumes", response_model=list[ResumeRead])
def list_resumes(
    user_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Resume)
    if user_id:
        query = query.filter(Resume.user_id == user_id)
    return query.order_by(Resume.updated_at.desc()).all()


@app.get("/api/resumes/{resume_id}", response_model=ResumeRead)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@app.put("/api/resumes/{resume_id}", response_model=ResumeRead)
def update_resume(resume_id: str, payload: ResumeUpdate, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    changes = payload.model_dump(exclude_unset=True, exclude={"sections"})
    for field, value in changes.items():
        setattr(resume, field, value)

    if payload.sections is not None:
        replace_sections(resume, payload.sections)

    db.commit()
    db.refresh(resume)
    return resume


@app.delete("/api/resumes/{resume_id}", status_code=204)
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    db.delete(resume)
    db.commit()
    return None
