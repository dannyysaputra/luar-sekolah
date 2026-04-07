import { apiClient } from "./client";
import type { ApiSuccess, Booking, CreateBookingPayload, PaginatedData } from "../types";

export const bookingsApi = {
    list: (params?: { user?: number; date?: string; status?: string; page?: number; page_size?: number }) => {
        const qs = new URLSearchParams();
        if (params?.user !== undefined) qs.set("user", String(params.user));
        if (params?.date) qs.set("date", params.date);
        if (params?.status) qs.set("status", params.status);
        if (params?.page !== undefined) qs.set("page", String(params.page));
        if (params?.page_size !== undefined) qs.set("page_size", String(params.page_size));
        const query = qs.toString() ? `?${qs.toString()}` : "";
        if (params?.page !== undefined) {
            return apiClient.get<ApiSuccess<PaginatedData<Booking>>>(`/bookings/${query}`);
        }
        return apiClient.get<ApiSuccess<Booking[]>>(`/bookings/${query}`);
    },

    create: (payload: CreateBookingPayload) =>
        apiClient.post<ApiSuccess<Booking>>("/bookings/", payload),

    cancel: (id: number) =>
        apiClient.delete<ApiSuccess<{ id: number; status: string; cancelled_at: string | null }>>(
            `/bookings/${id}/`
        ),
};
