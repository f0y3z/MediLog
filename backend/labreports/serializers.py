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
        read_only_fields = ['id', 'user', 'metrics', 'summary', 'status', 'status_display', 'created_at']

    def validate_visit(self, visit):
        request = self.context.get('request')
        if visit and request and request.user.is_authenticated and visit.user_id != request.user.id:
            raise serializers.ValidationError("Linked visit does not belong to the current user.")
        return visit

    def validate(self, attrs):
        # Additional custom metrics validations can be written here if frontend submits raw strings
        return attrs
