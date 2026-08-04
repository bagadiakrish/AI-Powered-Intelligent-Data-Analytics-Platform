from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ("admin","Admin"),
            ("analyst","Analyst"),
            ("user","User"),
        ],
        default="user",
    )

    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.username