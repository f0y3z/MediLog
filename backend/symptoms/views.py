# symptoms/views.py
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .models import SymptomLog
from .serializers import SymptomLogSerializer

User = get_user_model()

class SymptomLogViewSet(viewsets.ModelViewSet):
    serializer_class = SymptomLogSerializer
    permission_classes = [permissions.AllowAny] # Revert to IsAuthenticated post-testing

    def get_queryset(self):
        if not self.request.user or self.request.user.is_anonymous:
            return SymptomLog.objects.all().order_by('-logged_at')
        return SymptomLog.objects.filter(user=self.request.user).order_by('-logged_at')

    def perform_create(self, serializer):
        test_user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        serializer.save(user=test_user)