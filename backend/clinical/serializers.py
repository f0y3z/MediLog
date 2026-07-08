from rest_framework import serializers
from .models import DoctorVisit, Prescription, TestsOrdered

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class TestsOrderedSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestsOrdered
        fields = '__all__'

class DoctorVisitSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    tests_ordered = TestsOrderedSerializer(many=True, read_only=True)

    class Meta:
        model = DoctorVisit
        fields = '__all__'
        read_only_fields = ('user', 'prescription_status', 'diagnosis')