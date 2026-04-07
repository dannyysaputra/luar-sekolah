export interface DemoUser {
    id: number;
    username: string;
}

export interface Room {
    id: number;
    name: string;
    capacity: number;
    location: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface BookingUser {
    id: number;
    username: string;
}

export interface BookingRoom {
    id: number;
    name: string;
}

export type BookingStatus = "active" | "cancelled";

export interface Booking {
    id: number;
    user: BookingUser;
    room: BookingRoom;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiSuccess<T> {
    message: string;
    data: T;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface Pagination {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface PaginatedData<T> {
    items: T[];
    pagination: Pagination;
}

export interface CreateBookingPayload {
    user_id: number;
    room_id: number;
    start_time: string;
    end_time: string;
}

export interface CreateRoomPayload {
    name: string;
    capacity: number;
    location?: string;
    description?: string;
}

export interface AvailabilityResult {
    room_id: number;
    is_available: boolean;
    requested_start_time: string;
    requested_end_time: string;
    conflicts: Array<{
        booking_id: number;
        start_time: string;
        end_time: string;
    }>;
}
