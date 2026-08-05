import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, confusion_matrix

class MLTrainingService:
    @staticmethod
    def preprocess_data(df, target_col):
        # Drop rows where target is missing
        df = df.dropna(subset=[target_col])
        
        y = df[target_col]
        X = df.drop(columns=[target_col])

        # Preprocess features (One-hot encode categorical features, fill nulls)
        X = pd.get_dummies(X, drop_first=True)
        for col in X.columns:
            if X[col].isnull().any():
                X[col] = X[col].fillna(X[col].median() if not X[col].isnull().all() else 0)

        # Ensure all X is numeric
        X = X.astype(float)

        return X, y

    @staticmethod
    def train_regression(df, target_col, algorithm, params):
        X, y = MLTrainingService.preprocess_data(df, target_col)
        
        # Convert target to numeric if possible
        y = pd.to_numeric(y, errors="coerce")
        # Clean targets
        mask = ~y.isnull()
        X = X[mask]
        y = y[mask]

        if len(y) < 5:
            raise ValueError("Insufficient data rows after cleaning target variable.")

        test_size = float(params.get("test_size", 0.2))
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

        if algorithm == "Linear Regression":
            model = LinearRegression()
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        elif algorithm == "Polynomial Regression":
            degree = int(params.get("degree", 2))
            poly = PolynomialFeatures(degree=degree)
            X_train_poly = poly.fit_transform(X_train)
            X_test_poly = poly.transform(X_test)
            
            model = LinearRegression()
            model.fit(X_train_poly, y_train)
            y_pred = model.predict(X_test_poly)
        elif algorithm == "Neural Network (Regression)":
            hidden_layers = tuple(int(x) for x in params.get("hidden_layers", "64,32").split(","))
            model = MLPRegressor(hidden_layer_sizes=hidden_layers, activation="relu", max_iter=200, random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        else:
            raise ValueError(f"Unknown regression algorithm: {algorithm}")

        # Metrics (Unit 4.3)
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)

        # Limit infs/nans
        r2 = max(-1.0, min(1.0, r2)) if not np.isnan(r2) else 0.0
        mae = float(mae) if not np.isnan(mae) else 0.0
        mse = float(mse) if not np.isnan(mse) else 0.0

        return {
            "r2_score": r2,
            "mae": mae,
            "mse": mse,
            "predictions": list(y_pred[:20]),
            "actuals": list(y_test[:20])
        }

    @staticmethod
    def train_classification(df, target_col, algorithm, params):
        X, y = MLTrainingService.preprocess_data(df, target_col)
        
        # Convert target to string categories/integers
        y = y.astype(str)

        if len(y) < 5:
            raise ValueError("Insufficient data rows after cleaning target variable.")

        test_size = float(params.get("test_size", 0.2))
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

        if algorithm == "kNN":
            k = int(params.get("k", 5))
            model = KNeighborsClassifier(n_neighbors=k)
        elif algorithm == "Decision Tree":
            # Using entropy (Syllabus Unit 5.1 & 5.2)
            model = DecisionTreeClassifier(criterion="entropy", max_depth=params.get("max_depth", None), random_state=42)
        elif algorithm == "Random Forest":
            estimators = int(params.get("n_estimators", 100))
            model = RandomForestClassifier(n_estimators=estimators, random_state=42)
        elif algorithm == "SVM":
            kernel = params.get("kernel", "rbf")
            model = SVC(kernel=kernel, probability=True, random_state=42)
        elif algorithm == "Neural Network (Classification)":
            hidden_layers = tuple(int(x) for x in params.get("hidden_layers", "64,32").split(","))
            model = MLPClassifier(hidden_layer_sizes=hidden_layers, activation="relu", max_iter=200, random_state=42)
        else:
            raise ValueError(f"Unknown classification algorithm: {algorithm}")

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        # Confusion Matrix metrics (Syllabus Unit 5.3)
        labels = sorted(list(set(y_test).union(set(y_pred))))
        cm = confusion_matrix(y_test, y_pred, labels=labels)
        
        # Calculate global classification metrics
        total = int(np.sum(cm))
        correct = int(np.trace(cm))
        accuracy = correct / total if total > 0 else 0
        error_rate = 1 - accuracy

        # Extract sensitivity/specificity for binary classification
        if len(labels) == 2:
            tn, fp, fn, tp = cm.ravel()
            sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
            specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        else:
            # Multi-class defaults
            sensitivity = accuracy
            specificity = accuracy

        return {
            "accuracy": float(accuracy),
            "error_rate": float(error_rate),
            "sensitivity": float(sensitivity),
            "specificity": float(specificity),
            "confusion_matrix": {
                "labels": labels,
                "matrix": cm.tolist()
            }
        }
