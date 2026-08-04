import os

import pandas as pd


class DatasetService:

    @staticmethod
    def get_file_type(file):
        extension = os.path.splitext(file.name)[1].lower()

        if extension == ".csv":
            return "csv"

        if extension in [".xlsx", ".xls"]:
            return "xlsx"

        raise ValueError("Only CSV and Excel files are allowed.")

    @staticmethod
    def read_dataset(file, file_type):
        file.seek(0)

        if file_type == "csv":
            dataframe = pd.read_csv(file)

        elif file_type == "xlsx":
            dataframe = pd.read_excel(file)

        else:
            raise ValueError("Unsupported file type.")

        return dataframe

    @staticmethod
    def extract_metadata(dataframe):
        return {
            "rows": len(dataframe),
            "columns": len(dataframe.columns),
            "column_names": list(dataframe.columns),
        }