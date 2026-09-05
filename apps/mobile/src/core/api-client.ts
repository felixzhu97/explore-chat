import axios, { type AxiosInstance } from "axios";
import { API_V1 } from "@/core/config/api";

export type HttpResult<T = unknown> = { data: T };

/** Thin axios-like client used by domain API classes. */
export interface HttpClient {
  get<T = unknown>(url: string, config?: unknown): Promise<HttpResult<T>>;
  post<T = unknown>(
    url: string,
    body?: unknown,
    config?: unknown,
  ): Promise<HttpResult<T>>;
  put<T = unknown>(
    url: string,
    body?: unknown,
    config?: unknown,
  ): Promise<HttpResult<T>>;
  patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: unknown,
  ): Promise<HttpResult<T>>;
  delete<T = unknown>(url: string, config?: unknown): Promise<HttpResult<T>>;
}

export function createHttpClientFromAxios(instance: AxiosInstance): HttpClient {
  return {
    get: (url, config) =>
      instance.get(url, config as never).then((r) => ({ data: r.data })),
    post: (url, body, config) =>
      instance.post(url, body, config as never).then((r) => ({ data: r.data })),
    put: (url, body, config) =>
      instance.put(url, body, config as never).then((r) => ({ data: r.data })),
    patch: (url, body, config) =>
      instance
        .patch(url, body, config as never)
        .then((r) => ({ data: r.data })),
    delete: (url, config) =>
      instance.delete(url, config as never).then((r) => ({ data: r.data })),
  };
}

let tokenCache: string | null = null;
let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setApiToken(token: string | null) {
  tokenCache = token;
}

export function setUnauthorizedHandler(
  handler: (() => void | Promise<void>) | null,
) {
  unauthorizedHandler = handler;
}

export function createApiClient() {
  const client = axios.create({
    baseURL: API_V1,
    headers: tokenCache ? { Authorization: `Bearer ${tokenCache}` } : {},
  });
  client.interceptors.request.use(async (config) => {
    if (tokenCache) {
      config.headers.Authorization = `Bearer ${tokenCache}`;
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        await unauthorizedHandler?.();
      }
      return Promise.reject(error);
    },
  );
  return client;
}

export const apiClient = createApiClient();
