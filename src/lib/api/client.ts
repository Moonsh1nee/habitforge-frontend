import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const mediaUrl = (path: string | null | undefined): string | null =>
  path ? `${API_URL}${path}` : null;

export const api = axios.create({ baseURL: API_URL });

// Shared refresh promise — ensures only one /auth/refresh call fires at a time.
// All concurrent 401s wait for the same promise instead of each triggering their own refresh.
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
            .post(`${API_URL}/auth/refresh`, {
              refresh_token: useAuthStore.getState().refreshToken,
            })
            .then(({ data }) => {
              useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
              if (data.user) useAuthStore.getState().setUser(data.user);
              return data.access_token as string;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        error.config.headers.Authorization = `Bearer ${newToken}`;
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
