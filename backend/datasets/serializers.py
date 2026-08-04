from rest_framework import serializers

from .models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Dataset
        fields = [
            "id",
            "title",
            "description",
            "uploaded_file",
            "file_type",
            "file_size",
            "total_rows",
            "total_columns",
            "uploaded_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "file_size",
            "total_rows",
            "total_columns",
            "uploaded_by",
            "created_at",
            "updated_at",
        ]