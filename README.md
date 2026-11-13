# HireFlow — Recruitment Management System

HireFlow is a full-stack recruitment management system built to simplify the hiring process. It provides a platform for recruiters to manage job openings, candidates to apply for jobs, and interviewers to manage assigned interviews.

The project features a **FastAPI REST API**, a **React frontend**, **PostgreSQL**, JWT authentication, and role-based access control.

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Role-based access control
- Three user roles: Candidate, Recruiter, and Interviewer
- Protected frontend routes

### Job Management
- Create, view, update, and close job openings
- Recruiter-specific job management
- Browse available jobs
- View job details

### Application Management
- Candidates can apply for jobs
- Candidates can track their applications
- Recruiters can review applicants
- Update application statuses:
  - Reviewing
  - Shortlisted
  - Rejected
  - Hired

### Interview Management
- Recruiters can schedule interviews
- Assign interviews to interviewers
- Add meeting links and interview notes
- Reschedule scheduled interviews
- Cancel scheduled interviews
- Candidates can view their interviews
- Interviewers can view assigned interviews

### Additional Features
- PostgreSQL database integration
- SQLAlchemy ORM
- Alembic database migrations
- Docker and Docker Compose support
- Nginx reverse proxy for frontend/API communication
- API documentation with Swagger UI
- Health-check endpoints

## Tech Stack

| Category | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React, JavaScript, HTML, CSS |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Migrations | Alembic |
| Frontend Build | Vite |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |
| API Documentation | Swagger UI |

## Project Structure

```text
HireFlow/
├── app/
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── database.py
│   └── main.py
├── migrations/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── nginx.conf
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic.ini
└── .env.example
```

## Running with Docker

### Requirements
- Docker Desktop
- Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/yfkafnan2003/HireFlow.git
cd HireFlow
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and replace the placeholder JWT secret with a secure random value.

```bash
# Windows PowerShell
Copy-Item .env.example .env
```

The Docker Compose configuration supplies the PostgreSQL connection URL to the backend. Configure a strong database password in `.env` before using the setup beyond local development.

### 3. Start the application

```bash
docker compose up -d --build
```

Docker Compose starts:
- PostgreSQL database
- FastAPI backend
- React frontend served by Nginx

Database migrations are applied automatically when the backend starts.

### 4. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |
| Backend Health | http://localhost:8000/health |
| API Proxy Health | http://localhost:8080/api/health |

### 5. Stop the application

```bash
docker compose down
```

To remove the database volume as well (this permanently deletes the Docker database data):

```bash
docker compose down -v
```

## Running Locally Without Docker

### Backend

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Configure your `.env` file using `.env.example`. Make sure PostgreSQL is running and `DATABASE_URL` points to your local database.

Apply database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

API documentation: http://localhost:8000/docs

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file containing:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| GET | `/health/db` | Database health check |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get current user |
| GET | `/jobs` | Browse jobs |
| POST | `/jobs` | Create a job |
| GET | `/jobs/my-jobs` | Get recruiter's jobs |
| POST | `/applications` | Apply for a job |
| GET | `/applications/me` | View own applications |
| GET | `/applications/recruiter/jobs/{job_id}` | View job applicants |
| PATCH | `/applications/{application_id}/status` | Update application status |
| POST | `/interviews` | Schedule an interview |
| GET | `/interviews/recruiter` | View recruiter's interviews |
| GET | `/interviews/assigned` | View assigned interviews |
| GET | `/interviews/me` | View candidate interviews |

For complete request parameters, response schemas, and additional endpoints, visit the Swagger documentation at `/docs`.

## User Roles

| Role | Main Responsibilities |
|---|---|
| Candidate | Browse jobs, submit applications, track applications, view interviews |
| Recruiter | Manage jobs, review applicants, update application statuses, schedule interviews |
| Interviewer | View assigned interviews |

Newly registered users have the candidate role by default.

## Project Goals

HireFlow was developed as a full-stack portfolio project to demonstrate practical skills in backend API development, frontend integration, database design, authentication, authorization, and containerization.

---

**Author:** Kazi Afnan Alam

**GitHub:** [yfkafnan2003](https://github.com/yfkafnan2003)

**Project:** HireFlow — Recruitment Management System
