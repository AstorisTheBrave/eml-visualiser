import pytest
from services.compiler import (
    compile_expression,
    InvalidExpressionError,
    UnsupportedOperationError,
)


def test_simple_expression():
    result = compile_expression("exp(x)")
    assert "eml_string" in result
    assert "x" in result["variables_detected"]
    assert result["is_constant"] is False


def test_pure_constant():
    result = compile_expression("sin(1)")
    assert result["variables_detected"] == []
    assert result["is_constant"] is True


def test_too_many_variables():
    with pytest.raises(UnsupportedOperationError):
        compile_expression("a + b + c + d")


def test_invalid_expression():
    with pytest.raises(InvalidExpressionError):
        compile_expression("((((")


def test_whitespace_raises():
    with pytest.raises(Exception):
        compile_expression("   ")


def test_multi_variable():
    result = compile_expression("sin(x) * cos(y)")
    assert set(result["variables_detected"]) == {"x", "y"}


def test_implicit_multiplication():
    result = compile_expression("2*x")
    assert result is not None
    assert "x" in result["variables_detected"]
