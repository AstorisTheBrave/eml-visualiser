"""Vercel Python serverless entrypoint.

Puts the backend package on sys.path and exposes the FastAPI `app` so
Vercel's @vercel/python runtime can serve it. The backend sources are
shipped with this function via `includeFiles` in vercel.json.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402  (import after sys.path setup)

# `app` is the ASGI callable Vercel looks for.
