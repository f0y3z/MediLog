from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .models import DoctorVisit
from .serializers import DoctorVisitSerializer
from celery import current_app

User = get_user_model()

class DoctorVisitViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorVisitSerializer
    permission_classes = [permissions.AllowAny] # Set back to IsAuthenticated when testing is complete

    def get_queryset(self):
        if not self.request.user or self.request.user.is_anonymous:
            return DoctorVisit.objects.all().order_by('-visit_date')
        return DoctorVisit.objects.filter(user=self.request.user).order_by('-visit_date')

    def perform_create(self, serializer):
        test_user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        visit = serializer.save(user=test_user)
        
        if visit.prescription_file:
            current_app.send_task('clinical.tasks.process_prescription', args=[visit.id])