
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class JobCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    location: str | None = Field(default=None, max_length=150)

    @model_validator(mode="after")
    def validate_fields(self):
        self.title = self.title.strip()
        self.description = self.description.strip()

        if len(self.title) < 3:
            raise ValueError("Title must contain at least 3 characters")

        if len(self.description) < 10:
            raise ValueError("Description must contain at least 10 characters")

        if self.location is not None:
            self.location = self.location.strip() or None

        return self


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    location: str | None = Field(default=None, max_length=150)
    status: Literal["open", "closed"] | None = None

    @model_validator(mode="after")
    def validate_fields(self):
        for field_name in ("title", "description"):
            value = getattr(self, field_name)

            if value is not None:
                value = value.strip()

                minimum = 3 if field_name == "title" else 10
                if len(value) < minimum:
                    raise ValueError(
                        f"{field_name} must contain at least {minimum} characters"
                    )

                setattr(self, field_name, value)

        if self.location is not None:
            self.location = self.location.strip() or None

        return self


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    location: str | None
    status: str
    recruiter_id: int
    created_at: datetime
