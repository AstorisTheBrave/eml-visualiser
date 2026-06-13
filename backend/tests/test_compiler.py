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


def test_case_insensitive_function_names():
    # Sqrt / SIN / ArcSin should behave like their lowercase forms.
    assert compile_expression("Sqrt(64)")["is_constant"] is True
    assert "x" in compile_expression("SIN(x)")["variables_detected"]
    assert "x" in compile_expression("ArcSin(x)")["variables_detected"]


def test_case_insensitive_matches_lowercase():
    upper = compile_expression("Cos(x) + Sqrt(y)")
    lower = compile_expression("cos(x) + sqrt(y)")
    assert upper["eml_string"] == lower["eml_string"]


def test_reserved_constants_stay_case_sensitive():
    # pi is a constant; "Pi" remains pi. A bare uppercase variable like X
    # is still a variable, not folded into a function/constant.
    assert compile_expression("sin(Pi)")["is_constant"] is True
    assert "X" in compile_expression("X + 1")["variables_detected"]


def test_equation_is_rewritten_to_root_form():
    # "y = x^2" becomes (y)-(x^2): both variables present, not constant.
    result = compile_expression("y = x^2")
    assert set(result["variables_detected"]) == {"x", "y"}
    assert result["is_constant"] is False


def test_equation_matches_difference_form():
    eq = compile_expression("sin(x) = cos(x)")
    diff = compile_expression("sin(x) - cos(x)")
    assert eq["eml_string"] == diff["eml_string"]
