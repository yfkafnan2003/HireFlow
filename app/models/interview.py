
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    __table_args__ = (
        CheckConstraint(
            "status IN ('scheduled', 'completed', 'cancelled')",
            name="ck_interviews_status",
        ),
        CheckConstraint(
            "ends_at > starts_at",
            name="ck_interviews_time_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    interviewer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    ends_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="scheduled",
    )

    meeting_link: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    application: Mapped["Application"] = relationship(
        back_populates="interviews",
    )

    interviewer: Mapped["User"] = relationship(
        back_populates="interviews",
    )
