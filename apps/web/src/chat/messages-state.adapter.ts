/**
 * Messages state - Redux slice.
 * Use useMessagesStore(selector) in components, or store.getState().messages in services.
 */
import { useAppSelector } from "@/layout/store-hooks";
import { store, type RootState } from "@/layout/store";

export const useMessagesStore = <T>(
  selector: (state: RootState["messages"]) => T,
): T => useAppSelector((s) => selector(s.messages));

export { store };
