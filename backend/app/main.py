import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any

from .supabase_client import supabase

app = FastAPI(title="Resume Builder API")

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResumeSectionCreate(BaseModel):
    section_type: str = Field(..., min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=255)
    content: Any = Field(default_factory=dict)
    sort_order: int = Field(default=0, ge=0)


class ResumeCreate(BaseModel):
    user_id: str | None = Field(default=None, max_length=255)
    title: str = Field(default="Untitled Resume", min_length=1, max_length=255)
    template: str = Field(default="modern", min_length=1, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=255)
    linkedin: str | None = Field(default=None, max_length=255)
    github: str | None = Field(default=None, max_length=255)
    summary: str | None = None
    sections: list[ResumeSectionCreate] = Field(default_factory=list)


class ResumeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    template: str | None = Field(default=None, min_length=1, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=255)
    linkedin: str | None = Field(default=None, max_length=255)
    github: str | None = Field(default=None, max_length=255)
    summary: str | None = None
    sections: list[ResumeSectionCreate] | None = None


@app.get("/")
def read_root():
    return {"message": "Welcome to the Resume Builder API"}


@app.get("/api/health")
def health_check():
    try:
        supabase.table("resumes").select("id").limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": "unavailable", "error": str(e)}


@app.post("/api/resumes", status_code=201)
def create_resume(payload: ResumeCreate):
    try:
        resume_data = {
            "user_id": payload.user_id,
            "title": payload.title,
            "template": payload.template,
            "full_name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "location": payload.location,
            "website": payload.website,
            "linkedin": payload.linkedin,
            "github": payload.github,
            "summary": payload.summary,
        }

        resume_result = supabase.table("resumes").insert(resume_data).execute()

        if not resume_result.data or len(resume_result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create resume")

        resume = resume_result.data[0]
        resume_id = resume["id"]

        if payload.sections:
            sections_data = [
                {
                    "resume_id": resume_id,
                    "section_type": section.section_type,
                    "title": section.title,
                    "content": section.content,
                    "sort_order": section.sort_order,
                }
                for section in payload.sections
            ]

            sections_result = supabase.table("resume_sections").insert(sections_data).execute()
            resume["sections"] = sections_result.data if sections_result.data else []
        else:
            resume["sections"] = []

        return resume
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resumes")
def list_resumes(user_id: str | None = Query(default=None)):
    try:
        query = supabase.table("resumes").select("*, resume_sections(*)")

        if user_id:
            query = query.eq("user_id", user_id)

        result = query.order("updated_at", desc=True).execute()

        resumes = []
        for resume in result.data:
            sections = resume.pop("resume_sections", [])
            resume["sections"] = sorted(sections, key=lambda x: x.get("sort_order", 0))
            resumes.append(resume)

        return resumes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resumes/{resume_id}")
def get_resume(resume_id: str):
    try:
        result = supabase.table("resumes").select("*, resume_sections(*)").eq("id", resume_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume = result.data[0]
        sections = resume.pop("resume_sections", [])
        resume["sections"] = sorted(sections, key=lambda x: x.get("sort_order", 0))

        return resume
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/resumes/{resume_id}")
def update_resume(resume_id: str, payload: ResumeUpdate):
    try:
        existing = supabase.table("resumes").select("id").eq("id", resume_id).execute()
        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        update_data = payload.model_dump(exclude_unset=True, exclude={"sections"})
        if update_data:
            supabase.table("resumes").update(update_data).eq("id", resume_id).execute()

        if payload.sections is not None:
            supabase.table("resume_sections").delete().eq("resume_id", resume_id).execute()

            if payload.sections:
                sections_data = [
                    {
                        "resume_id": resume_id,
                        "section_type": section.section_type,
                        "title": section.title,
                        "content": section.content,
                        "sort_order": section.sort_order,
                    }
                    for section in payload.sections
                ]
                supabase.table("resume_sections").insert(sections_data).execute()

        result = supabase.table("resumes").select("*, resume_sections(*)").eq("id", resume_id).execute()
        resume = result.data[0]
        sections = resume.pop("resume_sections", [])
        resume["sections"] = sorted(sections, key=lambda x: x.get("sort_order", 0))

        return resume
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/resumes/{resume_id}", status_code=204)
def delete_resume(resume_id: str):
    try:
        existing = supabase.table("resumes").select("id").eq("id", resume_id).execute()
        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        supabase.table("resumes").delete().eq("id", resume_id).execute()

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
