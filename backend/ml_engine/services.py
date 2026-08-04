import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from datasets.models import Dataset


class MLService:

    @staticmethod
    def load_dataframe(dataset):

        if dataset.file_type == "csv":
            return pd.read_csv(dataset.uploaded_file.path)

        return pd.read_excel(dataset.uploaded_file.path)

    @staticmethod
    def linear_regression(dataset, feature_columns, target_column):

        df = MLService.load_dataframe(dataset)

        df = df.dropna()

        X = df[feature_columns]

        y = df[target_column]

        X = pd.get_dummies(
            X,
            drop_first=True,
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
        )

        model = LinearRegression()

        model.fit(
            X_train,
            y_train,
        )

        predictions = model.predict(X_test)

        return {

            "algorithm": "Linear Regression",

            "training_rows": len(X_train),

            "testing_rows": len(X_test),

            "r2_score": round(
                float(r2_score(y_test, predictions)),
                4,
            ),

            "mae": round(
                float(mean_absolute_error(y_test, predictions)),
                4,
            ),

            "mse": round(
                float(mean_squared_error(y_test, predictions)),
                4,
            ),
        }