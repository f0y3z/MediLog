# timeline/views.py
import datetime
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils import timezone
from django.conf import settings

# Direct explicit model imports
from symptoms.models import SymptomLog
from labreports.models import LabReport
from clinical.models import DoctorVisit

logger = logging.getLogger(__name__)

class PatientTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        timeline_data = []

        # ==========================================
        # 2. Extract & Format Symptom Logs
        # ==========================================
        symptoms = SymptomLog.objects.filter(user=user)
        for s in symptoms:
            timeline_data.append({
                'id': s.id,
                'event_type': 'SYMPTOM',
                'title': s.symptom_name,
                'subtitle': f"Severity: {s.get_severity_display()}",
                'timestamp': s.logged_at,
                'status': None
            })

        # ==========================================
        # 3. Extract & Format Lab Reports 
        # ==========================================
        reports = LabReport.objects.filter(user=user)
        for lr in reports:
            try:
                # Upgrading DateField cleanly to match standard tz-aware datetime objects
                naive_datetime = datetime.datetime.combine(lr.report_date, datetime.time.min)
                report_timestamp = timezone.make_aware(naive_datetime) if settings.USE_TZ else naive_datetime
                
                timeline_data.append({
                    'id': lr.id,
                    'event_type': 'LAB_REPORT',
                    'title': f"{lr.test_type} Uploaded",
                    'subtitle': lr.summary or "Biomarker metrics recorded.",
                    'timestamp': report_timestamp,
                    'status': lr.status
                })
            except Exception as e:
                logger.warning("Failed compiling report %s for timeline: %s", lr.id, e)

        # ==========================================
        # 4. Extract & Format Doctor Visits
        # ==========================================
        visits = DoctorVisit.objects.filter(user=user)
        for v in visits:
            timeline_data.append({
                'id': v.id,
                'event_type': 'DOCTOR_VISIT',
                'title': v.doctor_name or "Doctor Appointment",
                'subtitle': v.clinic_or_hospital or "Prescription logged",
                'timestamp': v.created_at,
                'status': v.prescription_status
            })

        # ==========================================
        # 5. Chronological Sort & Return
        # ==========================================
        timeline_data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response(timeline_data, status=status.HTTP_200_OK)
