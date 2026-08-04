import pandas as pd


class AnalyticsService:

    @staticmethod
    def load_dataset(dataset):
        file_path = dataset.uploaded_file.path

        if dataset.file_type == "csv":
            df = pd.read_csv(file_path)

        elif dataset.file_type == "xlsx":
            df = pd.read_excel(file_path)

        else:
            raise ValueError("Unsupported file type.")

        return df

    @staticmethod
    def get_overview(dataset):
        df = AnalyticsService.load_dataset(dataset)

        return {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "column_names": list(df.columns),
            "data_types": {
                column: str(dtype)
                for column, dtype in df.dtypes.items()
            },
            "missing_values": (
                df.isnull()
                .sum()
                .astype(int)
                .to_dict()
            ),
            "duplicate_rows": int(df.duplicated().sum()),
        }

    @staticmethod
    def get_summary(dataset):
        df = AnalyticsService.load_dataset(dataset)

        numeric_df = df.select_dtypes(include="number")

        if numeric_df.empty:
            return {}

        return numeric_df.describe().to_dict()

    @staticmethod
    def get_preview(dataset, rows=10):
        df = AnalyticsService.load_dataset(dataset)

        return {
            "columns": list(df.columns),
            "rows": df.head(rows).fillna("").to_dict(orient="records"),
        }

    @staticmethod
    def get_column_statistics(dataset):
        df = AnalyticsService.load_dataset(dataset)

        statistics = {}

        for column in df.columns:
            statistics[column] = {
                "dtype": str(df[column].dtype),
                "total_values": int(df[column].count()),
                "missing_values": int(df[column].isnull().sum()),
                "unique_values": int(df[column].nunique()),
            }

        return statistics

    @staticmethod
    def get_value_counts(dataset, column):
        df = AnalyticsService.load_dataset(dataset)

        if column not in df.columns:
            raise ValueError("Column does not exist.")

        return (
            df[column]
            .fillna("Missing")
            .value_counts()
            .to_dict()
        )

    @staticmethod
    def get_missing_values(dataset):
        df = AnalyticsService.load_dataset(dataset)

        return (
            df.isnull()
            .sum()
            .astype(int)
            .to_dict()
        )

    @staticmethod
    def get_duplicate_report(dataset):
        df = AnalyticsService.load_dataset(dataset)

        return {
            "duplicate_rows": int(df.duplicated().sum())
        }

    @staticmethod
    def get_correlation(dataset):
        df = AnalyticsService.load_dataset(dataset)

        numeric_df = df.select_dtypes(include="number")

        if numeric_df.empty:
            return {}

        return numeric_df.corr().fillna(0).to_dict()