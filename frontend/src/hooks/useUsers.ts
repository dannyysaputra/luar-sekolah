import { useState, useEffect } from "react";
import { usersApi } from "../api/users";
import type { DemoUser } from "../types";

export function useUsers() {
    const [users, setUsers] = useState<DemoUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        usersApi.list()
            .then((res) => setUsers(res.data as DemoUser[]))
            .catch(() => {/* silent — non-critical */ })
            .finally(() => setLoading(false));
    }, []);

    return { users, loading };
}
