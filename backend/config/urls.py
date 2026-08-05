from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "status": "online",
        "message": "Nexora Analytics Platform API Server is Running!",
        "version": "1.1.0"
    })

urlpatterns = [
    path("", home_view, name="home"),
    path("admin/", admin.site.urls),

    path(
        "api/auth/",
        include("accounts.urls"),
    ),

    path(
        "api/datasets/",
        include("datasets.urls"),
    ),

    path(
        "api/analytics/",
        include("analytics.urls"),
    ),
    path(
        "api/ml/",
        include("ml_engine.urls"),
    ),
]

if settings.DEBUG:
        urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )