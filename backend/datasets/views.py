import os
import pandas as pd
import numpy as np
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Dataset
from .serializers import DatasetSerializer

class DatasetListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datasets = Dataset.objects.filter(user=request.user)
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic filename extraction
        filename = file_obj.name
        title = request.data.get("title", filename)

        # Temporary save to let pandas parse
        dataset_instance = Dataset(user=request.user, title=title, file=file_obj)
        dataset_instance.save()

        try:
            file_path = dataset_instance.file.path
            # Support CSV and Excel parsing (Syllabus: "Read car_data.csv using Pandas", "read_csv")
            if filename.endswith(".csv"):
                df = pd.read_csv(file_path)
            elif filename.endswith((".xls", ".xlsx")):
                df = pd.read_excel(file_path)
            else:
                # Fallback to CSV parsing
                df = pd.read_csv(file_path)

            dataset_instance.rows = df.shape[0]
            dataset_instance.cols = df.shape[1]
            dataset_instance.size_bytes = file_obj.size
            dataset_instance.save()

            return Response(DatasetSerializer(dataset_instance).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Cleanup if import fails
            dataset_instance.delete()
            return Response({"detail": f"Failed to parse dataset: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DatasetDetailDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, user=request.user)
        return Response(DatasetSerializer(dataset).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, user=request.user)
        if dataset.file and os.path.exists(dataset.file.path):
            os.remove(dataset.file.path)
        dataset.delete()
        return Response({"detail": "Dataset deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class DatasetDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, user=request.user)
        if dataset.file and os.path.exists(dataset.file.path):
            return FileResponse(open(dataset.file.path, "rb"), as_attachment=True, filename=dataset.title)
        return Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)

class DatasetPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, user=request.user)
        file_path = dataset.file.path

        try:
            if file_path.endswith(".csv"):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)

            # Limit preview to 10 rows
            preview_df = df.head(10)
            
            # Clean numeric NaN/Inf for JSON serialization
            preview_df = preview_df.replace({np.nan: None, np.inf: None, -np.inf: None})
            
            rows_data = preview_df.to_dict(orient="records")
            columns = list(df.columns)

            return Response({
                "columns": columns,
                "rows": rows_data,
                "total_rows": df.shape[0],
                "total_cols": df.shape[1],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to preview dataset: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DatasetCleanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, user=request.user)
        file_path = dataset.file.path

        drop_nulls = request.data.get("drop_nulls", False)
        fill_nulls = request.data.get("fill_nulls", False)
        drop_duplicates = request.data.get("drop_duplicates", False)
        remove_outliers = request.data.get("remove_outliers", False)

        try:
            if file_path.endswith(".csv"):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)

            # Clean operations using Pandas (Unit 1.2 & 1.6)
            if drop_duplicates:
                df.drop_duplicates(inplace=True)

            if drop_nulls:
                df.dropna(inplace=True)

            if fill_nulls:
                # Fill numeric columns with median, categorical with mode (Unit 1.2 fillna)
                for col in df.columns:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].fillna(df[col].median() if not df[col].isnull().all() else 0)
                    else:
                        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")

            if remove_outliers:
                # IQR outlier removal for numerical features (Unit 1.6)
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for col in numeric_cols:
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

            # Save cleaned dataset back to file system
            if file_path.endswith(".csv"):
                df.to_csv(file_path, index=False)
            else:
                df.to_excel(file_path, index=False)

            # Update rows & cols count
            dataset.rows = df.shape[0]
            dataset.cols = df.shape[1]
            dataset.save()

            return Response({
                "detail": "Dataset cleaned successfully.",
                "rows": dataset.rows,
                "cols": dataset.cols
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to clean dataset: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
