from django.utils import timezone
from django.db import transaction

from apps.rooms.models import Room
from apps.common.exceptions import (
    BookingConflictError,
    BookingAlreadyCancelledError,
    BookingNotFoundError,
    RoomNotFoundError,
)
from .models import Booking, BookingStatus


def create_booking(*, user, room_id: int, start_time, end_time) -> Booking:
    try:
        room = Room.objects.get(pk=room_id)
    except Room.DoesNotExist:
        raise RoomNotFoundError(f"Room {room_id} not found.")

    now = timezone.now()
    if start_time < now:
        raise ValueError("start_time:Bookings cannot be made in the past.")

    if end_time <= start_time:
        raise ValueError("end_time:End time must be greater than start time.")

    with transaction.atomic():
        room = Room.objects.select_for_update().get(pk=room_id)

        conflict_exists = Booking.objects.filter(
            room=room,
            status=BookingStatus.ACTIVE,
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if conflict_exists:
            raise BookingConflictError("This room is already booked for the selected time range.")

        booking = Booking.objects.create(
            user=user,
            room=room,
            start_time=start_time,
            end_time=end_time,
            status=BookingStatus.ACTIVE,
        )

    return booking


def cancel_booking(*, booking_id: int, actor=None) -> Booking:
    try:
        booking = Booking.objects.select_related("user", "room").get(pk=booking_id)
    except Booking.DoesNotExist:
        raise BookingNotFoundError(f"Booking {booking_id} not found.")

    if booking.status == BookingStatus.CANCELLED:
        raise BookingAlreadyCancelledError("Booking has already been cancelled.")

    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.save(update_fields=["status", "cancelled_at", "updated_at"])

    return booking
