
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    resume_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="candidate_profile",
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="candidate",
    )
