from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, UserProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("profile/", UserProfileView.as_view(), name="auth-profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
]
