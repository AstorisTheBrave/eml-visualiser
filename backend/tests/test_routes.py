import pytest


async def test_valid_symbolic(client):
    res = await client.post(
        "/compute",
        json={"expression": "exp(x)", "mode": "symbolic"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["data"]["eml"] is not None
    assert body["data"]["tree"] is not None
    assert "x" in body["data"]["variables_detected"]


async def test_pure_constant_always_evaluated(client):
    res = await client.post(
        "/compute",
        json={"expression": "sin(0)", "mode": "symbolic"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["data"]["result"] is not None


async def test_evaluate_mode(client):
    res = await client.post(
        "/compute",
        json={
            "expression": "sin(x)",
            "variables": {"x": 1.5708},
            "mode": "evaluate",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["data"]["result"] is not None


async def test_invalid_expression(client):
    res = await client.post(
        "/compute",
        json={"expression": "(((", "mode": "symbolic"},
    )
    body = res.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_EXPRESSION"


async def test_whitespace_rejected(client):
    res = await client.post(
        "/compute",
        json={"expression": "   ", "mode": "symbolic"},
    )
    assert res.status_code == 422


async def test_too_many_variables(client):
    res = await client.post(
        "/compute",
        json={"expression": "a + b + c + d", "mode": "symbolic"},
    )
    body = res.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "UNSUPPORTED_OPERATION"


async def test_variable_meta_correct_for_arcsin(client):
    """
    Verifies detect_domain returns correct domain for arcsin.
    Previous versions incorrectly returned (0.01, 10) because
    the rewritten expression contained sqrt/log rather than arcsin.
    This test guards against regression.
    """
    res = await client.post(
        "/compute",
        json={"expression": "arcsin(x)", "mode": "symbolic"},
    )
    body = res.json()
    assert body["status"] == "ok"
    meta = body["data"]["variable_meta"]["x"]
    assert meta["min"] == -1.0
    assert meta["max"] == 1.0
    assert meta["approximate"] is False


async def test_evaluation_error_is_reachable(client):
    """
    1/x at x=0 produces SymPy zoo (complex infinity).
    complex(zoo.evalf()) raises OverflowError, triggering EVALUATION_ERROR.
    """
    res = await client.post(
        "/compute",
        json={
            "expression": "1/x",
            "variables": {"x": 0.0},
            "mode": "evaluate",
        },
    )
    body = res.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "EVALUATION_ERROR"


async def test_variable_meta_returned(client):
    res = await client.post(
        "/compute",
        json={"expression": "sqrt(x)", "mode": "symbolic"},
    )
    body = res.json()
    assert "variable_meta" in body["data"]
    assert "x" in body["data"]["variable_meta"]
    meta = body["data"]["variable_meta"]["x"]
    assert meta["min"] >= 0
    assert meta["max"] > meta["min"]
    assert meta["approximate"] is False
