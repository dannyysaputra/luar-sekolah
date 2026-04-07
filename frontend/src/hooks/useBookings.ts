import { useState, useEffect, useCallback } from "react";
import { bookingsApi } from "../api/bookings";
import type { Booking, Pagination } from "../types";

const PAGE_SIZE = 5;

interface Options {
    userId?: number;
    date?: string;
    status?: string;
}

export function useBookings(options: Options = {}) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const fetch = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await bookingsApi.list({
                user: options.userId,
                date: options.date,
                status: options.status,
                page: targetPage,
                page_size: PAGE_SIZE,
            });
            const data = res.data as { items: Booking[]; pagination: Pagination };
            setBookings(data.items);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.userId, options.date, options.status]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [options.userId, options.date, options.status]); // eslint-disable-line

    useEffect(() => {
        fetch(page);
    }, [fetch, page]);

    const goToPage = useCallback((p: number) => setPage(p), []);

    const cancelBooking = useCallback(async (id: number) => {
        setCancellingId(id);
        try {
            await bookingsApi.cancel(id);
            await fetch(page);
        } catch {
            setError("Failed to cancel booking. Please try again.");
        } finally {
            setCancellingId(null);
        }
    }, [fetch, page]);

    const refetch = useCallback(() => fetch(page), [fetch, page]);

    return { bookings, loading, error, cancelBooking, cancellingId, pagination, page, goToPage, refetch };
}
