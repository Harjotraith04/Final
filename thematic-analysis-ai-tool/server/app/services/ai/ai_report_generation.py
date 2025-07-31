from sqlalchemy.orm import Session
from app.services.ai.llm_service import LLMService
from app.services.ai.ai_coding_utils import AICodingUtils
# Ensure this import is recognized
from app.schemas.ai_services import ReportOutput


class AIReportGenerationService:
    """Service for generating reports based on themes and code assignments"""

    @staticmethod
    def generate_report(
        code_assignments: list,
        db: Session,
        user_id: int,
        model_name: str = "gemini-2.0-flash",
        provider: str = "google_genai"
    ) -> dict:
        """Generate a report using LLM based on code assignments"""
        print(
            f"📄 Starting report generation for {len(code_assignments)} assignments")

        # Debug the structure of the first assignment
        if code_assignments:
            first_assignment = code_assignments[0]
            if isinstance(first_assignment, dict):
                print(f"📌 Assignment keys: {list(first_assignment.keys())}")
            else:
                print(f"📌 Assignment type: {type(first_assignment)}")

        llm_service = LLMService(model_name=model_name, provider=provider)

        # Extract code and theme information safely
        codes_summary_lines = []
        themes_summary_lines = []

        # Process each assignment
        for assignment in code_assignments:
            # Extract code information
            if isinstance(assignment, dict):
                # Handle dictionary objects
                text = assignment.get('text', '')
                if text:
                    codes_summary_lines.append(f"- {text}")

                # Extract theme information if available
                theme_id = assignment.get('theme_id')
                if theme_id is not None:
                    theme_name = assignment.get('theme_name', 'Unnamed Theme')
                    theme_desc = assignment.get(
                        'theme_description', 'No description')
                    theme_entry = f"- {theme_name}: {theme_desc}"
                    if theme_entry not in themes_summary_lines:
                        themes_summary_lines.append(theme_entry)
            else:
                # Handle object-like assignments
                try:
                    # Try to get text attribute
                    text = getattr(assignment, 'text', '')
                    if text:
                        codes_summary_lines.append(f"- {text}")

                    # Try to get theme info
                    if hasattr(assignment, 'theme') and assignment.theme:
                        theme_name = getattr(
                            assignment.theme, 'name', 'Unnamed Theme')
                        theme_desc = getattr(
                            assignment.theme, 'description', 'No description')
                        theme_entry = f"- {theme_name}: {theme_desc}"
                        if theme_entry not in themes_summary_lines:
                            themes_summary_lines.append(theme_entry)
                except Exception as e:
                    print(f"⚠️ Error processing assignment object: {str(e)}")

        # Prepare input data for LLM
        input_data = {
            "codes_summary": "\n".join(codes_summary_lines) if codes_summary_lines else "No codes available",
            "themes_summary": "\n".join(themes_summary_lines) if themes_summary_lines else "No themes available",
            "assignments_count": len(code_assignments)
        }

        try:
            # Log what we're sending to the LLM
            print(
                f"📝 Sending data to LLM: {len(input_data['codes_summary'])} chars of code data, {len(input_data['themes_summary'])} chars of theme data")

            # Generate report using LLM
            report_response: ReportOutput = AICodingUtils.make_rate_limited_llm_call(
                llm_service=llm_service,
                service_type="report_generation",
                input_data=input_data,
                provider=provider
            )

            # Handle response safely
            if hasattr(report_response, 'report_text') and hasattr(report_response, 'summary'):
                print(f"✅ Successfully generated report")
                return {
                    "report": report_response.report_text,
                    "summary": report_response.summary
                }
            else:
                # Handle case where response doesn't have expected structure
                print(
                    f"⚠️ Unexpected report response structure: {type(report_response)}")
                return {
                    "report": str(report_response),
                    "summary": "Report generated with unexpected structure"
                }

        except Exception as e:
            import traceback
            print(f"❌ Error generating report: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return {"error": str(e)}
