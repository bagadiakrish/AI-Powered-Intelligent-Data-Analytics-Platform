import joblib
import pandas as pd

from ml_engine.models import TrainedModel


class PredictionService:

    @staticmethod
    def predict(model_id, input_data):

        trained_model = TrainedModel.objects.get(
            id=model_id
        )

        model = joblib.load(
            trained_model.model_file.path
        )

        feature_columns = trained_model.feature_columns

        input_df = pd.DataFrame(
            [input_data],
            columns=feature_columns,
        )

        prediction = model.predict(
            input_df
        )[0]

        return {
            "model_id": trained_model.id,
            "algorithm": trained_model.algorithm,
            "prediction": round(float(prediction), 4),
        }