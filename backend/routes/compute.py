import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from core.limiter import limiter, RATE_LIMIT
from models.schemas import ComputeRequest
from services.compiler import (
    compile_expression,
    InvalidExpressionError,
    UnsupportedOperationError,
)
from services.parser import parse_eml_to_tree, EMLParseError
from services.evaluator import (
    evaluate_expression,
    detect_domain,
    EvaluationError,
)
from services.complexity import compute_complexity
from services.cache import cache_key, get_cached, set_cached

router = APIRouter()

# Limits concurrent SymPy compilations to 1 regardless of thread pool size.
# SymPy is CPU-bound; parallelism on a single core increases latency.
# Cached responses bypass this semaphore entirely.
#
# Known limitation: asyncio.wait_for cancels the coroutine wrapper but
# the underlying SymPy thread continues running until it finishes naturally.
# True termination requires multiprocessing isolation, deferred to v2.
# The semaphore prevents thread accumulation under sustained load.
_compile_semaphore = asyncio.Semaphore(1)

COMPUTE_TIMEOUT_SECONDS = 2.0


def error_response(code: str, message: str) -> JSONResponse:
    return JSONResponse(
        content={
            "status": "error",
            "error": {
                "code": code,
                "message": message,
                "details": None,
            },
        }
    )


@router.post("/compute")
@limiter.limit(RATE_LIMIT)
async def compute(request: Request, body: ComputeRequest):
    key = cache_key(body.expression, body.variables, body.mode)
    cached = get_cached(key)
    if cached:
        return JSONResponse(content=cached)

    async with _compile_semaphore:
        try:
            compiled = await asyncio.wait_for(
                asyncio.to_thread(compile_expression, body.expression),
                timeout=COMPUTE_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            return error_response(
                "TIMEOUT", "Computation exceeded the time limit"
            )
        except InvalidExpressionError as exc:
            return error_response("INVALID_EXPRESSION", str(exc))
        except UnsupportedOperationError as exc:
            return error_response("UNSUPPORTED_OPERATION", str(exc))
        except Exception:
            return error_response(
                "INTERNAL_ERROR", "An unexpected error occurred"
            )

    try:
        tree = parse_eml_to_tree(compiled["eml_string"])
    except EMLParseError as exc:
        return error_response("INTERNAL_ERROR", str(exc))

    complexity = compute_complexity(tree)

    # Pure constants are always evaluated regardless of mode.
    should_evaluate = (
        body.mode == "evaluate" or compiled["is_constant"]
    )

    result = None
    if should_evaluate:
        try:
            result = evaluate_expression(
                compiled["sympy_expr"],
                body.variables,
                is_constant=compiled["is_constant"],
            )
        except EvaluationError as exc:
            return error_response("EVALUATION_ERROR", str(exc))

    # Pass original expression string so detect_domain reads
    # function names before normalize_to_exp_log rewrites them.
    variable_meta = {
        var: detect_domain(body.expression, var)
        for var in compiled["variables_detected"]
    }

    response = {
        "status": "ok",
        "data": {
            "result": result,
            "eml": compiled["eml_string"],
            "tree": tree,
            "complexity": complexity,
            "variables_detected": compiled["variables_detected"],
            "variable_meta": variable_meta,
        },
    }

    set_cached(key, response)
    return JSONResponse(content=response)
