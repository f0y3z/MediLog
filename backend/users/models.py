from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    # Remove username field and use email as primary identifier
    username = None
    email = models.EmailField(unique=True)
    
    # Profile fields specified in design doc
    date_of_birth = models.DateField(null=True, blank=True, help_text="Used for age-based AI suggestions")
    gender = models.CharField(max_length=20, null=True, blank=True, help_text="Used in health baseline calculations")
    blood_group = models.CharField(max_length=10, null=True, blank=True, help_text="Stored for quick reference")
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

# Append to the bottom of users/models.py

class DoctorVisit(models.Model):
    # Link it to the user who visited the doctor
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visits')
    doctor_name = models.CharField(max_length=150)
    visit_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit to {self.doctor_name} on {self.visit_date}"