# intelligence/serializers.py
from rest_framework import serializers

class HealthAnalysisSerializer(serializers.Serializer):
    risk_level = serializers.CharField() # "LOW", "MEDIUM", "HIGH"
    detected_correlations = serializers.ListField(child=serializers.CharField())
    early_warning_signs = serializers.ListField(child=serializers.CharField())
    biomarkers_of_concern = serializers.ListField(child=serializers.CharField())
    clinical_recommendations = serializers.ListField(child=serializers.CharField())
    plain_summary = serializers.CharField()