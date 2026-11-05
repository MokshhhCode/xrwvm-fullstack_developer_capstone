"""URL configuration for the dealership capstone."""
from pathlib import Path

from django.conf import settings
from django.contrib import admin
from django.http import FileResponse
from django.shortcuts import render
from django.urls import include, path, re_path
from django.views.generic import TemplateView


FRONTEND_INDEX = Path(settings.BASE_DIR) / "frontend" / "build" / "index.html"


def frontend(request, path=""):
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX.open("rb"), content_type="text/html")
    return render(request, "Home.html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("about", TemplateView.as_view(template_name="About.html"), name="about"),
    path("contact", TemplateView.as_view(template_name="Contact.html"), name="contact"),
    re_path(r"^(?!(?:admin|djangoapp)(?:/|$)).*$", frontend, name="frontend"),
]
