import { API_CONFIG } from "@/src/infrastructure/config/api.config";

const TOKEN_KEY = "admin_access_token";

export class ApiClient {
  private baseURL = API_CONFIG.baseURL;
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; pagination?: object }> {
    const base = this.baseURL.replace(/\/$/, "");
    const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = `${base}/${path}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
      ...options,
    };
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : this.token;
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    return data;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

let instance: ApiClient | null = null;

export const getApiClient = () => {
  if (!instance) instance = new ApiClient();
  return instance;
};
