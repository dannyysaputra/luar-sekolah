import type { ApiError } from "../types";

const BASE_URL = "/api";

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err: ApiError = {
            message: json.message ?? "An unexpected error occurred.",
            errors: json.errors,
        };
        const e = Object.assign(new Error(err.message), {
            status: res.status,
            apiError: err,
        });
        throw e;
    }

    return json as T;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
