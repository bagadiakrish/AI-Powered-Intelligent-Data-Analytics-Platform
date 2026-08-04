from django.urls import path

from .views import LinearRegressionAPIView

urlpatterns = [

    path(
        "<int:dataset_id>/linear-regression/",
        LinearRegressionAPIView.as_view(),
        name="linear-regression",
    ),
]