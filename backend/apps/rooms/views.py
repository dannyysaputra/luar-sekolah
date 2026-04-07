from rest_framework.views import APIView
from rest_framework.request import Request

from apps.common.responses import success_response, error_response
from apps.common.pagination import paginate, DEFAULT_PAGE_SIZE
from .models import Room
from .selectors import get_all_rooms
from .serializers import RoomSerializer


class RoomListCreateView(APIView):
    def get(self, request: Request):
        rooms = get_all_rooms()

        page_param = request.query_params.get("page")
        if page_param is not None:
            try:
                page = int(page_param)
                page_size = int(request.query_params.get("page_size", DEFAULT_PAGE_SIZE))
            except ValueError:
                return error_response("Validation failed", {"page": ["Must be an integer."]}, status=400)

            items, meta = paginate(rooms, page, page_size)
            serializer = RoomSerializer(items, many=True)
            return success_response("Rooms fetched successfully", {"items": serializer.data, "pagination": meta})

        serializer = RoomSerializer(rooms, many=True)
        return success_response("Rooms fetched successfully", serializer.data)

    def post(self, request: Request):
        serializer = RoomSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Validation failed", serializer.errors, status=400)
        room = serializer.save()
        return success_response(
            "Room created successfully",
            RoomSerializer(room).data,
            status=201,
        )


class RoomAvailabilityView(APIView):
    def get(self, request: Request, pk: int):
        from django.utils import timezone
        from datetime import datetime
        from apps.bookings.models import Booking, BookingStatus

        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return error_response("Room not found", status=404)

        start_str = request.query_params.get("start_time")
        end_str = request.query_params.get("end_time")

        if not start_str or not end_str:
            return error_response(
                "Validation failed",
                {"start_time": ["start_time is required."], "end_time": ["end_time is required."]},
                status=400,
            )

        try:
            start_time = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
            end_time = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
        except ValueError:
            return error_response("Validation failed", {"time_range": ["Invalid datetime format."]}, status=400)

        conflicts = Booking.objects.filter(
            room=room,
            status=BookingStatus.ACTIVE,
            start_time__lt=end_time,
            end_time__gt=start_time,
        )

        conflict_data = [
            {
                "booking_id": b.id,
                "start_time": b.start_time.isoformat(),
                "end_time": b.end_time.isoformat(),
            }
            for b in conflicts
        ]

        return success_response(
            "Availability checked successfully",
            {
                "room_id": room.id,
                "is_available": not conflicts.exists(),
                "requested_start_time": start_str,
                "requested_end_time": end_str,
                "conflicts": conflict_data,
            },
        )
