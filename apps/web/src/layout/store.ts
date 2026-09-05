import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { getStorage } from "@/auth/storage";
import callsReducer from "@/calls/callsSlice";
import contactsReducer from "@/chat/contactsSlice";
import messagesReducer from "@/chat/messagesSlice";
import notificationsReducer from "@/layout/notificationsSlice";

function createPersistStorage() {
  const adapter = getStorage();
  return {
    getItem: (key: string): Promise<string | null> => {
      const v = adapter.load(key, null as unknown as string);
      return Promise.resolve(
        v == null ? null : typeof v === "string" ? v : JSON.stringify(v),
      );
    },
    setItem: (key: string, value: string): Promise<void> => {
      adapter.save(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string): Promise<void> => {
      adapter.remove(key);
      return Promise.resolve();
    },
  };
}

const rootReducer = combineReducers({
  calls: callsReducer,
  contacts: contactsReducer,
  messages: messagesReducer,
  notifications: notificationsReducer,
});

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root",
  storage: createPersistStorage(),
  whitelist: ["calls", "contacts", "messages"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
