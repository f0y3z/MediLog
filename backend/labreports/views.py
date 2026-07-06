from rest_framework import viewsets
from .models import LabReport
from .serializers import LabReportSerializer # (Or whatever your serializer name is)

class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    def perform_create(self, serializer):
        # If logged in, save with request.user; fallback to None if unauthenticated
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)