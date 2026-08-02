"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthSession } from "./auth-session";
import type { AuthState } from "./auth.model";

export function useAuth() {
  const authSession = getAuthSession();
  const [authState, setAuthState] = useState<AuthState>(
    authSession.getAuthState(),
  );

  useEffect(() => {
    const updateState = () => {
      setAuthState(authSession.getAuthState());
    };

    updateState();

    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [authSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authSession.login({ email, password });
      setAuthState(authSession.getAuthState());
      return result;
    },
    [authSession],
  );

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const result = await authSession.register(data);
      setAuthState(authSession.getAuthState());
      return result;
    },
    [authSession],
  );

  const logout = useCallback(async () => {
    await authSession.logout();
    setAuthState(authSession.getAuthState());
  }, [authSession]);

  const updateUser = useCallback(
    async (updates: {
      username?: string;
      name?: string;
      about?: string;
      status?: string;
      avatar?: string;
    }) => {
      const result = await authSession.updateUser(updates);
      setAuthState(authSession.getAuthState());
      return result;
    },
    [authSession],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await authSession.changePassword(
        currentPassword,
        newPassword,
      );
      setAuthState(authSession.getAuthState());
      return result;
    },
    [authSession],
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      return await authSession.forgotPassword(email);
    },
    [authSession],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      return await authSession.resetPassword(token, newPassword);
    },
    [authSession],
  );

  const clearError = useCallback(() => {
    authSession.clearError();
    setAuthState(authSession.getAuthState());
  }, [authSession]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
  };
}
