from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class LabReport(models.Model):
    TEST_TYPE_CHOICES = [
        ('Blood Test', 'Blood Test'),
        ('USG', 'USG'),
        ('X-Ray', 'X-Ray'),
        ('ECG', 'ECG'),
        ('MRI', 'MRI'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Processing'),
        ('PARSED', 'Successfully Parsed'),
        ('FAILED', 'Extraction Failed'),
    ]

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    # Optional link to a doctor visit as noted in V1 spec (V2 will handle tight structural constraints)
    visit = models.ForeignKey('clinical.DoctorVisit', on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_lab_reports') 
    
    # Core Files & Meta
    file = models.FileField(upload_to='lab_reports/%Y/%m/%d/', help_text="Raw PDF or image file")
    test_type = models.CharField(max_length=50, choices=TEST_TYPE_CHOICES, blank=True, null=True)
    report_date = models.DateField(blank=True, null=True)
    notes = models.TextField(null=True, blank=True)
    
    # AI Extracted Fields
    metrics = models.JSONField(default=dict, blank=True, null=True, help_text="Flat key-value schema extracted by Gemini")
    summary = models.TextField(null=True, blank=True, help_text="AI plain-English breakdown summary")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        owner = self.user.email if self.user else "unassigned"
        return f"{self.test_type or 'Pending type'} - {self.report_date or 'Pending date'} ({owner})"
