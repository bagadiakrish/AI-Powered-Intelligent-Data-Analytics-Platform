import os
import uuid

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import seaborn as sns

from django.conf import settings

from .analytics_service import AnalyticsService


class VisualizationService:

    CHART_FOLDER = os.path.join(
        settings.MEDIA_ROOT,
        "charts",
    )

    @classmethod
    def create_chart_folder(cls):
        os.makedirs(
            cls.CHART_FOLDER,
            exist_ok=True,
        )

    @classmethod
    def get_chart_path(cls):

        cls.create_chart_folder()

        filename = f"{uuid.uuid4().hex}.png"

        absolute_path = os.path.join(
            cls.CHART_FOLDER,
            filename,
        )

        url = f"/media/charts/{filename}"

        return absolute_path, url

    @classmethod
    def load_dataframe(cls, dataset):

        return AnalyticsService.load_dataset(dataset)

    @classmethod
    def save_chart(cls):

        path, url = cls.get_chart_path()

        plt.tight_layout()

        plt.savefig(
            path,
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()

        return url

    @classmethod
    def bar_chart(cls, dataset, column):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(10, 6))

        (
            df[column]
            .fillna("Missing")
            .value_counts()
            .head(20)
            .plot(kind="bar")
        )

        plt.title(column)

        return cls.save_chart()

    @classmethod
    def pie_chart(cls, dataset, column):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(8, 8))

        (
            df[column]
            .fillna("Missing")
            .value_counts()
            .head(10)
            .plot(
                kind="pie",
                autopct="%1.1f%%",
            )
        )

        plt.ylabel("")

        return cls.save_chart()

    @classmethod
    def histogram(cls, dataset, column):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(10, 6))

        plt.hist(
            df[column].dropna(),
            bins=20,
        )

        plt.title(column)

        return cls.save_chart()

    @classmethod
    def line_chart(cls, dataset, column):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(12, 6))

        df[column].dropna().plot()

        plt.title(column)

        return cls.save_chart()

    @classmethod
    def scatter_chart(cls, dataset, x, y):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(10, 6))

        plt.scatter(
            df[x],
            df[y],
            alpha=0.7,
        )

        plt.xlabel(x)

        plt.ylabel(y)

        return cls.save_chart()

    @classmethod
    def box_plot(cls, dataset, column):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(6, 8))

        plt.boxplot(
            df[column].dropna(),
        )

        plt.title(column)

        return cls.save_chart()

    @classmethod
    def heatmap(cls, dataset):

        df = cls.load_dataframe(dataset)

        plt.figure(figsize=(10, 8))

        sns.heatmap(
            df.corr(numeric_only=True),
            annot=True,
            cmap="coolwarm",
        )

        return cls.save_chart()