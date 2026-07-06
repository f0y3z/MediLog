from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabReportViewSet

router = DefaultRouter()
router.register(r'', LabReportViewSet, basename='labreport')

urlpatterns = [
    path('', include(router.urls)),
]