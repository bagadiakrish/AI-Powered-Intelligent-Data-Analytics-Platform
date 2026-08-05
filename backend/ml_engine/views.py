from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import TrainedModelSerializer
from .serializers import TrainModelSerializer
from .services import MLService,PredictionService
from .models import TrainedModel
from .serializers import (
    TrainModelSerializer,
    PredictionSerializer,
)

class TrainModelAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = TrainModelSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data


        result = MLService.train_linear_regression(
            data
        )

        return Response(result)
class TrainedModelListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        models = TrainedModel.objects.all().order_by("-created_at")

        serializer = TrainedModelSerializer(
            models,
            many=True,
        )

        return Response(serializer.data)
class TrainedModelDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            model = TrainedModel.objects.get(pk=pk)
        except TrainedModel.DoesNotExist:
            return Response(
                {"error": "Model not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TrainedModelSerializer(model)

        return Response(serializer.data)
class PredictAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = PredictionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        result = PredictionService.predict(
            serializer.validated_data["model_id"],
            serializer.validated_data["input_data"],
        )

        return Response(result)