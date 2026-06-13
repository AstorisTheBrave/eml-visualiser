import re
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)
from eml_compiler_v4 import (
    compile_to_eml,
    normalize_to_exp_log,
    LOCALS as EML_LOCALS,
)

TRANSFORMATIONS = (
    standard_transformations
    + (implicit_multiplication_application, convert_xor)
)

# ALLOWED is built explicitly — never via spread.
# Only user-facing function names included.
# "E", "I", "i" deliberately excluded to prevent silent
# substitution of imaginary unit / Euler's number when user
# intends a variable. Frontend warns user about reserved tokens.
ALLOWED: dict = {
    # Trigonometric — use EML_LOCALS rewrites so normalize_to_exp_log
    # receives the expected log-based form.
    "sin":     EML_LOCALS["Sin"],
    "cos":     EML_LOCALS["Cos"],
    "tan":     EML_LOCALS["Tan"],
    "asin":    EML_LOCALS["ArcSin"],
    "acos":    EML_LOCALS["ArcCos"],
    "atan":    EML_LOCALS["ArcTan"],
    "arcsin":  EML_LOCALS["ArcSin"],
    "arccos":  EML_LOCALS["ArcCos"],
    "arctan":  EML_LOCALS["ArcTan"],
    # Hyperbolic
    "sinh":    EML_LOCALS["Sinh"],
    "cosh":    EML_LOCALS["Cosh"],
    "tanh":    EML_LOCALS["Tanh"],
    "asinh":   EML_LOCALS["ArcSinh"],
    "acosh":   EML_LOCALS["ArcCosh"],
    "atanh":   EML_LOCALS["ArcTanh"],
    "arcsinh": EML_LOCALS["ArcSinh"],
    "arccosh": EML_LOCALS["ArcCosh"],
    "arctanh": EML_LOCALS["ArcTanh"],
    # Algebraic
    "sqrt":    sp.sqrt,
    "exp":     sp.exp,
    "log":     sp.log,
    "ln":      sp.log,
    "abs":     sp.Abs,
    # Custom from paper
    "half":    EML_LOCALS["Half"],
    "inv":     EML_LOCALS["Inv"],
    "sqr":     EML_LOCALS["Sqr"],
    "sigma":   EML_LOCALS["LogisticSigmoid"],
    "avg":     EML_LOCALS["Avg"],
    "hypot":   EML_LOCALS["Hypot"],
    # Constants
    "pi":      sp.pi,
    "Pi":      sp.pi,
    "e":       sp.E,
}

# Frontend mirrors this set for warning display.
RESERVED_SYMBOLS = frozenset(["e", "pi", "Pi"])

# Constants are case-sensitive on purpose (see note above re: E / I / i).
# Every other ALLOWED entry is a named function we accept in any casing,
# so users can write sqrt(64), Sqrt(64) or SQRT(64) interchangeably.
_CONSTANT_NAMES = frozenset(["e", "pi", "Pi"])
_FUNCTION_NAMES = frozenset(
    name.lower() for name in ALLOWED if name not in _CONSTANT_NAMES
)

# Matches an identifier used as a function call: `name(`.
_FUNC_CALL_RE = re.compile(r"([A-Za-z_][A-Za-z0-9_]*)(\s*\()")


def normalize_input(user_input: str) -> str:
    """
    Light, lossless cleanup applied before SymPy parsing. Keeps the vendored
    eml_compiler_v4 untouched while making the front door more forgiving:

    - Equations: a single ``=`` (e.g. ``y = x^2``) is rewritten to root form
      ``(y)-(x^2)`` so relations can be visualised as one expression.
    - Case-insensitive functions: any known function name is folded to its
      canonical lowercase (``Sqrt`` -> ``sqrt``). Variables and the reserved
      constants (e, pi) are left exactly as written.
    """
    text = user_input.strip()

    # Treat "a = b" as "a - (b)". Skip comparison operators (==, <=, >=, !=).
    if (
        text.count("=") == 1
        and not any(op in text for op in ("==", "<=", ">=", "!="))
    ):
        lhs, rhs = text.split("=")
        if lhs.strip() and rhs.strip():
            text = f"({lhs.strip()})-({rhs.strip()})"

    def _fold(match: "re.Match") -> str:
        name, paren = match.group(1), match.group(2)
        canonical = name.lower()
        if canonical in _FUNCTION_NAMES:
            return canonical + paren
        return match.group(0)

    return _FUNC_CALL_RE.sub(_fold, text)


class InvalidExpressionError(Exception):
    pass


class UnsupportedOperationError(Exception):
    pass


def compile_expression(user_input: str) -> dict:
    """
    Accepts raw user input string.

    Returns:
        {
            "eml_string": str,
            "sympy_expr": sp.Expr,
            "variables_detected": list[str],
            "is_constant": bool,
        }

    Raises:
        InvalidExpressionError
        UnsupportedOperationError
    """
    normalized_input = normalize_input(user_input)
    if not normalized_input:
        raise InvalidExpressionError("Expression is empty")

    try:
        sympy_expr = parse_expr(
            normalized_input,
            local_dict=ALLOWED,
            transformations=TRANSFORMATIONS,
        )
    except Exception as exc:
        raise InvalidExpressionError(
            f"Could not parse expression: {exc}"
        )

    variables_detected = sorted(
        [str(s) for s in sympy_expr.free_symbols]
    )

    if len(variables_detected) > 3:
        raise UnsupportedOperationError(
            "Maximum of 3 variables supported"
        )

    try:
        normalized = normalize_to_exp_log(sympy_expr)
        eml_string = compile_to_eml(normalized)
    except Exception as exc:
        raise UnsupportedOperationError(
            f"Expression could not be compiled to EML: {exc}"
        )

    return {
        "eml_string": eml_string,
        "sympy_expr": sympy_expr,
        "variables_detected": variables_detected,
        "is_constant": len(variables_detected) == 0,
    }


def warmup() -> None:
    """
    Runs a real compile on startup to prime SymPy caches.
    Converts the cold start cost from first-request latency
    to server boot time. Must never raise under any circumstances.
    """
    try:
        compile_expression("sin(x) + cos(x)")
    except Exception:
        pass
