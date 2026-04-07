from django.db.models import QuerySet
from .models import Booking, BookingStatus


def get_bookings(user_id=None, date=None, status=None) -> QuerySet:
    qs = Booking.objects.select_related("user", "room").all()

    if user_id is not None:
        qs = qs.filter(user_id=user_id)

    if date is not None:
        qs = qs.filter(start_time__date=date)

    if status is not None:
        qs = qs.filter(status=status)

    return qs
