
from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('recruiter', 'candidate', 'interviewer')",
            name="ck_users_role",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="candidate",
    )

    jobs: Mapped[list["Job"]] = relationship(
        back_populates="recruiter",
    )

    candidate_profile: Mapped["Candidate | None"] = relationship(
        back_populates="user",
        uselist=False,
    )

    interviews: Mapped[list["Interview"]] = relationship(
        back_populates="interviewer",
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="actor",
    )
