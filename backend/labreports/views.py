from rest_framework import viewsets, permissions
from .models import LabReport
from .serializers import LabReportSerializer
from .tasks import process_lab_report

class LabReportViewSet(viewsets.ModelViewSet):
    serializer_class = LabReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LabReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        
        # Offload the job immediately to Redis/Celery!
        process_lab_report.delay(instance.id)
