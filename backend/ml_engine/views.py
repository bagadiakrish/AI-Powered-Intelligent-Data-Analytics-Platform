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

        # Handle Deep Learning Simulated models (Unit 6 Neural Networks, CNN)
        if algorithm in ["Convolutional Neural Network (CNN)"]:
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
                "error_rate": 1.0 - acc,
                "sensitivity": acc * 1.05,
                "specificity": acc * 0.95,
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

            regression_algs = ["Simple Linear Regression", "Multiple Linear Regression", "Polynomial Regression"]
            classification_algs = ["kNN", "Decision Tree", "Random Forest", "SVM"]

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

import io
from django.http import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class TrainedModelPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        m = get_object_or_404(TrainedModel, pk=pk, user=request.user)
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        
        styles = getSampleStyleSheet()
        
        # Custom styles matching our premium color scheme
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )

        section_title_style = ParagraphStyle(
            'SectionTitleStyle',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#0ea5e9'),
            spaceBefore=12,
            spaceAfter=8
        )

        story = []
        
        story.append(Paragraph("NEXORA ANALYTICS TRAINING REPORT", title_style))
        story.append(Paragraph(f"Generated on: {m.created_at.strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
        
        # General Information Table
        info_data = [
            ["Model ID", f"#{m.id}"],
            ["Algorithm Type", m.algorithm],
            ["Dataset Name", m.dataset_title or "N/A"],
            ["Target Column", m.target_column],
        ]
        
        t = Table(info_data, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1e293b')),
        ]))
        
        story.append(Paragraph("Model Metadata Summary", section_title_style))
        story.append(t)
        story.append(Spacer(1, 15))
        
        # Model performance
        story.append(Paragraph("Model Performance Evaluation", section_title_style))
        
        performance_data = []
        if m.r2_score is not None:
            performance_data = [
                ["Evaluation Metric", "Score Value"],
                ["R-Squared (R²)", f"{m.r2_score:.6f} ({m.r2_score * 100:.2f}%)"],
                ["Mean Absolute Error (MAE)", f"{m.mae:.6f}"],
                ["Mean Squared Error (MSE)", f"{m.mse:.6f}"],
            ]
        else:
            performance_data = [
                ["Evaluation Metric", "Score Value"],
                ["Accuracy", f"{m.accuracy:.6f} ({m.accuracy * 100:.2f}%)"],
                ["Error Rate", f"{m.error_rate:.6f} ({m.error_rate * 100:.2f}%)"],
                ["Sensitivity (Recall)", f"{m.sensitivity:.6f} ({m.sensitivity * 100:.2f}%)"],
                ["Specificity", f"{m.specificity:.6f} ({m.specificity * 100:.2f}%)"],
            ]
            
        pt = Table(performance_data, colWidths=[200, 250])
        pt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#1e293b')),
        ]))
        story.append(pt)
        
        # Confusion matrix visual
        if m.confusion_matrix:
            story.append(Spacer(1, 15))
            story.append(Paragraph("Confusion Matrix Details", section_title_style))
            
            matrix_data = [
                ["Labels list", str(m.confusion_matrix.get("labels", []))],
                ["Values grid", str(m.confusion_matrix.get("matrix", [[]]))],
            ]
            mt = Table(matrix_data, colWidths=[150, 300])
            mt.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1e293b')),
            ]))
            story.append(mt)
            
        doc.build(story)
        buffer.seek(0)
        
        return FileResponse(buffer, as_attachment=True, filename=f"model_report_#{m.id}.pdf", content_type="application/pdf")
