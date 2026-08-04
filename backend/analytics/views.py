from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from datasets.models import Dataset
from .services import AnalyticsService


class BaseDatasetAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get_dataset(self, dataset_id, user):

        try:
            return Dataset.objects.get(
                id=dataset_id,
                uploaded_by=user,
            )

        except Dataset.DoesNotExist:
            return None


class DatasetOverviewAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_overview(dataset)
        )


class DatasetSummaryAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_summary(dataset)
        )


class DatasetPreviewAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_preview(dataset)
        )


class DatasetColumnStatisticsAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_column_statistics(dataset)
        )


class DatasetValueCountsAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        column = request.query_params.get("column")

        if not column:
            return Response(
                {"error": "column query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            return Response(
                AnalyticsService.get_value_counts(
                    dataset,
                    column,
                )
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DatasetMissingValuesAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_missing_values(dataset)
        )


class DatasetDuplicateReportAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_duplicate_report(dataset)
        )


class DatasetCorrelationAPIView(BaseDatasetAPIView):

    def get(self, request, dataset_id):

        dataset = self.get_dataset(dataset_id, request.user)

        if not dataset:
            return Response(
                {"error": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AnalyticsService.get_correlation(dataset)
        )