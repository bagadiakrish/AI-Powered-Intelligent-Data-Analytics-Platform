import pandas as pd
import numpy as np

class AnalyticsService:
    @staticmethod
    def get_overview(df):
        """
        Returns info & summary stats (Syllabus: info(), shape(), describe(), data types)
        """
        shape = df.shape
        columns = list(df.columns)
        
        # Datatypes conversion
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        null_counts = {col: int(count) for col, count in df.isnull().sum().items()}

        # Describe stats for numeric columns
        desc_df = df.describe(include=[np.number]) if not df.select_dtypes(include=[np.number]).columns.empty else pd.DataFrame()
        desc_df = desc_df.replace({np.nan: None, np.inf: None, -np.inf: None})
        describe_stats = desc_df.to_dict()

        return {
            "shape": shape,
            "columns": columns,
            "dtypes": dtypes,
            "null_counts": null_counts,
            "describe": describe_stats,
        }

    @staticmethod
    def get_correlation(df):
        """
        Calculates correlation matrix for numeric columns (Syllabus: corr())
        """
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return {}
        
        corr_matrix = numeric_df.corr()
        corr_matrix = corr_matrix.replace({np.nan: None, np.inf: None, -np.inf: None})
        return corr_matrix.to_dict()

    @staticmethod
    def get_crosstab(df, col1, col2):
        """
        Performs two-way cross tabulation (Syllabus: Unit 1.5, pd.crosstab())
        """
        if col1 not in df.columns or col2 not in df.columns:
            return {}
        
        ct = pd.crosstab(df[col1], df[col2])
        return {
            "index": list(ct.index),
            "columns": list(ct.columns),
            "data": ct.values.tolist()
        }
