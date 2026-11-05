from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.core.dependencies import require_role
from app.database import get_db
from app.models import Candidate, User
from app.schemas.profile import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    RecruiterProfileResponse,
    RecruiterProfileUpdate,
)

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/candidate/me", response_model=CandidateProfileResponse)
def get_candidate_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    candidate = db.scalar(
        select(Candidate).where(Candidate.user_id == current_user.id)
    )

    if candidate is None:
        raise HTTPException(404, "Candidate profile not found")

    return candidate


@router.patch("/candidate/me", response_model=CandidateProfileResponse)
def update_candidate_profile(
    data: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    candidate = db.scalar(
        select(Candidate).where(Candidate.user_id == current_user.id)
    )

    if candidate is None:
        raise HTTPException(404, "Candidate profile not found")

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(400, "No fields provided to update")

    for field, value in update_data.items():
        if field == "full_name" and value is None:
            raise HTTPException(422, "full_name cannot be null")

        if field == "full_name":
            value = value.strip()

        if field == "phone" and value is not None:
            value = value.strip()

        if field == "resume_url" and value is not None:
            value = str(value)

        setattr(candidate, field, value)

    record_audit(
        db,
        actor_id=current_user.id,
        action="candidate.profile_updated",
        target_type="candidate",
        target_id=candidate.id,
    )

    try:
        db.commit()
        db.refresh(candidate)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Profile update failed")

    return candidate


@router.get("/recruiter/me", response_model=RecruiterProfileResponse)
def get_recruiter_profile(
    current_user: User = Depends(require_role("recruiter")),
):
    return current_user


@router.patch("/recruiter/me", response_model=RecruiterProfileResponse)
def update_recruiter_profile(
    data: RecruiterProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(400, "No fields provided to update")

    new_email = update_data["email"]

    existing = db.scalar(
        select(User).where(
            User.email == new_email,
            User.id != current_user.id,
        )
    )

    if existing:
        raise HTTPException(409, "Email is already registered")

    current_user.email = new_email

    record_audit(
        db,
        actor_id=current_user.id,
        action="recruiter.profile_updated",
        target_type="user",
        target_id=current_user.id,
    )

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Profile update failed")

    return current_user
