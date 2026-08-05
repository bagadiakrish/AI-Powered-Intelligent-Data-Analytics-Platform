from rest_framework import serializers


class TrainModelSerializer(serializers.Serializer):

    dataset_id = serializers.IntegerField()

    target_column = serializers.CharField(
        max_length=255,
    )

    feature_columns = serializers.ListField(
        child=serializers.CharField(
            max_length=255,
        ),
        allow_empty=False,
    )

    test_size = serializers.FloatField(
        default=0.2,
        min_value=0.1,
        max_value=0.5,
    )

    random_state = serializers.IntegerField(
        default=42,
    )
from .models import TrainedModel


class TrainedModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = TrainedModel
        fields = [
            "id",
            "algorithm",
            "target_column",
            "feature_columns",
            "r2_score",
            "mae",
            "mse",
            "model_file",
            "created_at",
        ]