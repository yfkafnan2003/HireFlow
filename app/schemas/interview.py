from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class InterviewCreate(BaseModel):
    application_id: int = Field(gt=0)
    interviewer_id: int = Field(gt=0)
    starts_at: datetime
    ends_at: datetime
    meeting_link: str | None = Field(default=None, max_length=2048)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_schedule(self):
        for field in ("starts_at", "ends_at"):
            value = getattr(self, field)
            if value.tzinfo is None or value.utcoffset() is None:
                raise ValueError(f"{field} must include a timezone")

        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")

        return self


class InterviewUpdate(BaseModel):
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    meeting_link: str | None = Field(default=None, max_length=2048)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_schedule(self):
        for field in ("starts_at", "ends_at"):
            value = getattr(self, field)
            if value is not None and (
                value.tzinfo is None or value.utcoffset() is None
            ):
                raise ValueError(f"{field} must include a timezone")

        return self


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    interviewer_id: int
    starts_at: datetime
    ends_at: datetime
    status: str
    meeting_link: str | None
    notes: str | None
