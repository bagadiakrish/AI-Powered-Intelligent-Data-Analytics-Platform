from django.contrib import admin

from .models import Dataset


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "uploaded_by",
        "file_type",
        "total_rows",
        "total_columns",
        "created_at",
    )

    list_filter = (
        "file_type",
        "created_at",
    )

    search_fields = (
        "title",
        "uploaded_by__username",
    )