import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/constants/config";
import type { ApiError } from "@/types/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

let tokenGetter: () => string | null = () => null;
export const setAuthTokenGetter = (fn: () => string | null) => {
  tokenGetter = fn;
};

let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

let onNetworkError: ((error: Error) => void) | null = null;
export const setOnNetworkError = (fn: (error: Error) => void) => {
  onNetworkError = fn;
};

let refreshTokenFn: (() => Promise<string | null>) | null = null;
export const setRefreshTokenFn = (fn: () => Promise<string | null>) => {
  refreshTokenFn = fn;
};

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenGetter();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (
    error: AxiosError<{ message?: string; code?: string; details?: Record<string, unknown> }>,
  ) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && refreshTokenFn) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenFn();
        if (newToken) {
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // refresh failed
      } finally {
        isRefreshing = false;
      }

      pendingRequests = [];
      onUnauthorized?.();
      return Promise.reject(error);
    }

    if (!error.response) {
      onNetworkError?.(error);
    }

    const normalized: ApiError = {
      message:
        error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again.",
      status: error.response?.status,
      code: error.response?.data?.code ?? error.code,
      details: error.response?.data?.details,
    };
    return Promise.reject(normalized);
  },
);
