from rest_framework import serializers
from .models import Dataset

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ("id", "title", "file", "rows", "cols", "size_bytes", "created_at")
        read_only_fields = ("rows", "cols", "size_bytes")
