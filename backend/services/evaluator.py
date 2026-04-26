import re
import sympy as sp


class EvaluationError(Exception):
    pass


def evaluate_expression(
    sympy_expr: sp.Expr,
    variables: dict,
    is_constant: bool = False,
) -> float | dict | None:
    """
    Returns float for real results, dict for complex,
    None if variables are missing and expression is not constant.
    Raises EvaluationError on genuine domain failures.
    """
    if not is_constant and not variables and sympy_expr.free_symbols:
        return None

    try:
        substituted = sympy_expr.subs(variables)
        result = complex(substituted.evalf())
    except Exception as exc:
        raise EvaluationError(f"Could not evaluate expression: {exc}")

    # NaN check
    if result.real != result.real or result.imag != result.imag:
        raise EvaluationError("Expression produced an undefined value")

    if abs(result.imag) < 1e-10:
        return float(result.real)

    return {
        "real": float(result.real),
        "imag": float(result.imag),
    }


def _extract_function_names(expression_str: str) -> set[str]:
    """
    Extracts called function names from a raw expression string.
    Operates on the original user input before any SymPy rewriting,
    so function names (arcsin, sqrt, etc.) are preserved intact.

    Invariant: domain detection must use the original expression string,
    not the rewritten SymPy expr. After normalize_to_exp_log, arcsin
    becomes I*log(...) and atoms inspection would find log/sqrt
    rather than arcsin, returning the wrong domain.
    """
    return set(re.findall(r'\b([a-zA-Z][a-zA-Z0-9]*)\s*\(', expression_str))


def detect_domain(original_expression: str, variable_name: str) -> dict:
    """
    Returns slider range for a variable based on functions present
    in the original user expression string.

    Priority: most restrictive domain wins.
    Composed functions (e.g. sqrt(arcsin(x))) are marked approximate
    since true intersection requires symbolic domain analysis (v2).
    """
    func_names = _extract_function_names(original_expression.lower())

    # Most restrictive first
    if "arcsin" in func_names or "asin" in func_names:
        return {"min": -1.0, "max": 1.0, "step": 0.01, "approximate": False}

    if "arccos" in func_names or "acos" in func_names:
        return {"min": -1.0, "max": 1.0, "step": 0.01, "approximate": False}

    if "arctanh" in func_names or "atanh" in func_names:
        return {"min": -0.99, "max": 0.99, "step": 0.01, "approximate": False}

    if "arccosh" in func_names or "acosh" in func_names:
        return {"min": 1.0, "max": 10.0, "step": 0.1, "approximate": False}

    if "log" in func_names or "ln" in func_names or "sqrt" in func_names:
        return {"min": 0.01, "max": 10.0, "step": 0.1, "approximate": False}

    return {"min": -10.0, "max": 10.0, "step": 0.1, "approximate": True}
