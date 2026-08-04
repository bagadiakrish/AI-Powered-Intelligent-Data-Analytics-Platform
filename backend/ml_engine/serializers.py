from rest_framework import serializers


class LinearRegressionSerializer(serializers.Serializer):

    feature_columns = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )

    target_column = serializers.CharField()