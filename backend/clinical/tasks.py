import json
import os
from celery import shared_task
from django.conf import settings
from google import genai
from google.genai import types
from .models import DoctorVisit

@shared_task(name='clinical.tasks.process_prescription')
def process_prescription(visit_id):
    try:
        visit = DoctorVisit.objects.get(id=visit_id)
        if not visit.prescription_file:
            return "No file uploaded"

        api_key = os.environ.get("GEMINI_API_KEY", getattr(settings, "GEMINI_API_KEY", ""))
        if not api_key:
            visit.prescription_status = 'FAILED'
            visit.doctor_notes = "Prescription uploaded successfully, but AI parsing needs GEMINI_API_KEY in backend/.env."
            visit.save(update_fields=['prescription_status', 'doctor_notes'])
            return f"Saved clinical visit {visit_id} without AI parsing"

        client = genai.Client(api_key=api_key)

        # Read the raw file data safely from disk
        file_path = visit.prescription_file.path
        with open(file_path, 'rb') as f:
            file_bytes = f.read()

        # Determine structural MIME type
        ext = os.path.splitext(file_path)[1].lower()
        mime_type = "application/pdf" if ext == ".pdf" else "image/jpeg"

        # Structural prompt optimization for structured JSON parsing
        prompt = """
        Analyze this prescription document. Extract these properties into a flat JSON object:
        {
            "doctor_name": "Name of the doctor",
            "clinic_or_hospital": "Name of the facility/hospital",
            "specialization": "Specialty of the doctor",
            "chief_complaint": "Reason for visit or main symptoms listed"
        }
        Return pure JSON without markdown codeblock wrappers like ```json.
        """

        # Using types.Part.from_bytes to satisfy the new SDK parameters schema cleanly
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                )
            ]
        )

        # Parse inference results
        ai_data = json.loads(response.text.strip())
        
        # Populate DB fields smoothly
        visit.doctor_name = ai_data.get('doctor_name', 'Unknown Doctor')
        visit.clinic_or_hospital = ai_data.get('clinic_or_hospital', 'Unknown Facility')
        visit.specialization = ai_data.get('specialization', 'General')
        visit.chief_complaint = ai_data.get('chief_complaint', 'Not Stated')
        visit.prescription_status = 'PARSED'
        visit.save()
        
        return f"Successfully parsed clinical visit {visit_id}"

    except Exception as e:
        if 'visit' in locals():
            visit.prescription_status = 'FAILED'
            visit.doctor_notes = f"Extraction failure: {str(e)}"
            visit.save()
        return f"Failed clinical visit {visit_id}: {str(e)}"
