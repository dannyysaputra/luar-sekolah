import { apiClient } from "./client";
import type { ApiSuccess, DemoUser } from "../types";

export const usersApi = {
    list: () => apiClient.get<ApiSuccess<DemoUser[]>>("/users/"),
};
