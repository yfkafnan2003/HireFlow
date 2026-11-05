from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.audit import record_audit
from app.core.dependencies import require_role
from app.database import get_db
from app.models import Application, Candidate, Interview, Job, User
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewUpdate,
)

router = APIRouter(prefix="/interviews", tags=["Interviews"])


def ensure_future(start: datetime):
    if start <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=422,
            detail="Interview must be scheduled in the future",
        )


# Recruiter: schedule an interview
@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def schedule_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    ensure_future(data.starts_at)

    application = db.get(Application, data.application_id)

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.get(Job, application.job_id)

    if job is None or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status not in ("shortlisted",):
        raise HTTPException(
            status_code=409,
            detail="Only shortlisted candidates can be scheduled",
        )

    interviewer = db.get(User, data.interviewer_id)

    if interviewer is None or interviewer.role != "interviewer":
        raise HTTPException(
            status_code=422,
            detail="A valid interviewer account is required",
        )

    interview = Interview(
        application_id=application.id,
        interviewer_id=interviewer.id,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        meeting_link=data.meeting_link,
        notes=data.notes,
        status="scheduled",
    )

    db.add(interview)
    db.flush()

    record_audit(
        db,
        actor_id=current_user.id,
        action="interview.scheduled",
        target_type="interview",
        target_id=interview.id,
    )

    db.commit()
    db.refresh(interview)

    return interview


# Recruiter: view interviews for their own jobs
@router.get(
    "/recruiter",
    response_model=list[InterviewResponse],
)
def recruiter_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    statement = (
        select(Interview)
        .join(Application, Interview.application_id == Application.id)
        .join(Job, Application.job_id == Job.id)
        .where(Job.recruiter_id == current_user.id)
        .order_by(Interview.starts_at.asc())
    )

    return db.scalars(statement).all()


# Interviewer: view interviews assigned to them
@router.get(
    "/assigned",
    response_model=list[InterviewResponse],
)
def assigned_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("interviewer")),
):
    statement = (
        select(Interview)
        .where(Interview.interviewer_id == current_user.id)
        .order_by(Interview.starts_at.asc())
    )

    return db.scalars(statement).all()


# Candidate: view interviews for their own applications
@router.get(
    "/me",
    response_model=list[InterviewResponse],
)
def candidate_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    candidate = db.scalar(
        select(Candidate).where(Candidate.user_id == current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found",
        )

    statement = (
        select(Interview)
        .join(Application, Interview.application_id == Application.id)
        .where(Application.candidate_id == candidate.id)
        .order_by(Interview.starts_at.asc())
    )

    return db.scalars(statement).all()


# Recruiter: reschedule or edit interview details
@router.patch(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def update_interview(
    interview_id: int,
    data: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    interview = db.get(Interview, interview_id)

    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    application = db.get(Application, interview.application_id)
    job = db.get(Job, application.job_id) if application else None

    if job is None or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.status != "scheduled":
        raise HTTPException(
            status_code=409,
            detail="Only scheduled interviews can be updated",
        )

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update",
        )

    new_start = update_data.get("starts_at", interview.starts_at)
    new_end = update_data.get("ends_at", interview.ends_at)

    if new_start is None or new_end is None or new_end <= new_start:
        raise HTTPException(
            status_code=422,
            detail="ends_at must be after starts_at",
        )

    ensure_future(new_start)

    for field, value in update_data.items():
        setattr(interview, field, value)
    record_audit(
        db,
        actor_id=current_user.id,
        action="interview.updated",
        target_type="interview",
        target_id=interview.id,
    )
    db.commit()
    db.refresh(interview)

    return interview


# Recruiter: cancel interview
@router.patch(
    "/{interview_id}/cancel",
    response_model=InterviewResponse,
)
def cancel_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    interview = db.get(Interview, interview_id)

    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    application = db.get(Application, interview.application_id)
    job = db.get(Job, application.job_id) if application else None

    if job is None or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.status != "scheduled":
        raise HTTPException(
            status_code=409,
            detail="Only scheduled interviews can be cancelled",
        )

    interview.status = "cancelled"
    record_audit(
        db,
        actor_id=current_user.id,
        action="interview.cancelled",
        target_type="interview",
        target_id=interview.id,
    )
    db.commit()
    db.refresh(interview)

    return interview
