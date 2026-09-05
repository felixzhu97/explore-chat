import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "@/auth/auth.model";
import { setApiToken } from "@/core/api-client";

const TOKEN_KEY = "@chat_token";
const REFRESH_TOKEN_KEY = "@chat_refresh_token";
const USER_KEY = "@chat_user";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isReady: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isReady: false,
};

export const setAuth = createAsyncThunk(
  "auth/setAuth",
  async (
    payload: { token: string; refreshToken: string; user: AuthUser },
    _thunkAPI,
  ) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, payload.token],
      [REFRESH_TOKEN_KEY, payload.refreshToken],
      [USER_KEY, JSON.stringify(payload.user)],
    ]);
    setApiToken(payload.token);
    return payload;
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  setApiToken(null);
});

export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
  const [[, token], [, refreshToken], [, userJson]] =
    await AsyncStorage.multiGet([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
  setApiToken(token ?? null);
  return {
    token: token ?? null,
    refreshToken: refreshToken ?? null,
    user,
  };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isReady = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isReady = true;
      });
  },
});

export default authSlice.reducer;
