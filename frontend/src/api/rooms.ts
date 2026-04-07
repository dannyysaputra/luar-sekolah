import { apiClient } from "./client";
import type { ApiSuccess, Room, CreateRoomPayload, AvailabilityResult, PaginatedData } from "../types";

export const roomsApi = {
    list: (page?: number, pageSize?: number) => {
        if (page !== undefined) {
            const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize ?? 6) });
            return apiClient.get<ApiSuccess<PaginatedData<Room>>>(`/rooms/?${qs}`);
        }
        return apiClient.get<ApiSuccess<Room[]>>("/rooms/");
    },

    create: (payload: CreateRoomPayload) =>
        apiClient.post<ApiSuccess<Room>>("/rooms/", payload),

    checkAvailability: (
        roomId: number,
        startTime: string,
        endTime: string
    ) =>
        apiClient.get<ApiSuccess<AvailabilityResult>>(
            `/rooms/${roomId}/availability/?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`
        ),
};
