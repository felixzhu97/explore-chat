import { AxiosError, isAxiosError } from "axios";
import type { HttpClient } from "@/core/api-client";
import type { AuthUser } from "@/auth/auth.model";

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface AuthRegisterPayload {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<AuthSession> {
    const { data } = await this.http.post<AuthSession>("/auth/login", {
      email,
      password,
    });
    if (!data?.user || !data?.token) {
      throw new Error("Login failed");
    }
    return data;
  }

  async register(payload: AuthRegisterPayload): Promise<AuthSession> {
    const { data } = await this.http.post<AuthSession>(
      "/auth/register",
      payload,
    );
    if (!data?.user || !data?.token) {
      throw new Error("Register failed");
    }
    return data;
  }

  isAuthError(error: unknown): boolean {
    if (isAxiosError(error)) {
      const status = (error as AxiosError).response?.status;
      return status === 401 || status === 403;
    }
    return false;
  }
}
