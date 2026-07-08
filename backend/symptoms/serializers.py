# symptoms/serializers.py
from rest_framework import serializers
from .models import SymptomLog

class SymptomLogSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = SymptomLog
        fields = ['id', 'symptom_name', 'severity', 'severity_display', 'notes', 'logged_at']
        read_only_fields = ['id', 'logged_at']
