from sqlalchemy.orm import Session, selectinload
from typing import List, Dict, Any, Optional

from app.models.code_assignments import CodeAssignment as CodeAssignmentModel
from app.models.code import Code
from app.models.user import User
from app.core.permissions import PermissionChecker


class CodeReviewService:

    @staticmethod
    def get_ai_codebook_assignments(
        db: Session,
        codebook_id: int,
        user_id: int,
        status_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get code assignments from an AI codebook with optional status filtering"""

        # Get user object
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Check codebook access
        codebook = PermissionChecker.check_codebook_access(
            db=db,
            codebook_id=codebook_id,
            user=user,
            raise_exception=True
        )

        if not codebook or not codebook.is_ai_generated:  # type: ignore
            raise ValueError(
                "AI-generated codebook not found or access denied")

        # Get all assignments for codes in this codebook
        query = db.query(CodeAssignmentModel).join(
            Code, CodeAssignmentModel.code_id == Code.id
        ).filter(
            Code.codebook_id == codebook_id,
            CodeAssignmentModel.created_by_id == user_id  # Only user's own assignments
        ).options(
            selectinload(CodeAssignmentModel.code),
            selectinload(CodeAssignmentModel.document)
        )

        # Apply status filter if provided
        if status_filter:
            if status_filter not in ["pending", "accepted", "rejected"]:
                raise ValueError(
                    "Invalid status filter. Must be 'pending', 'accepted', or 'rejected'")
            query = query.filter(CodeAssignmentModel.status == status_filter)

        assignments = query.all()

        # Group by status for summary
        all_assignments = db.query(CodeAssignmentModel).join(
            Code, CodeAssignmentModel.code_id == Code.id
        ).filter(
            Code.codebook_id == codebook_id,
            CodeAssignmentModel.created_by_id == user_id
        ).all()

        status_counts = {
            "pending": len([a for a in all_assignments if a.status == "pending"]), # type: ignore
            "accepted": len([a for a in all_assignments if a.status == "accepted"]), # type: ignore
            "rejected": len([a for a in all_assignments if a.status == "rejected"])  # type: ignore
        }

        return {
            "codebook": {
                "id": codebook.id,  # type: ignore
                "name": codebook.name,  # type: ignore
                "description": codebook.description,  # type: ignore
                "is_ai_generated": codebook.is_ai_generated,  # type: ignore
                "finalized": codebook.finalized  # type: ignore
            },
            "assignments": [
                {
                    "id": a.id,
                    "text": a.text_snapshot,
                    "start_char": a.start_char,
                    "end_char": a.end_char,
                    "confidence": a.confidence,
                    "status": a.status,
                    "document_id": a.document_id,
                    "document_name": a.document.name if a.document else None,  # type: ignore
                    "code": {
                        "id": a.code.id,
                        "name": a.code.name,
                        "description": a.code.description,
                        "color": a.code.color
                    },
                    "created_at": a.created_at
                } for a in assignments
            ],
            "summary": {
                "total": len(all_assignments),
                **status_counts,
                "review_complete": status_counts["pending"] == 0
            }
        }

    @staticmethod
    def bulk_review_assignments(
        db: Session,
        accepted_assignment_ids: List[int],
        rejected_assignment_ids: List[int],
        user_id: int
    ) -> Dict[str, Any]:

        results: Dict[str, Optional[Dict[str, Any]]] = {
            "accepted": None, "rejected": None}
        total_codes_moved = 0

        # Process accepted assignments
        if accepted_assignment_ids:
            accepted_result = CodeReviewService.review_assignments_and_manage_codes(
                db=db,
                assignment_ids=accepted_assignment_ids,
                status="accepted",
                user_id=user_id
            )
            results["accepted"] = accepted_result
            total_codes_moved += len(
                accepted_result.get("codes_moved_to_default", []))

        # Process rejected assignments
        if rejected_assignment_ids:
            rejected_result = CodeReviewService.review_assignments_and_manage_codes(
                db=db,
                assignment_ids=rejected_assignment_ids,
                status="rejected",
                user_id=user_id
            )
            results["rejected"] = rejected_result

        total_updated = 0
        if results["accepted"]:
            total_updated += results["accepted"]["updated_count"]
        if results["rejected"]:
            total_updated += results["rejected"]["updated_count"]

        return {
            "total_updated": total_updated,
            "accepted_count": len(accepted_assignment_ids),
            "rejected_count": len(rejected_assignment_ids),
            "codes_moved_to_default": total_codes_moved,
            "details": results,
            "workflow_note": "Accepted codes automatically moved to your default codebook!"
        }

    @staticmethod
    def review_assignments_and_manage_codes(
        db: Session,
        assignment_ids: List[int],
        status: str,
        user_id: int
    ) -> Dict[str, Any]:

        if status not in ["pending", "accepted", "rejected"]:
            raise ValueError(
                "Invalid status. Must be 'pending', 'accepted', or 'rejected'")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Load all requested assignments
        assignments = db.query(CodeAssignmentModel).options(
            selectinload(CodeAssignmentModel.code).selectinload(Code.codebook)
        ).filter(
            CodeAssignmentModel.id.in_(assignment_ids)
        ).all()

        # Ensure all assignments exist
        if len(assignments) != len(assignment_ids):
            found_ids = [a.id for a in assignments]
            missing_ids = [
                aid for aid in assignment_ids if aid not in found_ids]
            raise ValueError(f"Assignments not found: {missing_ids}")

        # Ensure all assignments belong to same project
        project_ids = {getattr(a, 'project_id') for a in assignments}
        if len(project_ids) > 1:
            raise ValueError("Assignments must belong to the same project")
        project_id = project_ids.pop()
        # Check that user has access to the project (owner or collaborator)
        PermissionChecker.check_project_access(db, project_id, user)
        # Permission per assignment: if not creator, must be project owner
        for assignment in assignments:
            if getattr(assignment, 'created_by_id') != user_id:
                PermissionChecker.check_project_owner(db, project_id, user)

        # Update statuses
        for assignment in assignments:
            setattr(assignment, 'status', status)
            db.add(assignment)

        db.commit()
        for assignment in assignments:
            db.refresh(assignment)

        return {
            "updated_count": len(assignments),
            "status": status,
            "assignment_ids": assignment_ids,
            "message": f"Successfully updated {len(assignments)} assignments to '{status}'"
        }