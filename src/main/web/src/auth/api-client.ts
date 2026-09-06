/** AIP-193 HTTP error body. */
export interface RpcStatus {
  code: string;
  message: string;
  details?: Array<{ "@type"?: string; [key: string]: unknown }>;
}

/** @deprecated Prefer resource bodies and {@link RpcStatus}. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** @deprecated Prefer AIP-158 page tokens. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001/api/v1",
};

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private buildHeaders(options: RequestInit): Record<string, string> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return undefined as T;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return undefined as T;
    }

    if (!response.ok) {
      const err = data as RpcStatus;
      throw new Error(err.message || `HTTP error! status: ${response.status}`);
    }

    return data as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options),
    };

    try {
      const response = await fetch(url, config);
      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("API请求错误:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postStream(endpoint: string, data?: unknown): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: "POST",
      headers: this.buildHeaders({}),
      body: data ? JSON.stringify(data) : undefined,
    };
    return fetch(url, config);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method: "POST",
      body: formData,
      headers: this.buildHeaders({ body: formData }),
    };

    try {
      const response = await fetch(url, config);
      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("文件上传错误:", error);
      throw error;
    }
  }
}

let apiClientInstance: ApiClient | null = null;

export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
};
