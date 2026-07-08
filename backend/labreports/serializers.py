from rest_framework import serializers
from django.utils import timezone
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
        extra_kwargs = {
            'test_type': {'required': False, 'allow_blank': True},
            'report_date': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        visit = attrs.get('visit')
        if request and visit and visit.user_id != request.user.id:
            raise serializers.ValidationError({'visit': 'Selected visit was not found.'})
        if not attrs.get('test_type'):
            attrs['test_type'] = 'Other'
        if not attrs.get('report_date'):
            attrs['report_date'] = timezone.localdate()
        return attrs
