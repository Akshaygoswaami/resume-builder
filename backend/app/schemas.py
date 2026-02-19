from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ResumeSectionBase(BaseModel):
    section_type: str = Field(..., min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=255)
    content: Any = Field(default_factory=dict)
    sort_order: int = Field(default=0, ge=0)


class ResumeSectionCreate(ResumeSectionBase):
    pass


class ResumeSectionRead(ResumeSectionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ResumeBase(BaseModel):
    user_id: str | None = Field(default=None, max_length=255)
    title: str = Field(default="Untitled Resume", min_length=1, max_length=255)
    template: str = Field(default="classic", min_length=1, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=255)
    linkedin: str | None = Field(default=None, max_length=255)
    github: str | None = Field(default=None, max_length=255)
    summary: str | None = None


class ResumeCreate(ResumeBase):
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


class ResumeRead(ResumeBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    sections: list[ResumeSectionRead]
