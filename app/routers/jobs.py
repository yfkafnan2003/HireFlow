from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.dependencies import require_role
from app.database import get_db
from app.models import Job, User
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from fastapi import HTTPException

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
    db.commit()
    db.refresh(job)

    return job

@router.get("", response_model=list[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
):
    statement = (
        select(Job)
        .where(Job.status == "open")
        .order_by(Job.created_at.desc())
    )

    jobs = db.scalars(statement).all()

    return jobs


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

    for field, value in update_data.items():
        setattr(job, field, value)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update",
        )

    db.commit()
    db.refresh(job)

    return job
