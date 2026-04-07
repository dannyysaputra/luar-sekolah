from django.db.models import QuerySet
from .models import Room


def get_all_rooms() -> QuerySet:
    return Room.objects.all()
