from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from datasets.models import Dataset
from .serializers import LinearRegressionSerializer
from .services import MLService


class LinearRegressionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, dataset_id):

        try:

            dataset = Dataset.objects.get(
                id=dataset_id,
                uploaded_by=request.user,
            )

        except Dataset.DoesNotExist:

            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LinearRegressionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        result = MLService.linear_regression(
            dataset,
            serializer.validated_data["feature_columns"],
            serializer.validated_data["target_column"],
        )

        return Response(result)