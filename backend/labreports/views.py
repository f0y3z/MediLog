from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .models import LabReport
from .serializers import LabReportSerializer
from .tasks import process_lab_report

User = get_user_model()

class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer

    def perform_create(self, serializer):
        # Match your other apps: fallback to User.objects.first() instead of None
        user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        
        # Save the database record with the resolved user
        instance = serializer.save(user=user)
        
        # Offload the job immediately to Redis/Celery!
        process_lab_report.delay(instance.id)