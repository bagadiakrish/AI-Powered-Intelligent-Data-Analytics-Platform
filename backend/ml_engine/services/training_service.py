import os
import uuid
import joblib
import pandas as pd

from django.conf import settings
from django.core.files import File

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from datasets.models import Dataset
from ml_engine.models import TrainedModel


class MLService:

    @staticmethod
    def train_linear_regression(data):

        # Load dataset
        dataset = Dataset.objects.get(id=data["dataset_id"])

        if dataset.file_type == "csv":
            df = pd.read_csv(dataset.uploaded_file.path)
        else:
            df = pd.read_excel(dataset.uploaded_file.path)

        # Features & Target
        X = df[data["feature_columns"]]
        y = df[data["target_column"]]

        # Column types
        numeric_columns = X.select_dtypes(include=["number"]).columns.tolist()
        categorical_columns = X.select_dtypes(exclude=["number"]).columns.tolist()

        # Numeric pipeline
        numeric_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )

        # Categorical pipeline
        categorical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                (
                    "encoder",
                    OneHotEncoder(handle_unknown="ignore"),
                ),
            ]
        )

        # Combine preprocessing
        preprocessor = ColumnTransformer(
            transformers=[
                ("numeric", numeric_pipeline, numeric_columns),
                ("categorical", categorical_pipeline, categorical_columns),
            ]
        )

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=data["test_size"],
            random_state=data["random_state"],
        )

        # Model pipeline
        model = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", LinearRegression()),
            ]
        )

        # Train
        model.fit(X_train, y_train)

        # Predict
        predictions = model.predict(X_test)

        # ==========================
        # Calculate metrics
        # ==========================
        r2 = r2_score(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        mse = mean_squared_error(y_test, predictions)

        # ==========================
        # Save model
        # ==========================
        model_dir = os.path.join(
            settings.MEDIA_ROOT,
            "trained_models",
        )
        os.makedirs(model_dir, exist_ok=True)

        filename = f"{uuid.uuid4()}.pkl"
        filepath = os.path.join(model_dir, filename)

        joblib.dump(model, filepath)

        # ==========================
        # Save database record
        # ==========================
        with open(filepath, "rb") as f:

            trained_model = TrainedModel.objects.create(
                dataset=dataset,
                algorithm="Linear Regression",
                target_column=data["target_column"],
                feature_columns=data["feature_columns"],
                model_file=File(f, name=filename),
                r2_score=r2,
                mae=mae,
                mse=mse,
            )

        # ==========================
        # API Response
        # ==========================
        return {
            "message": "Model trained successfully.",
            "model_id": trained_model.id,
            "algorithm": trained_model.algorithm,
            "r2_score": round(r2, 4),
            "mae": round(mae, 4),
            "mse": round(mse, 4),
        }