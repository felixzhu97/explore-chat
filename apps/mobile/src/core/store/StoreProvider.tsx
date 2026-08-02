import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { logout } from "./slices/authSlice";
import { setUnauthorizedHandler } from "@/core/api-client";

export function StoreProvider({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      void store.dispatch(logout());
    });
    return () => setUnauthorizedHandler(null);
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
