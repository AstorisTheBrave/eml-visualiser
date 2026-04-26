MAX_RECURSION_DEPTH = 200


class EMLParseError(Exception):
    pass


def parse_eml_to_tree(eml_string: str) -> dict:
    """
    Converts EML string to nested dict tree using recursive descent.
    No regex used. Max depth 200 (accommodates deeply nested expressions).
    """
    tokens = _tokenize(eml_string)
    pos = [0]

    def parse_node(depth: int = 0) -> dict:
        if depth > MAX_RECURSION_DEPTH:
            raise EMLParseError("Expression tree is too deep to render")
        if pos[0] >= len(tokens):
            raise EMLParseError("Unexpected end of expression")

        token = tokens[pos[0]]

        if token == "EML":
            pos[0] += 1
            _expect("[", tokens, pos)
            left = parse_node(depth + 1)
            _expect(",", tokens, pos)
            right = parse_node(depth + 1)
            _expect("]", tokens, pos)
            return {
                "type": "internal",
                "label": "EML",
                "left": left,
                "right": right,
            }
        else:
            pos[0] += 1
            return {"type": "leaf", "label": token}

    tree = parse_node()

    if pos[0] != len(tokens):
        raise EMLParseError("Unexpected trailing content")

    return tree


def _expect(expected: str, tokens: list, pos: list) -> None:
    if pos[0] >= len(tokens) or tokens[pos[0]] != expected:
        got = tokens[pos[0]] if pos[0] < len(tokens) else "EOF"
        raise EMLParseError(f"Expected '{expected}', got '{got}'")
    pos[0] += 1


def _tokenize(s: str) -> list[str]:
    tokens = []
    i = 0
    while i < len(s):
        if s[i] in " \t\n":
            i += 1
        elif s[i] == "[":
            tokens.append("[")
            i += 1
        elif s[i] == "]":
            tokens.append("]")
            i += 1
        elif s[i] == ",":
            tokens.append(",")
            i += 1
        elif s[i : i + 3] == "EML":
            tokens.append("EML")
            i += 3
        else:
            j = i
            while j < len(s) and s[j] not in "[],":
                j += 1
            literal = s[i:j].strip()
            if literal:
                tokens.append(literal)
            i = j
    return tokens
