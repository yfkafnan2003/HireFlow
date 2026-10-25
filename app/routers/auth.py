from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_role
from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.database import get_db
from app.models import Candidate, User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserRegister,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    email = str(user_data.email).lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    new_user = User(
        email=email,
        hashed_password=hash_password(user_data.password),
        role="candidate",
    )

    try:
        db.add(new_user)
        db.flush()

        new_candidate = Candidate(
            user_id=new_user.id,
            full_name=user_data.full_name.strip(),
            phone=user_data.phone,
        )

        db.add(new_candidate)
        db.commit()
        db.refresh(new_user)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration conflicts with existing data",
        ) from exc

    except Exception:
        db.rollback()
        raise

    return new_user


@router.post("/login", response_model=TokenResponse)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(login_data.email).lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if user is None or not verify_password(
        login_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.get("/recruiter-area")
def recruiter_area(
    current_user: User = Depends(require_role("recruiter")),
):
    return {
        "message": "Welcome to the recruiter area",
        "user_id": current_user.id,
        "role": current_user.role,
    }
