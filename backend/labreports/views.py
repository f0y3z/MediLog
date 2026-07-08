from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import LabReport
from .serializers import LabReportSerializer
from .tasks import process_lab_report

class LabReportViewSet(viewsets.ModelViewSet):
    serializer_class = LabReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LabReport.objects.filter(user=self.request.user).order_by('-report_date', '-created_at')

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)

        try:
            process_lab_report.delay(instance.id)
        except Exception:
            process_lab_report(instance.id)
