import pandas as pd
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datasets.models import Dataset
from .services import AnalyticsService

class DatasetOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(Dataset, id=dataset_id, user=request.user)
        try:
            if dataset.file.path.endswith(".csv"):
                df = pd.read_csv(dataset.file.path)
            else:
                df = pd.read_excel(dataset.file.path)

            overview = AnalyticsService.get_overview(df)
            return Response(overview, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to compute overview: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DatasetCorrelationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        dataset = get_object_or_404(Dataset, id=dataset_id, user=request.user)
        try:
            if dataset.file.path.endswith(".csv"):
                df = pd.read_csv(dataset.file.path)
            else:
                df = pd.read_excel(dataset.file.path)

            correlation = AnalyticsService.get_correlation(df)
            return Response(correlation, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to compute correlation: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DatasetCrosstabView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        col1 = request.query_params.get("col1")
        col2 = request.query_params.get("col2")

        if not col1 or not col2:
            return Response({"detail": "Parameters col1 and col2 are required."}, status=status.HTTP_400_BAD_REQUEST)

        dataset = get_object_or_404(Dataset, id=dataset_id, user=request.user)
        try:
            if dataset.file.path.endswith(".csv"):
                df = pd.read_csv(dataset.file.path)
            else:
                df = pd.read_excel(dataset.file.path)

            crosstab = AnalyticsService.get_crosstab(df, col1, col2)
            return Response(crosstab, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to compute crosstab: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
