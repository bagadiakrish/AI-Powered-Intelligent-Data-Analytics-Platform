from rest_framework import serializers


class VisualizationSerializer(serializers.Serializer):

    chart_type = serializers.ChoiceField(
        choices=[
            "bar",
            "pie",
            "line",
            "histogram",
            "box",
            "heatmap",
            "scatter",
        ]
    )

    column = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    x_column = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    y_column = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate(self, attrs):

        chart = attrs["chart_type"]

        if chart == "heatmap":
            return attrs

        if chart == "scatter":

            if "x_column" not in attrs:
                raise serializers.ValidationError(
                    {
                        "x_column": "This field is required."
                    }
                )

            if "y_column" not in attrs:
                raise serializers.ValidationError(
                    {
                        "y_column": "This field is required."
                    }
                )

            return attrs

        if "column" not in attrs:

            raise serializers.ValidationError(
                {
                    "column": "This field is required."
                }
            )

        return attrs