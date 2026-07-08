# symptoms/views.py
from rest_framework import viewsets, permissions
from .models import SymptomLog
from .serializers import SymptomLogSerializer

class SymptomLogViewSet(viewsets.ModelViewSet):
    serializer_class = SymptomLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SymptomLog.objects.filter(user=self.request.user).order_by('-logged_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
