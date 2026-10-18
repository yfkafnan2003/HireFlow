from fastapi import FastAPI

app = FastAPI(
    title="HireFlow API",
    description="A recruitment management API",
    version="0.1.0",
)


@app.get("/")
def home():
    return {
        "message": "Welcome to HireFlow API",
        "status": "running",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
