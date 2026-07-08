from django.db import models
from django.conf import settings

class DoctorVisit(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARSED', 'Parsed'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visits')
    visit_date = models.DateField(auto_now_add=True)
    doctor_name = models.CharField(max_length=255, blank=True, null=True)
    clinic_or_hospital = models.CharField(max_length=255, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    chief_complaint = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    doctor_notes = models.TextField(blank=True, null=True)
    prescription_file = models.FileField(upload_to='prescriptions/', blank=True, null=True)
    prescription_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit {self.id} - {self.visit_date}"

class Prescription(models.Model):
    visit = models.ForeignKey(DoctorVisit, on_delete=models.CASCADE, related_name='prescriptions')
    drug_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration_days = models.IntegerField(blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)

class TestsOrdered(models.Model):
    visit = models.ForeignKey(DoctorVisit, on_delete=models.CASCADE, related_name='tests_ordered')
    test_name = models.CharField(max_length=255)
    lab_report = models.ForeignKey('labreports.LabReport', on_delete=models.SET_NULL, blank=True, null=True, related_name='linked_tests')