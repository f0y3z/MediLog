from rest_framework import serializers
from .models import LabReport

class LabReportSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LabReport
        fields = [
            'id', 'user', 'visit', 'file', 'test_type', 
            'report_date', 'notes', 'metrics', 'summary', 
            'status', 'status_display', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at']

    def validate(self, attrs):
        # Additional custom metrics validations can be written here if frontend submits raw strings
        return attrs