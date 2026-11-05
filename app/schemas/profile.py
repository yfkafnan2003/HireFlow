from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
    model_validator,
)


class CandidateProfileUpdate(BaseModel):
    full_name: str | None = Field(
        default=None, min_length=1, max_length=150
    )
    phone: str | None = Field(default=None, max_length=30)
    resume_url: HttpUrl | None = None

    @model_validator(mode="after")
    def validate_fields(self):
        for field_name in ("full_name", "phone"):
            value = getattr(self, field_name)
            if value is not None and not value.strip():
                raise ValueError(f"{field_name} cannot be blank")

        return self


class CandidateProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str | None


class RecruiterProfileUpdate(BaseModel):
    email: EmailStr


class RecruiterProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str
