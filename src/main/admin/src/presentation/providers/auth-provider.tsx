"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";

interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  status?: string;
  roles?: string[];
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = getApiClient();

  const loadUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<{ user: User }>("auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch {
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{
        user: User;
        token: string;
        refreshToken: string;
      }>("auth/login", { email, password });
      const d = (res as { data?: { user: User; token: string } }).data;
      if (res.success && d?.token) {
        api.setToken(d.token);
        setUser(d.user);
      } else {
        throw new Error((res as { message?: string }).message || "登录失败");
      }
    },
    [api]
  );

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, [api]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
