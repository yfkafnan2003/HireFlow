from pydantic import BaseModel, ConfigDict, EmailStr, Field

class CandidateProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    phone: str | None = Field(default=None, max_length=30)
    resume_url: str | None = Field(default=None, max_length=2048)


class CandidateProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str | None
    resume_url: str | None


class RecruiterProfileUpdate(BaseModel):
    email: EmailStr | None = None


class RecruiterProfileResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
