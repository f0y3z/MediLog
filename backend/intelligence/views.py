# intelligence/views.py
import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from google import genai

from symptoms.models import SymptomLog
from labreports.models import LabReport
from clinical.models import DoctorVisit

class EarlyDetectionAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        api_key = os.environ.get("GEMINI_API_KEY", getattr(settings, "GEMINI_API_KEY", ""))
        if not api_key:
            return Response(
                {"error": "AI analysis needs GEMINI_API_KEY in backend/.env."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Gather Timeline Datasets
        symptoms = SymptomLog.objects.filter(user=user).order_by('logged_at')
        reports = LabReport.objects.filter(user=user).order_by('report_date')
        visits = DoctorVisit.objects.filter(user=user).order_by('created_at')

        # Build clean clinical context profile string
        history_context = f"Patient Profile Context:\n"
        
        history_context += "\n[SYMPTOM TIMELINE]\n"
        for s in symptoms:
            history_context += f"- {s.logged_at.date()}: {s.symptom_name} (Severity: {s.get_severity_display()}). Notes: {s.notes or 'None'}\n"

        history_context += "\n[LAB BIOMARKER HISTORICAL METRICS]\n"
        for lr in reports:
            history_context += f"- {lr.report_date} [{lr.test_type}]: Metrics JSON: {json.dumps(lr.metrics)}. Summary: {lr.summary or 'None'}\n"

        history_context += "\n[CLINICAL DOCTOR VISITS]\n"
        for v in visits:
            history_context += f"- {v.created_at.date()}: Specialized in {v.specialization}. Complaint: {v.chief_complaint}. Status: {v.prescription_status}\n"

        # System prompt ensuring structured output constraints
        system_prompt = """
        You are an advanced medical intelligence engine specializing in early disease detection, correlation analysis, and preventive medicine.
        Analyze the patient's chronological history. Look for trends, such as shifting biomarker values correlating with increased symptom tracking frequency/severity.
        
        Provide your assessment as a single flat JSON object matching this structure exactly:
        {
            "risk_level": "LOW" | "MEDIUM" | "HIGH",
            "detected_correlations": ["List cross-domain findings, e.g., 'Spike in HbA1c metrics aligns with increased tracking of fatigue symptoms'"],
            "early_warning_signs": ["List potential early indicators of chronic or acute conditions developing"],
            "biomarkers_of_concern": ["List specific lab values out of range that match clinical patterns"],
            "clinical_recommendations": ["Actionable, safe next steps, e.g., 'Schedule follow-up fasting glucose test', 'Consult specialist'"],
            "plain_summary": "A compassionate, clear, executive health status summary for the patient."
        }
        Do not output markdown block ticks like ```json. Return raw valid JSON text only.
        """

        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[system_prompt, history_context]
            )
            
            analysis_data = json.loads(response.text.strip())
            return Response(analysis_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Analysis engine fault: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
