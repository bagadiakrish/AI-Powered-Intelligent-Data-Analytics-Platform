from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Dataset
from .serializers import DatasetSerializer
from .services import DatasetService


class DatasetUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            file_type = DatasetService.get_file_type(uploaded_file)

            dataframe = DatasetService.read_dataset(
                uploaded_file,
                file_type,
            )

            metadata = DatasetService.extract_metadata(dataframe)

            uploaded_file.seek(0)

            dataset = Dataset.objects.create(
                title=request.data.get("title", uploaded_file.name),
                description=request.data.get("description", ""),
                uploaded_file=uploaded_file,
                file_type=file_type,
                file_size=uploaded_file.size,
                total_rows=metadata["rows"],
                total_columns=metadata["columns"],
                uploaded_by=request.user,
            )

            serializer = DatasetSerializer(dataset)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )