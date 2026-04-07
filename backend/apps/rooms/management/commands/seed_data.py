from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.rooms.models import Room

User = get_user_model()

ROOMS = [
    {"name": "Ocean Room", "capacity": 12, "location": "Floor 3", "description": "Main discussion room with sea view."},
    {"name": "Focus Pod A", "capacity": 4, "location": "Floor 1", "description": "Quiet room for deep work."},
    {"name": "Focus Pod B", "capacity": 4, "location": "Floor 1", "description": "Quiet room for deep work."},
    {"name": "Summit Hall", "capacity": 30, "location": "Floor 5", "description": "Large conference hall."},
    {"name": "Horizon Room", "capacity": 8, "location": "Floor 2", "description": "Mid-size meeting room."},
]

USERS = [
    {"username": "alice", "email": "alice@example.com", "password": "password123"},
    {"username": "bob", "email": "bob@example.com", "password": "password123"},
    {"username": "charlie", "email": "charlie@example.com", "password": "password123"},
]


class Command(BaseCommand):
    help = "Seed initial rooms and users for development"

    def handle(self, *args, **kwargs):
        for room_data in ROOMS:
            room, created = Room.objects.get_or_create(name=room_data["name"], defaults=room_data)
            status = "created" if created else "skipped"
            self.stdout.write(f"Room '{room.name}': {status}")

        for user_data in USERS:
            if not User.objects.filter(username=user_data["username"]).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(f"User '{user_data['username']}': created")
            else:
                self.stdout.write(f"User '{user_data['username']}': skipped")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
