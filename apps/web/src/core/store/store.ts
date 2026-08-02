import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import { createPersistStorage } from "./createPersistStorage";
import callsReducer from "./slices/callsSlice";
import contactsReducer from "./slices/contactsSlice";
import messagesReducer from "./slices/messagesSlice";
import notificationsReducer from "./slices/notificationsSlice";

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
