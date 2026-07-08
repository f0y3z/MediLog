from rest_framework import viewsets, permissions
from .models import DoctorVisit
from .serializers import DoctorVisitSerializer
from celery import current_app

class DoctorVisitViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DoctorVisit.objects.filter(user=self.request.user).order_by('-visit_date')

    def perform_create(self, serializer):
        visit = serializer.save(user=self.request.user)
        
        if visit.prescription_file:
            current_app.send_task('clinical.tasks.process_prescription', args=[visit.id])
