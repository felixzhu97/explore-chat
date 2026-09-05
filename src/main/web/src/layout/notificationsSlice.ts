import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { FeedApi, type NotificationItemRes } from "@/feed/feed.api";
import { getApiClient } from "@/auth/api-client";

const api = new FeedApi(getApiClient());

interface NotificationsState {
  items: NotificationItemRes[];
  nextCursor?: string;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
  loadingMore: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ limit = 20 }: { limit?: number } = {}) => {
    return api.getNotifications(limit);
  },
);

export const loadMoreNotifications = createAsyncThunk(
  "notifications/loadMore",
  async ({ limit = 20 }: { limit?: number }, { getState }) => {
    const state = getState() as { notifications: NotificationsState };
    const cursor = state.notifications.nextCursor;
    if (!cursor)
      return { items: [] as NotificationItemRes[], nextCursor: undefined };
    return api.getNotifications(limit, cursor);
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  "notifications/readAll",
  async () => {
    await api.markAllNotificationsRead();
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    prependNotification: (
      state,
      action: PayloadAction<NotificationItemRes>,
    ) => {
      const exists = state.items.some((i) => i.id === action.payload.id);
      if (!exists) state.items.unshift(action.payload);
    },
    removeNotificationById: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
      state.nextCursor = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed";
      })
      .addCase(loadMoreNotifications.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(loadMoreNotifications.fulfilled, (state, action) => {
        state.loadingMore = false;
        const newItems = action.payload.items;
        const ids = new Set(state.items.map((i) => i.id));
        for (const item of newItems) {
          if (!ids.has(item.id)) {
            state.items.push(item);
            ids.add(item.id);
          }
        }
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(loadMoreNotifications.rejected, (state) => {
        state.loadingMore = false;
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        const now = new Date().toISOString();
        state.items = state.items.map((i) => ({
          ...i,
          readAt: i.readAt ?? now,
        }));
      });
  },
});

export const {
  prependNotification,
  removeNotificationById,
  clearNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
