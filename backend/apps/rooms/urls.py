from django.urls import path
from .views import RoomListCreateView, RoomAvailabilityView

urlpatterns = [
    path("", RoomListCreateView.as_view(), name="room-list-create"),
    path("<int:pk>/availability/", RoomAvailabilityView.as_view(), name="room-availability"),
]
