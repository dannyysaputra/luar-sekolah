import { useState, useEffect, useCallback } from "react";
import { roomsApi } from "../api/rooms";
import type { Room, Pagination } from "../types";

const PAGE_SIZE = 6;

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const fetch = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await roomsApi.list(targetPage, PAGE_SIZE);
            const data = res.data as { items: Room[]; pagination: Pagination };
            setRooms(data.items);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load rooms. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch(page);
    }, [fetch, page]);

    const goToPage = useCallback((p: number) => setPage(p), []);

    return { rooms, loading, error, pagination, page, goToPage, refetch: () => fetch(page) };
}
