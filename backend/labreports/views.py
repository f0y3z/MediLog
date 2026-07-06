from rest_framework import viewsets
from .models import LabReport
from .serializers import LabReportSerializer
from .tasks import process_lab_report

class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer

    def perform_create(self, serializer):
        # 1. Fallback to None if the request is anonymous
        user = self.request.user if self.request.user.is_authenticated else None
        
        # 2. Save the database record
        instance = serializer.save(user=user)
        
        # 3. Offload the job immediately to Redis/Celery!
        process_lab_report.delay(instance.id)