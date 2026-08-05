from django.db import models
from django.conf import settings

class Dataset(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="datasets")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="uploaded_datasets/")
    rows = models.IntegerField(default=0)
    cols = models.IntegerField(default=0)
    size_bytes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"
