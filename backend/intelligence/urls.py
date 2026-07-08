# intelligence/urls.py
from django.urls import path
from .views import EarlyDetectionAnalysisView

urlpatterns = [
    path('intelligence/analyze/', EarlyDetectionAnalysisView.as_view(), name='early-detection'),
]