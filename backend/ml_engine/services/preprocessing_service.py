import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler,
)


class PreprocessingService:

    @staticmethod
    def build_preprocessor(df, feature_columns):

        X = df[feature_columns]

        numeric_features = X.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_features = X.select_dtypes(
            exclude=["number"]
        ).columns.tolist()

        numeric_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(strategy="median"),
                ),
                (
                    "scaler",
                    StandardScaler(),
                ),
            ]
        )

        categorical_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(
                        strategy="most_frequent",
                    ),
                ),
                (
                    "encoder",
                    OneHotEncoder(
                        handle_unknown="ignore",
                    ),
                ),
            ]
        )

        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    numeric_pipeline,
                    numeric_features,
                ),
                (
                    "cat",
                    categorical_pipeline,
                    categorical_features,
                ),
            ]
        )

        return preprocessor