from pydantic import BaseModel
from typing import List


class CodeAssignment(BaseModel):
    code_id: int
    document_id: int
    text: str
    project_id: int


class ThemeGenerationRequest(BaseModel):
    code_assignment_ids: List[int]


class ThemeGenerationResponse(BaseModel):
    id: int
    name: str
    description: str
    project_id: int
    user_id: int
    created_at: str
    reasoning: str
    related_codes: List[str]
