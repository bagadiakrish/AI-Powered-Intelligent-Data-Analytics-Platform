from django.db import models
from datasets.models import Dataset


class TrainedModel(models.Model):

    ALGORITHM_CHOICES = (
        ("Linear Regression", "Linear Regression"),
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="trained_models",
    )

    algorithm = models.CharField(
        max_length=100,
        choices=ALGORITHM_CHOICES,
    )

    target_column = models.CharField(
    max_length=255,
    null=True,
    blank=True,
    )

    feature_columns = models.JSONField(
        null=True,
        blank=True,
    )

    r2_score = models.FloatField(
        null=True,
        blank=True,
    )

    mae = models.FloatField(
        null=True,
        blank=True,
    )

    mse = models.FloatField(
        null=True,
        blank=True,
    )

    model_file = models.FileField(
        upload_to="trained_models/",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.algorithm} - {self.dataset.original_filename}"