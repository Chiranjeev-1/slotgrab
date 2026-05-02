from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    field = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


class Business(models.Model):
    business_id = models.AutoField(primary_key=True)
    business_name = models.CharField(max_length=255)
    address = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='businesses')
    business_field = models.CharField(max_length=255, blank=True)
    domain = models.CharField(max_length=255, blank=True)
    gst_no = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.business_name


class Service(models.Model):
    service_id = models.AutoField(primary_key=True)
    service_name = models.CharField(max_length=255)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='services')
    service_desc = models.TextField(blank=True)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.service_name


class Slot(models.Model):
    slot_id = models.AutoField(primary_key=True)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.date} {self.time}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    appointment_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='appointments')
    slot = models.ForeignKey(
        Slot,
        on_delete=models.CASCADE,
        related_name='appointments'  # changed from 'appointment' to 'appointments'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment {self.appointment_id} - {self.user.username}"