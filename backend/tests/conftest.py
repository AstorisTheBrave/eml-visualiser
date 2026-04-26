import os

# Must be set before any app imports so core/limiter.py
# reads the test value when the module is first imported.
os.environ.setdefault("RATE_LIMIT", "10000/minute")

import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
