from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session, selectinload
from app.models.project import Project
from app.models.user import User
from app.models.theme import Theme
from app.models.code import Code
from app.models.codebook import Codebook
from app.models.code_assignments import CodeAssignment
from app.models.annotation import Annotation
from app.services.project_serializer import ProjectSerializer


class ProjectComprehensiveService:
    """Handles comprehensive project data loading"""

    @staticmethod
    def load_project_with_relations(db: Session, project_id: int) -> Optional[Project]:
        """Load project with all necessary relationships"""
        return db.query(Project).options(
            selectinload(Project.owner),
            selectinload(Project.collaborators),
            selectinload(Project.documents),
            selectinload(Project.codes),
            selectinload(Project.codes).selectinload(Code.code_assignments),
            selectinload(Project.annotations).selectinload(
                Annotation.document),
            selectinload(Project.annotations).selectinload(Annotation.code),
            selectinload(Project.annotations).selectinload(
                Annotation.created_by),
            selectinload(Project.codebooks).selectinload(Codebook.codes),
            selectinload(Project.codebooks).selectinload(Codebook.user)
        ).filter(Project.id == project_id).first()

    @staticmethod
    def get_user_code_assignments(db: Session, project_id: int, user_id: int) -> List[CodeAssignment]:
        """Get all code assignments for a user in a project"""
        return db.query(CodeAssignment).join(
            Code, CodeAssignment.code_id == Code.id
        ).filter(
            Code.project_id == project_id,
            CodeAssignment.created_by_id == user_id
        ).options(
            selectinload(CodeAssignment.code),
            selectinload(CodeAssignment.document)
        ).all()

    @staticmethod
    def get_comprehensive_data(db: Session, project_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get comprehensive project data with finalized code assignments and codes"""

        # Load project with all relationships
        project = ProjectComprehensiveService.load_project_with_relations(
            db, project_id)
        if not project:
            return None

        # Check if the user is the owner
        is_owner: bool = project.owner_id == user_id  # type: ignore

        # Get ALL codes in the project (not just user-specific) for merging functionality
        all_codes = list(project.codes)
        
        # Filter user-specific data for other components
        user_codes = [
            code for code in project.codes if code.created_by_id == user_id]
        user_annotations = [
            ann for ann in project.annotations if ann.created_by_id == user_id]
        user_code_assignments = ProjectComprehensiveService.get_user_code_assignments(
            db, project_id, user_id)

        # Get codebooks data - use all codes for codebooks to show all available codes
        user_codebooks = ProjectSerializer.get_user_codebooks(
            db, all_codes, user_id, project_id)

        # Get finalized submitted assignments by user(s) within this project
        submitted_assignments_by_user = []
        # Determine users to include: owner includes collaborators and themselves, else only current user
        user_list = []
        if is_owner:
            user_list = list(project.collaborators) + \
                [project.owner]  # type: ignore
        else:
            current_user = db.query(User).filter(User.id == user_id).first()
            if current_user:
                user_list = [current_user]
        # Fetch assignments for each user
        for usr in user_list:
            assignments = db.query(CodeAssignment).filter(
                CodeAssignment.created_by_id == usr.id,  # type: ignore
                CodeAssignment.is_submitted == True,
                CodeAssignment.project_id == project_id
            ).options(
                selectinload(CodeAssignment.code),
                selectinload(CodeAssignment.document)
            ).all()
            submitted_assignments_by_user.append({
                "user_id": usr.id,
                "user_name": usr.name,  # type: ignore
                "assignments": [
                    ProjectSerializer.serialize_code_assignment(a) for a in assignments
                ]
            })

        # Get themes data created by the user
        themes = db.query(Theme).filter(
            Theme.project_id == project_id,
            Theme.user_id == user_id
        ).all()
        serialized_themes = [
            ProjectSerializer.serialize_theme(theme) for theme in themes]

        # Build response - return ALL codes for merging functionality
        return {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "owner_id": project.owner_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "research_details": project.research_details,
            "owner": ProjectSerializer.serialize_user_data(project.owner),
            "collaborators": [ProjectSerializer.serialize_user_data(c) for c in project.collaborators],
            "documents": [ProjectSerializer.serialize_document(doc) for doc in project.documents],
            "codes": [ProjectSerializer.serialize_code(code, user_id) for code in all_codes],
            "code_assignments": [ProjectSerializer.serialize_code_assignment(a) for a in user_code_assignments],
            "annotations": [ProjectSerializer.serialize_annotation(ann) for ann in user_annotations],
            "codebooks": user_codebooks,
            "submitted_assignments_by_user": submitted_assignments_by_user,
            "themes": serialized_themes,
            "report": project.report if is_owner else None
        }
