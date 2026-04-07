from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.request import Request

from apps.common.responses import success_response, error_response
from apps.common.pagination import paginate, DEFAULT_PAGE_SIZE
from apps.common.exceptions import (
    BookingConflictError,
    BookingAlreadyCancelledError,
    BookingNotFoundError,
    RoomNotFoundError,
)
from .serializers import BookingWriteSerializer, BookingReadSerializer
from .selectors import get_bookings
from .services import create_booking, cancel_booking

User = get_user_model()


class BookingListCreateView(APIView):
    def get(self, request: Request):
        user_id = request.query_params.get("user")
        date = request.query_params.get("date")
        status = request.query_params.get("status")

        bookings = get_bookings(user_id=user_id, date=date, status=status)

        page_param = request.query_params.get("page")
        if page_param is not None:
            try:
                page = int(page_param)
                page_size = int(request.query_params.get("page_size", DEFAULT_PAGE_SIZE))
            except ValueError:
                return error_response("Validation failed", {"page": ["Must be an integer."]}, status=400)

            items, meta = paginate(bookings, page, page_size)
            serializer = BookingReadSerializer(items, many=True)
            return success_response("Bookings fetched successfully", {"items": serializer.data, "pagination": meta})

        serializer = BookingReadSerializer(bookings, many=True)
        return success_response("Bookings fetched successfully", serializer.data)

    def post(self, request: Request):
        serializer = BookingWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Validation failed", serializer.errors, status=400)

        data = serializer.validated_data

        try:
            user = User.objects.get(pk=data["user_id"])
        except User.DoesNotExist:
            return error_response("Validation failed", {"user_id": ["User not found."]}, status=400)

        try:
            booking = create_booking(
                user=user,
                room_id=data["room_id"],
                start_time=data["start_time"],
                end_time=data["end_time"],
            )
        except RoomNotFoundError:
            return error_response("Room not found", status=404)
        except ValueError as exc:
            field, msg = str(exc).split(":", 1)
            return error_response("Validation failed", {field: [msg]}, status=400)
        except BookingConflictError as exc:
            return error_response(
                "Booking conflict",
                {"time_range": [str(exc)]},
                status=409,
            )

        return success_response(
            "Booking created successfully",
            BookingReadSerializer(booking).data,
            status=201,
        )


class BookingCancelView(APIView):
    def delete(self, request: Request, pk: int):
        try:
            booking = cancel_booking(booking_id=pk)
        except BookingNotFoundError:
            return error_response("Booking not found", status=404)
        except BookingAlreadyCancelledError as exc:
            return error_response(
                "Validation failed",
                {"booking": [str(exc)]},
                status=400,
            )

        return success_response(
            "Booking cancelled successfully",
            {
                "id": booking.id,
                "status": booking.status,
                "cancelled_at": booking.cancelled_at.isoformat() if booking.cancelled_at else None,
            },
        )
