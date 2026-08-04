from django.conf import settings
from django.db import models


class Dataset(models.Model):
    FILE_TYPES = [
        ("csv", "CSV"),
        ("xlsx", "Excel"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    uploaded_file = models.FileField(upload_to="datasets/")

    file_type = models.CharField(
        max_length=10,
        choices=FILE_TYPES,
    )

    file_size = models.PositiveBigIntegerField()

    total_rows = models.PositiveIntegerField(default=0)
    total_columns = models.PositiveIntegerField(default=0)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datasets",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title