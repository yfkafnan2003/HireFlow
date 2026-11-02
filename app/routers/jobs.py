
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.core.dependencies import require_role
from app.database import get_db
from app.models import Job, User
from app.schemas.job import JobCreate, JobResponse, JobUpdate

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = Job(
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        recruiter_id=current_user.id,
    )

    db.add(job)
    db.flush()

    record_audit(
        db,
        actor_id=current_user.id,
        action="job.created",
        target_type="job",
        target_id=job.id,
    )

    db.commit()
    db.refresh(job)

    return job


@router.get("", response_model=list[JobResponse])
def list_jobs(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    location: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    statement = select(Job).where(Job.status == "open")

    if search:
        statement = statement.where(
            Job.title.ilike(f"%{search.strip()}%")
        )

    if location:
        statement = statement.where(
            Job.location.ilike(f"%{location.strip()}%")
        )

    statement = (
        statement
        .order_by(Job.created_at.desc(), Job.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    return db.scalars(statement).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    statement = select(Job).where(
        Job.id == job_id,
        Job.status == "open",
    )

    job = db.scalar(statement)

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return job


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = db.get(Job, job_id)

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own jobs",
        )

    update_data = job_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update",
        )

    for field, value in update_data.items():
        setattr(job, field, value)

    record_audit(
        db,
        actor_id=current_user.id,
        action="job.updated",
        target_type="job",
        target_id=job.id,
    )

    db.commit()
    db.refresh(job)

    return job
