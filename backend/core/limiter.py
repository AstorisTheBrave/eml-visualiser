import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# RATE_LIMIT env var allows tests to set a very high limit.
# Must be set before this module is imported.
# Default: 20/minute for production.
RATE_LIMIT = os.getenv("RATE_LIMIT", "20/minute")

limiter = Limiter(key_func=get_remote_address)
