from django.contrib import admin
from .models import TrainedModel


@admin.register(TrainedModel)
class TrainedModelAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "algorithm",
        "dataset",
        "target_column",
        "r2_score",
        "created_at",
    )

    search_fields = (
        "algorithm",
        "target_column",
    )

    list_filter = (
        "algorithm",
        "created_at",
    )