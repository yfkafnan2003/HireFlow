
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    __table_args__ = (
        UniqueConstraint(
            "candidate_id",
            "job_id",
            name="uq_applications_candidate_job",
        ),
        CheckConstraint(
            "status IN ('submitted', 'reviewing', 'shortlisted', "
            "'rejected', 'hired', 'withdrawn')",
            name="ck_applications_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="submitted",
    )

    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    candidate: Mapped["Candidate"] = relationship(
        back_populates="applications",
    )

    job: Mapped["Job"] = relationship(
        back_populates="applications",
    )

    interviews: Mapped[list["Interview"]] = relationship(
        back_populates="application",
    )
