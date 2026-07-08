# symptoms/urls.py
from rest_framework.routers import DefaultRouter
from .views import SymptomLogViewSet

router = DefaultRouter()
router.register(r'', SymptomLogViewSet, basename='symptom-log')

urlpatterns = router.urls