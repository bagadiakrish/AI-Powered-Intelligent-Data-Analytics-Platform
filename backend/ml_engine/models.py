from django.db import models
from django.conf import settings
from datasets.models import Dataset

class TrainedModel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="models")
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="models")
    dataset_title = models.CharField(max_length=255, default="")
    algorithm = models.CharField(max_length=100)
    target_column = models.CharField(max_length=100)
    parameters = models.JSONField(default=dict)
    
    # Regression metrics (Unit 4.3)
    r2_score = models.FloatField(null=True, blank=True)
    mae = models.FloatField(null=True, blank=True)
    mse = models.FloatField(null=True, blank=True)
    
    # Classification metrics (Unit 5.3)
    accuracy = models.FloatField(null=True, blank=True)
    error_rate = models.FloatField(null=True, blank=True)
    sensitivity = models.FloatField(null=True, blank=True)
    specificity = models.FloatField(null=True, blank=True)
    confusion_matrix = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.algorithm} on {self.target_column} ({self.created_at})"
