
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database import get_db
from app.models import Application, Candidate, Job, User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# Candidate: apply for an open job
@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_job(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    candidate = db.scalar(
        select(Candidate).where(
            Candidate.user_id == current_user.id
        )
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found",
        )

    job = db.get(Job, data.job_id)

    if job is None or job.status != "open":
        raise HTTPException(
            status_code=404,
            detail="Open job not found",
        )

    existing = db.scalar(
        select(Application).where(
            Application.candidate_id == candidate.id,
            Application.job_id == job.id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already applied for this job",
        )

    application = Application(
        candidate_id=candidate.id,
        job_id=job.id,
    )

    db.add(application)

    try:
        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Application could not be created",
        )

    return application


# Candidate: view own applications
@router.get(
    "/me",
    response_model=list[ApplicationResponse],
)
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    candidate = db.scalar(
        select(Candidate).where(
            Candidate.user_id == current_user.id
        )
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found",
        )

    statement = (
        select(Application)
        .where(Application.candidate_id == candidate.id)
        .order_by(Application.applied_at.desc())
    )

    return db.scalars(statement).all()


# Recruiter: view applications for their own job
@router.get(
    "/recruiter/jobs/{job_id}",
    response_model=list[ApplicationResponse],
)
def list_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = db.get(Job, job_id)

    if job is None or job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    statement = (
        select(Application)
        .where(Application.job_id == job_id)
        .order_by(Application.applied_at.desc())
    )

    return db.scalars(statement).all()


# Recruiter: update application status for their own job
@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    application = db.get(Application, application_id)

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    job = db.get(Job, application.job_id)

    if job is None or job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    application.status = data.status

    try:
        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Application status could not be updated",
        )

    return application
