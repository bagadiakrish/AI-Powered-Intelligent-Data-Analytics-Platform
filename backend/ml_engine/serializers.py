from rest_framework import serializers
from .models import TrainedModel


class TrainModelSerializer(serializers.Serializer):

    dataset_id = serializers.IntegerField()

    algorithm = serializers.ChoiceField(
        choices=[
            "linear_regression",
        ]
    )

    target_column = serializers.CharField()

    feature_columns = serializers.ListField(
        child=serializers.CharField(),
    )

    test_size = serializers.FloatField(
        default=0.2
    )

    random_state = serializers.IntegerField(
        default=42
    )


class PredictionSerializer(serializers.Serializer):

    model_id = serializers.IntegerField()

    input_data = serializers.ListField(
        child=serializers.FloatField()
    )


class TrainedModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = TrainedModel
        fields = "__all__"