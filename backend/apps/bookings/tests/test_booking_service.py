from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.rooms.models import Room
from apps.bookings.models import Booking, BookingStatus
from apps.bookings.services import create_booking, cancel_booking
from apps.common.exceptions import (
    BookingConflictError,
    BookingAlreadyCancelledError,
    BookingNotFoundError,
    RoomNotFoundError,
)

User = get_user_model()


def make_room(name="Test Room", capacity=10):
    return Room.objects.create(name=name, capacity=capacity, location="Floor 1")


def make_user(username="testuser"):
    return User.objects.create_user(username=username, password="pass")


def future(hours=1):
    return timezone.now() + timedelta(hours=hours)


class CreateBookingTest(TestCase):
    def setUp(self):
        self.room = make_room()
        self.user = make_user()

    def test_creates_active_booking(self):
        booking = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(2),
        )
        self.assertEqual(booking.status, BookingStatus.ACTIVE)
        self.assertEqual(booking.room, self.room)

    def test_raises_conflict_on_exact_overlap(self):
        create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(3),
        )
        with self.assertRaises(BookingConflictError):
            create_booking(
                user=self.user,
                room_id=self.room.id,
                start_time=future(2),
                end_time=future(4),
            )

    def test_no_conflict_when_boundary_touches(self):
        create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(2),
        )
        # booking starting exactly when previous ends — no conflict
        booking = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(2),
            end_time=future(3),
        )
        self.assertEqual(booking.status, BookingStatus.ACTIVE)

    def test_raises_for_past_start_time(self):
        past = timezone.now() - timedelta(hours=1)
        with self.assertRaises(ValueError) as ctx:
            create_booking(
                user=self.user,
                room_id=self.room.id,
                start_time=past,
                end_time=future(1),
            )
        self.assertIn("past", str(ctx.exception))

    def test_raises_for_end_before_start(self):
        with self.assertRaises(ValueError) as ctx:
            create_booking(
                user=self.user,
                room_id=self.room.id,
                start_time=future(2),
                end_time=future(1),
            )
        self.assertIn("End time", str(ctx.exception))

    def test_raises_for_invalid_room(self):
        with self.assertRaises(RoomNotFoundError):
            create_booking(
                user=self.user,
                room_id=99999,
                start_time=future(1),
                end_time=future(2),
            )

    def test_cancelled_booking_not_counted_as_conflict(self):
        b = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(3),
        )
        cancel_booking(booking_id=b.id)

        # same slot should now succeed
        booking = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(3),
        )
        self.assertEqual(booking.status, BookingStatus.ACTIVE)


class CancelBookingTest(TestCase):
    def setUp(self):
        self.room = make_room()
        self.user = make_user()

    def test_cancel_active_booking(self):
        booking = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(2),
        )
        cancelled = cancel_booking(booking_id=booking.id)
        self.assertEqual(cancelled.status, BookingStatus.CANCELLED)
        self.assertIsNotNone(cancelled.cancelled_at)

    def test_raises_when_already_cancelled(self):
        booking = create_booking(
            user=self.user,
            room_id=self.room.id,
            start_time=future(1),
            end_time=future(2),
        )
        cancel_booking(booking_id=booking.id)
        with self.assertRaises(BookingAlreadyCancelledError):
            cancel_booking(booking_id=booking.id)

    def test_raises_when_booking_not_found(self):
        with self.assertRaises(BookingNotFoundError):
            cancel_booking(booking_id=99999)
