from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/rooms/", include("apps.rooms.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/users/", include("apps.users.urls")),
]
