import os
import sys

# Ensure the backend package dir is importable regardless of the working
# directory Vercel runs the service from (the local-module imports below
# — core, routes, services, eml_compiler_v4 — live alongside this file).
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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


# Mounted at the root for local development (frontend calls /compute) and
# under /api for same-origin Vercel deploys, where vercel.json rewrites
# /api/(.*) to this function and the ASGI path keeps the /api prefix.
app.include_router(router)
app.include_router(router, prefix="/api")
