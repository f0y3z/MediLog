import json
from google import genai
from google.genai import types
from django.conf import settings
from celery import shared_task
from .models import LabReport

@shared_task
def process_lab_report(report_id):
    try:
        report = LabReport.objects.get(id=report_id)
    except LabReport.DoesNotExist:
        return f"LabReport {report_id} not found."

    try:
        # 1. Initialize the modern GenAI Client
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # 2. Extract file bytes and type context
        file_bytes = report.file.read()
        mime_type = "application/pdf" if report.file.name.lower().endswith('.pdf') else "image/jpeg"
        
        prompt = """
        You are an expert clinical processing AI assistant. Analyze the attached lab report document.
        Perform two actions:
        1. Extract all biological metrics, biomarkers, standard measurements, and structural interpretations found in the report into a single flat JSON object where keys are the lowercased clean test names, and values are strings containing the numerical results and units (e.g. {"hemoglobin": "11.2 g/dL", "wbc": "6800 /µL"}).
        2. Generate a cohesive, plain-English summary sentence outlining the primary impression or biological trends noticed.

        Your output must be single structured valid JSON markdown block match exactly this format:
        {
          "metrics": {"key": "value"},
          "summary": "Plain English summary here"
        }
        """

        # 3. Request Multi-Modal parsing using the 2.5 model
        # FIX: Wrap the file bytes using types.Part.from_bytes
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type,
                ),
                prompt
            ]
        )
        
        # Clean markdown wrap elements if returned
        clean_text = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_text)
        
        # 4. Populate and Commit Changes back to database
        report.metrics = data.get("metrics", {})
        report.summary = data.get("summary", "Extraction completed successfully.")
        report.status = 'PARSED'
        report.save()
        
    except Exception as e:
        report.status = 'FAILED'
        report.summary = f"Error processing document context: {str(e)}"
        report.save()
        raise e