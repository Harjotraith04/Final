from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.db.session import get_db
from app.core.auth import get_current_user
from app.services.ai.ai_coding_service import AICodingService
from app.services.ai.ai_report_generation import AIReportGenerationService
from app.schemas.ai_services import InitialCodingRequest, DeductiveCodingRequest, ThemeGenerationRequest
from app.models.code_assignments import CodeAssignment
from app.models.code import Code
from app.models.project import Project
from sqlalchemy.orm import joinedload


router = APIRouter()


@router.post("/initial-coding", response_model=Dict[str, Any])
def ai_initial_coding(
    request: InitialCodingRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return AICodingService.generate_code(
            document_ids=request.document_ids,
            db=db,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/deductive-coding", response_model=Dict[str, Any])
def ai_deductive_coding(
    request: DeductiveCodingRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Perform deductive coding using existing codes from a codebook"""
    try:
        return AICodingService.deductive_coding(
            document_ids=request.document_ids,
            codebook_ids=request.codebook_ids,
            db=db,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/generate-themes", response_model=List[Dict[str, Any]])
def ai_generate_themes(
    request: ThemeGenerationRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Generate themes from code assignments using AI"""
    try:
        # Allow access if the current user is either the creator of the code assignment
        # or the owner of the project associated with the code assignment
        code_assignments = db.query(CodeAssignment).join(Project, CodeAssignment.project_id == Project.id).filter(
            CodeAssignment.id.in_(request.code_assignment_ids),
            (CodeAssignment.created_by_id == current_user.id) | (
                Project.owner_id == current_user.id)
        ).options(
            joinedload(CodeAssignment.code),
            joinedload(CodeAssignment.document)
        ).all()

        if not code_assignments:
            raise ValueError(
                "No valid code assignments found for the provided IDs")

        code_assignments_data = []

        for ca in code_assignments:
            if ca.code is not None:  # Ensure code exists
                code_info = {
                    "code_id": ca.code_id,
                    "document_id": ca.document_id,
                    "text": f"Code: {ca.code.name} - {ca.code.description or 'No description'}\n\nText snapshot from the documents: {ca.text_snapshot}",
                    "project_id": ca.code.project_id if ca.code else None
                }
                code_assignments_data.append(code_info)

        themes_response = AICodingService.generate_themes(
            code_assignments=code_assignments_data,
            db=db,
            user_id=current_user.id
        )

        result = []
        for theme in themes_response:
            if hasattr(theme, 'model_dump'):
                result.append(theme.model_dump())
            else:
                result.append(theme)

        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/generate-report", response_model=Dict[str, Any])
def ai_generate_report(
    request: ThemeGenerationRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Generate a report based on code assignments and save it to the project"""
    try:
        # Fetch code assignments and ensure access
        code_assignments = db.query(CodeAssignment).join(Project, CodeAssignment.project_id == Project.id).filter(
            CodeAssignment.id.in_(request.code_assignment_ids),
            (CodeAssignment.created_by_id == current_user.id) | (
                Project.owner_id == current_user.id)
        ).options(
            joinedload(CodeAssignment.code).joinedload(Code.theme),
            joinedload(CodeAssignment.document)
        ).all()

        if not code_assignments:
            raise ValueError(
                "No valid code assignments found for the provided IDs")

        # Ensure all code assignments belong to the same project
        project_ids = {
            ca.code.project_id for ca in code_assignments if ca.code}
        if len(project_ids) != 1:
            raise ValueError(
                "Code assignments must belong to the same project")

        # Format data for report generation - keep it simple but complete
        code_assignments_data = []
        for ca in code_assignments:
            if ca.code is not None:
                code_info = {
                    "code_id": ca.code_id,
                    "document_id": ca.document_id,
                    "project_id": ca.project_id,
                    "text": f"Code: {ca.code.name} - {ca.code.description or 'No description'}\n\nText snapshot from the documents: {ca.text_snapshot}"
                }

                # Only add theme info if it exists
                if ca.code.theme:
                    code_info["theme_id"] = ca.code.theme_id
                    code_info["theme_name"] = ca.code.theme.name
                    code_info["theme_description"] = ca.code.theme.description

                code_assignments_data.append(code_info)

        # Generate the report using AIReportGenerationService
        report_response = AIReportGenerationService.generate_report(
            code_assignments=code_assignments_data,
            db=db,
            user_id=current_user.id
        )

        if "error" in report_response:
            raise ValueError(
                f"Report generation failed: {report_response['error']}")

        # Save the report to the project's report field
        project_id = list(project_ids)[0]  # Get the single project ID
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Associated project not found")

        project.report = report_response["report"]
        db.commit()

        return {
            "message": "Report generated and saved successfully",
            "report": report_response["report"],
            "summary": report_response.get("summary", "No summary provided")
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")
