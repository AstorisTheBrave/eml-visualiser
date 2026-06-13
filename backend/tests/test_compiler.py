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


def test_area_hyperbolic_aliases():
    # ar… spelling should behave like the inverse hyperbolic functions.
    assert compile_expression("arsinh(x)")["eml_string"] == \
        compile_expression("asinh(x)")["eml_string"]
    assert "x" in compile_expression("artanh(x)")["variables_detected"]


def test_reciprocal_functions_case_insensitive():
    for expr in ("Sec(x)", "Csc(x)", "Cot(x)", "Coth(x)", "Sech(x)"):
        assert "x" in compile_expression(expr)["variables_detected"]


def test_inverse_reciprocal_hyperbolic_aliases():
    # arcsch/arsech/arcoth spellings alias SymPy's acsch/asech/acoth.
    assert compile_expression("arcsch(x)")["eml_string"] == \
        compile_expression("acsch(x)")["eml_string"]
    assert "x" in compile_expression("arsech(x + 2)")["variables_detected"]


def test_unknown_function_gives_clear_error():
    # An unrecognised name must not surface as "too many variables".
    with pytest.raises(UnsupportedOperationError) as exc:
        compile_expression("foobar(x)")
    assert "Unknown function" in str(exc.value)


def test_glued_function_name_is_caught():
    # 3xsec(x) tokenizes as the unknown identifier 'xsec'.
    with pytest.raises(UnsupportedOperationError) as exc:
        compile_expression("3xsec(x)")
    assert "Unknown function" in str(exc.value)


def test_implicit_multiplication_with_paren_still_works():
    # Single-letter and constant before '(' is multiplication, not a call.
    assert "x" in compile_expression("x(x + 1)")["variables_detected"]
    assert "x" in compile_expression("pi(x + 1)")["variables_detected"]


def test_unsupported_but_known_function_still_explained():
    # gamma is a real SymPy function but not elementary — clear compile error.
    with pytest.raises(UnsupportedOperationError):
        compile_expression("gamma(x)")


def test_abs_compiles_and_is_magnitude():
    from services.evaluator import evaluate_expression
    c = compile_expression("abs(x)")
    assert "x" in c["variables_detected"]
    assert evaluate_expression(c["sympy_expr"], {"x": -3}) == 3.0


def test_cbrt_compiles():
    c = compile_expression("cbrt(27)")
    assert c["is_constant"] is True


def test_wolfram_style_aliases():
    # Names from the paper's LOCALS that were never surfaced before.
    assert "x" in compile_expression("minus(x)")["variables_detected"]
    assert compile_expression("power(x, y)")["eml_string"] == \
        compile_expression("x^y")["eml_string"]
    assert compile_expression("divide(x, y)")["eml_string"] == \
        compile_expression("x/y")["eml_string"]
    assert compile_expression("logisticsigmoid(x)")["eml_string"] == \
        compile_expression("sigma(x)")["eml_string"]


def test_log_base_two_argument():
    # log(z, b) is base-b log; supported by SymPy + the v4 pipeline.
    c = compile_expression("log(x, 10)")
    assert "x" in c["variables_detected"]


def test_constants_i_and_goldenratio_compile():
    assert compile_expression("I + x")["variables_detected"] == ["x"]
    assert compile_expression("GoldenRatio + x")["variables_detected"] == ["x"]


def test_decimal_lowers_like_rational():
    # Upstream v4 parses with rational=True, so 0.5 compiles to the same
    # compact tree as 1/2 instead of an enormous exact-decimal tree.
    assert compile_expression("0.5")["eml_string"] == \
        compile_expression("1/2")["eml_string"]
