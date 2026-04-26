import pytest
from services.parser import parse_eml_to_tree, EMLParseError


def test_single_leaf():
    assert parse_eml_to_tree("1") == {"type": "leaf", "label": "1"}


def test_simple_eml():
    result = parse_eml_to_tree("EML[1,1]")
    assert result["type"] == "internal"
    assert result["label"] == "EML"
    assert result["left"] == {"type": "leaf", "label": "1"}
    assert result["right"] == {"type": "leaf", "label": "1"}


def test_nested():
    result = parse_eml_to_tree("EML[1,EML[1,x]]")
    assert result["right"]["type"] == "internal"
    assert result["right"]["right"]["label"] == "x"


def test_variable_leaf():
    result = parse_eml_to_tree("EML[x,1]")
    assert result["left"]["label"] == "x"


def test_invalid_unclosed():
    with pytest.raises(EMLParseError):
        parse_eml_to_tree("EML[1")


def test_trailing_content():
    with pytest.raises(EMLParseError):
        parse_eml_to_tree("EML[1,1]garbage")


def test_empty_string():
    with pytest.raises(EMLParseError):
        parse_eml_to_tree("")
