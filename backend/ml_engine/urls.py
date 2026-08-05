from django.urls import path
from .views import TrainModelAPIView, TrainedModelListAPIView,TrainedModelDetailAPIView,PredictAPIView


urlpatterns = [
    path(
        "train/",
        TrainModelAPIView.as_view(),
        name="train-model",
    ),
    path(
        "models/",
        TrainedModelListAPIView.as_view(),
        name="trained-model-list",
    ),
    path(
    "models/<int:pk>/",
    TrainedModelDetailAPIView.as_view(),
    name="trained-model-detail",
    
    ),
    path(
        "predict/",
        PredictAPIView.as_view(),
        name="predict",
    ),
]