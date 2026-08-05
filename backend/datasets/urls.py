from django.urls import path
from .views import (
    DatasetListCreateView,
    DatasetDetailDeleteView,
    DatasetDownloadView,
    DatasetPreviewView,
    DatasetCleanView,
)

urlpatterns = [
    path("", DatasetListCreateView.as_view(), name="dataset-list-create"),
    path("<int:pk>/", DatasetDetailDeleteView.as_view(), name="dataset-detail-delete"),
    path("<int:pk>/download/", DatasetDownloadView.as_view(), name="dataset-download"),
    path("<int:pk>/preview/", DatasetPreviewView.as_view(), name="dataset-preview"),
    path("<int:pk>/clean/", DatasetCleanView.as_view(), name="dataset-clean"),
]
