from sqlalchemy.orm import Session
from app.schemas.ai_services import ThemeOutput
from app.services.ai.llm_service import LLMService
from app.services.theme_service import ThemeService
from app.services.ai.ai_coding_validators import AICodingValidators
from app.services.ai.ai_coding_utils import AICodingUtils
from app.schemas.ai_theme_generation import CodeAssignment, ThemeGenerationRequest, ThemeGenerationResponse
from sqlalchemy.sql.schema import Column
from typing import List


class AIThemeGenerationService:
    """Service for generating themes using in-memory processing"""

    @staticmethod
    def generate_themes_in_memory(
        code_assignments: List[CodeAssignment],
        db: Session,
        user_id: int,
        model_name: str = "gemini-2.0-flash",
        provider: str = "google_genai"
    ) -> List[ThemeGenerationResponse]:
        """Generate themes in memory and immediately apply to database"""
        print(
            f"🚀 Starting theme generation for {len(code_assignments)} assignments")

        llm_service = LLMService(model_name=model_name, provider=provider)

        # Validation
        if not AICodingValidators.validate_llm_service(llm_service, "theme_generation"):
            return []

        # Extract relevant code information from assignments
        # Since we're using Pydantic schema objects, we need to handle them differently
        # than SQLAlchemy models
        codes = []
        for assignment in code_assignments:
            codes.append(assignment.text)

        print(f"Collected {len(codes)} code items for theme generation")

        # Format codes for LLM
        codes_text = AIThemeGenerationService._format_codes_for_theme_generation(
            codes)

        try:
            # Make rate-limited LLM call
            llm_response: ThemeOutput = AICodingUtils.make_rate_limited_llm_call(
                llm_service=llm_service,
                service_type="theme_generation",
                input_data={"codes_text": codes_text},
                provider=provider
            )

            if not code_assignments or len(code_assignments) == 0:
                print("❌ Error: No code assignments provided")
                return []

            # Create theme in database
            theme = ThemeService.create_theme(
                db=db,
                name=llm_response.theme_name,
                project_id=code_assignments[0].project_id,
                user_id=user_id,
                description=llm_response.theme_description
            )

            # Convert SQLAlchemy model to dictionary
            theme_dict = {
                "id": theme.id,
                "name": theme.name,
                "description": theme.description or "",
                "project_id": theme.project_id,
                "user_id": theme.user_id,
                "created_at": theme.created_at.isoformat(),
                "reasoning": llm_response.reasoning,
                "related_codes": llm_response.related_codes
            }

            # Create response object
            result = ThemeGenerationResponse(**theme_dict)

            print(f"✅ Successfully generated and created theme: {theme.name}")
            return [result]

        except Exception as e:
            print(f"❌ Error generating theme: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return []

    @staticmethod
    def _format_codes_for_theme_generation(codes) -> str:
        """Format codes for theme generation LLM input"""
        if not codes:
            return "No codes available for theme generation."

        codes_text = "List of codes from the codebook:\n\n"
        for code in codes:
            # Handle both string inputs and code objects
            if isinstance(code, str):
                codes_text += f"Code text: {code}\n\n"
            else:
                # Handle code objects with name and description attributes
                try:
                    codes_text += f"Code: {code.name}\n\n"
                    codes_text += f"Description: {code.description or 'No description provided'}\n\n"
                except AttributeError:
                    # Fallback for any other type
                    codes_text += f"Code data: {str(code)}\n\n"

        return codes_text
