from django.urls import path

from .views import (
    DatasetOverviewAPIView,
    DatasetSummaryAPIView,
    DatasetPreviewAPIView,
    DatasetColumnStatisticsAPIView,
    DatasetValueCountsAPIView,
    DatasetMissingValuesAPIView,
    DatasetDuplicateReportAPIView,
    DatasetCorrelationAPIView,
)

urlpatterns = [

    path(
        "<int:dataset_id>/overview/",
        DatasetOverviewAPIView.as_view(),
        name="dataset-overview",
    ),

    path(
        "<int:dataset_id>/summary/",
        DatasetSummaryAPIView.as_view(),
        name="dataset-summary",
    ),

    path(
        "<int:dataset_id>/preview/",
        DatasetPreviewAPIView.as_view(),
        name="dataset-preview",
    ),

    path(
        "<int:dataset_id>/columns/",
        DatasetColumnStatisticsAPIView.as_view(),
        name="dataset-columns",
    ),

    path(
        "<int:dataset_id>/value-counts/",
        DatasetValueCountsAPIView.as_view(),
        name="dataset-value-counts",
    ),

    path(
        "<int:dataset_id>/missing/",
        DatasetMissingValuesAPIView.as_view(),
        name="dataset-missing",
    ),

    path(
        "<int:dataset_id>/duplicates/",
        DatasetDuplicateReportAPIView.as_view(),
        name="dataset-duplicates",
    ),

    path(
        "<int:dataset_id>/correlation/",
        DatasetCorrelationAPIView.as_view(),
        name="dataset-correlation",
    ),
]