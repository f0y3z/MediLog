import json
from datetime import datetime

from celery import shared_task
from django.conf import settings
from django.utils.dateparse import parse_date
from google import genai
from google.genai import types

from .models import LabReport


def _extract_json_object(raw_text):
    text = (raw_text or "").strip()
    if text.startswith("```json"):
        text = text.removeprefix("```json").strip()
    if text.startswith("```"):
        text = text.removeprefix("```").strip()
    if text.endswith("```"):
        text = text.removesuffix("```").strip()

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


def _mime_type_for_file(file_name):
    lowered = file_name.lower()
    if lowered.endswith(".pdf"):
        return "application/pdf"
    if lowered.endswith(".png"):
        return "image/png"
    if lowered.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"

def _normalize_test_type(value):
    if not value:
        return None
    normalized = value.strip().lower()
    if not normalized:
        return None

    valid_test_types = {
        "blood test": "Blood Test",
        "usg": "USG",
        "x-ray": "X-Ray",
        "xray": "X-Ray",
        "ecg": "ECG",
        "mri": "MRI",
        "other": "Other",
    }
    return valid_test_types.get(normalized, "Other")

def _normalize_report_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if hasattr(value, "isoformat"):
        return value
    raw = str(value).strip()
    if not raw:
        return None
    return parse_date(raw)


@shared_task
def process_lab_report(report_id):
    try:
        report = LabReport.objects.get(id=report_id)
    except LabReport.DoesNotExist:
        return f"LabReport {report_id} not found."

    try:
        if not settings.GEMINI_API_KEY:
            report.status = "FAILED"
            report.metrics = {}
            report.summary = "Report uploaded successfully, but AI parsing needs GEMINI_API_KEY in backend/.env."
            report.save(update_fields=["status", "metrics", "summary"])
            return f"LabReport {report_id} saved without AI parsing."

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        with report.file.open("rb") as uploaded_file:
            file_bytes = uploaded_file.read()

        prompt = """
        You are an expert clinical processing assistant. Analyze the attached lab report document.
        Return only valid JSON with this exact shape:
        {
          "test_type": "Blood Test|USG|X-Ray|ECG|MRI|Other",
          "report_date": "YYYY-MM-DD",
          "metrics": {"key": "value"},
          "summary": "Plain English summary here"
        }

        test_type must be one of: Blood Test, USG, X-Ray, ECG, MRI, Other.
        report_date should be the document report date when visible, otherwise empty string.
        For metrics, extract biological measurements, biomarkers, and structural interpretations into
        one flat object. Use lowercased clean test names as keys and result text with units as values,
        for example {"hemoglobin": "11.2 g/dL", "wbc": "6800 /uL"}.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=_mime_type_for_file(report.file.name),
                ),
                prompt,
            ],
        )

        data = _extract_json_object(response.text)
        parsed_test_type = _normalize_test_type(data.get("test_type"))
        parsed_report_date = _normalize_report_date(data.get("report_date"))
        report.metrics = data.get("metrics", {})
        report.summary = data.get("summary", "Extraction completed successfully.")
        if not report.test_type and parsed_test_type:
            report.test_type = parsed_test_type
        if not report.report_date and parsed_report_date:
            report.report_date = parsed_report_date
        report.status = "PARSED"
        report.save(update_fields=["test_type", "report_date", "metrics", "summary", "status"])
        return f"LabReport {report_id} parsed successfully."

    except Exception as exc:
        report.status = "FAILED"
        report.metrics = report.metrics or {}
        report.summary = f"Report uploaded successfully, but parsing failed: {exc}"
        report.save(update_fields=["status", "metrics", "summary"])
        return f"Failed to parse LabReport {report_id}: {exc}"
