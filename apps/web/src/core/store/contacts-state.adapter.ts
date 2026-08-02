/**
 * Contacts state - Redux slice.
 * Use useContactsStore(selector) in components, or store.getState().contacts in services.
 */
import { useAppSelector } from "./hooks";
import { store, type RootState } from "./store";

export const useContactsStore = <T>(
  selector: (state: RootState["contacts"]) => T,
): T => useAppSelector((s) => selector(s.contacts));

export { store };
