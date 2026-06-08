import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const mediaUrl = (path: string | null | undefined): string | null =>
  path ? `${API_URL}${path}` : null;

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

// Shared refresh promise — ensures only one /auth/refresh call fires at a time.
// All concurrent 401s wait for the same promise instead of each triggering their own refresh.
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"] ?? "60";
      toast.error(`Слишком много запросов. Подождите ${retryAfter}с`);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            .then(({ data }) => {
              if (data.user) useAuthStore.getState().setUser(data.user);
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return api(error.config);
      } catch {
        refreshPromise = null;
        useAuthStore.getState().clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
