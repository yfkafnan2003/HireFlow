from sqlalchemy.orm import Session

from app.models import AuditLog


def record_audit(
    db: Session,
    actor_id: int | None,
    action: str,
    target_type: str,
    target_id: int | None,
) -> None:
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
    )
    db.add(log)
