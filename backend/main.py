import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from routes.compute import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from services.compiler import warmup
    warmup()
    yield


app = FastAPI(
    title="EML Visualiser API",
    description="API for compiling mathematical expressions to EML form. Based on arXiv:2603.21852 by Andrzej Odrzywolek.",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={
            "status": "error",
            "error": {
                "code": "RATE_LIMITED",
                "message": "Too many requests. Please wait before trying again.",
                "details": None,
            },
        },
    )


app.include_router(router)
