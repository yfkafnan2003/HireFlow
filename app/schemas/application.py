from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    job_id: int = Field(gt=0)


class ApplicationStatusUpdate(BaseModel):
    status: Literal[
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
    ]


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    job_id: int
    status: str
    applied_at: datetime
