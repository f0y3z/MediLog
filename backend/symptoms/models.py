# symptoms/models.py
from django.db import models
from django.conf import settings

class SymptomLog(models.Model):
    SEVERITY_CHOICES = [
        (1, '1 - Mild'),
        (2, '2 - Moderate'),
        (3, '3 - Severe'),
        (4, '4 - Very Severe'),
        (5, '5 - Extreme'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='symptoms')
    symptom_name = models.CharField(max_length=255) # e.g., "Headache", "Fever"
    severity = models.IntegerField(choices=SEVERITY_CHOICES, default=1)
    notes = models.TextField(blank=True, null=True) # Additional user context
    logged_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.symptom_name} ({self.get_severity_display()})"