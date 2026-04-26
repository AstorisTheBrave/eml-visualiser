from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union, Literal


class ComputeRequest(BaseModel):
    expression: str = Field(..., min_length=1, max_length=500)
    variables: dict[str, float] = Field(default_factory=dict)
    mode: Literal["symbolic", "evaluate"] = "symbolic"

    @field_validator("expression")
    @classmethod
    def expression_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Expression cannot be blank")
        return v.strip()


class TreeNode(BaseModel):
    type: Literal["internal", "leaf"]
    label: str
    left: Optional["TreeNode"] = None
    right: Optional["TreeNode"] = None


TreeNode.model_rebuild()


class ComplexityStats(BaseModel):
    nodes: int
    depth: int
    leaves: int


class VariableDomain(BaseModel):
    min: float
    max: float
    step: float
    approximate: bool


class ComputeData(BaseModel):
    result: Optional[Union[float, dict]] = None
    eml: str
    tree: TreeNode
    complexity: ComplexityStats
    variables_detected: list[str]
    variable_meta: dict[str, VariableDomain] = {}


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[str] = None


class ComputeResponse(BaseModel):
    status: Literal["ok", "error"]
    data: Optional[ComputeData] = None
    error: Optional[ErrorDetail] = None
