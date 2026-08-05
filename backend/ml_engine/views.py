import pandas as pd
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datasets.models import Dataset
from .models import TrainedModel
from .services import MLTrainingService

class TrainModelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        dataset_id = request.data.get("dataset_id")
        target_col = request.data.get("target_col")
        algorithm = request.data.get("algorithm")
        params = request.data.get("params", {})

        if not dataset_id or not target_col or not algorithm:
            return Response({"detail": "Parameters dataset_id, target_col, and algorithm are required."}, status=status.HTTP_400_BAD_REQUEST)

        dataset = get_object_or_404(Dataset, id=dataset_id, user=request.user)

        # Handle Deep Learning Simulated models (Unit 6 Neural Networks, CNN, Transfer Learning)
        if algorithm in ["Convolutional Neural Network (CNN)", "Transfer Learning"]:
            # Generate simulated epoch logs for training feedback
            epochs = int(params.get("epochs", 5))
            learning_rate = float(params.get("learning_rate", 0.001))
            dropout = float(params.get("dropout", 0.25))

            logs = []
            loss = 0.8
            val_loss = 0.85
            acc = 0.5
            val_acc = 0.48

            for epoch in range(1, epochs + 1):
                loss -= 0.1 * (1 - epoch / (epochs + 2))
                val_loss -= 0.08 * (1 - epoch / (epochs + 2))
                acc += 0.09 * (1 - epoch / (epochs + 2))
                val_acc += 0.08 * (1 - epoch / (epochs + 2))

                logs.append(
                    f"Epoch {epoch}/{epochs} - loss: {loss:.4f} - accuracy: {acc:.4f} - val_loss: {val_loss:.4f} - val_accuracy: {val_acc:.4f}"
                )

            # Define simulated layers based on type (Unit 6.2 Convolution, pooling, dropout)
            if algorithm == "Convolutional Neural Network (CNN)":
                layers = [
                    "Input Layer (Image Shape: 128x128x3)",
                    f"Conv2D (32 filters, 3x3 kernel, Activation: ReLU)",
                    "MaxPooling2D (2x2 pool size)",
                    f"Conv2D (64 filters, 3x3 kernel, Activation: ReLU)",
                    "MaxPooling2D (2x2 pool size)",
                    f"Dropout ({dropout})",
                    "Flatten",
                    "Dense (128 units, Activation: ReLU)",
                    "Dense (Output, Activation: Softmax)"
                ]
            else:
                layers = [
                    "Input Layer (Image Shape: 224x224x3)",
                    "Pre-trained MobileNetV2 Base (Weights: ImageNet, Freezed)",
                    "GlobalAveragePooling2D",
                    f"Dense (256 units, Activation: ReLU)",
                    f"Dropout ({dropout})",
                    "Dense (Output, Activation: Softmax)"
                ]

            trained_model = TrainedModel.objects.create(
                user=request.user,
                dataset=dataset,
                dataset_title=dataset.title,
                algorithm=algorithm,
                target_column=target_col,
                parameters={**params, "layers": layers},
                accuracy=acc,
                error_rate=1.0 - acc,
                sensitivity=acc * 1.05,
                specificity=acc * 0.95,
                confusion_matrix={
                    "labels": ["Class A", "Class B"],
                    "matrix": [[15, 2], [3, 18]]
                }
            )

            return Response({
                "model_id": trained_model.id,
                "algorithm": algorithm,
                "accuracy": acc,
                "confusion_matrix": trained_model.confusion_matrix,
                "logs": logs,
                "layers": layers
            }, status=status.HTTP_200_OK)

        # Standard Machine Learning models
        try:
            if dataset.file.path.endswith(".csv"):
                df = pd.read_csv(dataset.file.path)
            else:
                df = pd.read_excel(dataset.file.path)

            regression_algs = ["Linear Regression", "Polynomial Regression", "Neural Network (Regression)"]
            classification_algs = ["kNN", "Decision Tree", "Random Forest", "SVM", "Neural Network (Classification)"]

            if algorithm in regression_algs:
                results = MLTrainingService.train_regression(df, target_col, algorithm, params)
                trained_model = TrainedModel.objects.create(
                    user=request.user,
                    dataset=dataset,
                    dataset_title=dataset.title,
                    algorithm=algorithm,
                    target_column=target_col,
                    parameters=params,
                    r2_score=results["r2_score"],
                    mae=results["mae"],
                    mse=results["mse"]
                )
                return Response({
                    "model_id": trained_model.id,
                    "algorithm": algorithm,
                    "r2_score": results["r2_score"],
                    "mae": results["mae"],
                    "mse": results["mse"],
                    "predictions": results["predictions"],
                    "actuals": results["actuals"]
                }, status=status.HTTP_200_OK)

            elif algorithm in classification_algs:
                results = MLTrainingService.train_classification(df, target_col, algorithm, params)
                trained_model = TrainedModel.objects.create(
                    user=request.user,
                    dataset=dataset,
                    dataset_title=dataset.title,
                    algorithm=algorithm,
                    target_column=target_col,
                    parameters=params,
                    accuracy=results["accuracy"],
                    error_rate=results["error_rate"],
                    sensitivity=results["sensitivity"],
                    specificity=results["specificity"],
                    confusion_matrix=results["confusion_matrix"]
                )
                return Response({
                    "model_id": trained_model.id,
                    "algorithm": algorithm,
                    "accuracy": results["accuracy"],
                    "error_rate": results["error_rate"],
                    "sensitivity": results["sensitivity"],
                    "specificity": results["specificity"],
                    "confusion_matrix": results["confusion_matrix"]
                }, status=status.HTTP_200_OK)

            else:
                return Response({"detail": f"Unsupported algorithm: {algorithm}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"detail": f"Training failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class TrainedModelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        models = TrainedModel.objects.filter(user=request.user).order_by("-created_at")
        results = []
        for m in models:
            results.append({
                "id": m.id,
                "dataset": m.dataset.id,
                "dataset_title": m.dataset_title,
                "algorithm": m.algorithm,
                "target_column": m.target_column,
                "parameters": m.parameters,
                "r2_score": m.r2_score,
                "mae": m.mae,
                "mse": m.mse,
                "accuracy": m.accuracy,
                "error_rate": m.error_rate,
                "sensitivity": m.sensitivity,
                "specificity": m.specificity,
                "confusion_matrix": m.confusion_matrix,
                "created_at": m.created_at.isoformat()
            })
        return Response(results, status=status.HTTP_200_OK)

class TrainedModelDetailDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        m = get_object_or_404(TrainedModel, pk=pk, user=request.user)
        return Response({
            "id": m.id,
            "dataset": m.dataset.id,
            "dataset_title": m.dataset_title,
            "algorithm": m.algorithm,
            "target_column": m.target_column,
            "parameters": m.parameters,
            "r2_score": m.r2_score,
            "mae": m.mae,
            "mse": m.mse,
            "accuracy": m.accuracy,
            "error_rate": m.error_rate,
            "sensitivity": m.sensitivity,
            "specificity": m.specificity,
            "confusion_matrix": m.confusion_matrix,
            "created_at": m.created_at.isoformat()
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        m = get_object_or_404(TrainedModel, pk=pk, user=request.user)
        m.delete()
        return Response({"detail": "Model record deleted."}, status=status.HTTP_204_NO_CONTENT)
