# timeline/urls.py
from django.urls import path
from .views import PatientTimelineView

urlpatterns = [
    path('', PatientTimelineView.as_view(), name='patient-timeline'),
]