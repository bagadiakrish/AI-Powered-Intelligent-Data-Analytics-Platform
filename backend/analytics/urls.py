from django.urls import path
from .views import DatasetOverviewView, DatasetCorrelationView, DatasetCrosstabView

urlpatterns = [
    path("<int:dataset_id>/overview/", DatasetOverviewView.as_view(), name="analytics-overview"),
    path("<int:dataset_id>/correlation/", DatasetCorrelationView.as_view(), name="analytics-correlation"),
    path("<int:dataset_id>/crosstab/", DatasetCrosstabView.as_view(), name="analytics-crosstab"),
]
