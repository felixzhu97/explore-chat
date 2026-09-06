import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import { SOCKET_IO_URL } from "@/core/config/api";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
}

const initialState: SocketState = {
  socket: null,
  connected: false,
};

let currentSocket: Socket | null = null;
let currentToken: string | null = null;

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload as never;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    disconnect: (state) => {
      state.socket = null;
      state.connected = false;
    },
  },
});

export const { setSocket, setConnected, disconnect } = socketSlice.actions;

export const connectSocket = createAsyncThunk(
  "socket/connect",
  async (token: string, { dispatch }) => {
    if (!token) {
      currentSocket?.disconnect();
      currentSocket = null;
      currentToken = null;
      dispatch(disconnect());
      return;
    }
    if (currentSocket && currentToken === token) return;
    currentSocket?.disconnect();
    currentToken = token;
    const socket = io(SOCKET_IO_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      query: { token },
    });
    currentSocket = socket;
    socket.on("connect", () => {
      dispatch(setSocket(socket));
      dispatch(setConnected(true));
    });
    socket.on("disconnect", () => {
      dispatch(setConnected(false));
    });
    socket.on("connect_error", () => {
      dispatch(setConnected(false));
    });
    dispatch(setSocket(socket));
    dispatch(setConnected(socket.connected));
  },
);

export const disconnectSocket = createAsyncThunk(
  "socket/disconnect",
  async (_arg, { dispatch }) => {
    currentSocket?.disconnect();
    currentSocket = null;
    currentToken = null;
    dispatch(disconnect());
  },
);

export default socketSlice.reducer;
