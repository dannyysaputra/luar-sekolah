from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Booking

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class RoomMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class BookingReadSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    room = RoomMinimalSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "room",
            "start_time",
            "end_time",
            "status",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class BookingWriteSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    room_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()

    def validate_user_id(self, value: int) -> int:
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("User not found.")
        return value

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        if start and end and end <= start:
            raise serializers.ValidationError({"end_time": ["End time must be greater than start time."]})
        return attrs
