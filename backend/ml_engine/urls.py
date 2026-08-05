from django.urls import path
from .views import TrainModelView, TrainedModelListView, TrainedModelDetailDeleteView

urlpatterns = [
    path("train/", TrainModelView.as_view(), name="ml-train"),
    path("models/", TrainedModelListView.as_view(), name="ml-models"),
    path("models/<int:pk>/", TrainedModelDetailDeleteView.as_view(), name="ml-model-detail-delete"),
]
