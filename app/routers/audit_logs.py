from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database import get_db
from app.models import Application, AuditLog, Interview, Job, User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("/me")
def my_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    recruiter_jobs = select(Job.id).where(
        Job.recruiter_id == current_user.id
    )

    recruiter_applications = select(Application.id).where(
        Application.job_id.in_(recruiter_jobs)
    )

    recruiter_interviews = select(Interview.id).where(
        Interview.application_id.in_(recruiter_applications)
    )

    statement = (
        select(AuditLog)
        .where(
            (
                (AuditLog.target_type == "job")
                & AuditLog.target_id.in_(recruiter_jobs)
            )
            | (
                (AuditLog.target_type == "application")
                & AuditLog.target_id.in_(recruiter_applications)
            )
            | (
                (AuditLog.target_type == "interview")
                & AuditLog.target_id.in_(recruiter_interviews)
            )
        )
        .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
    )

    return db.scalars(statement).all()
