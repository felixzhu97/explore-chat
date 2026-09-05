/**
 * Contacts state - Redux slice.
 * Use useContactsStore(selector) in components, or store.getState().contacts in services.
 */
import { useAppSelector } from "@/layout/store-hooks";
import { store, type RootState } from "@/layout/store";

export const useContactsStore = <T>(
  selector: (state: RootState["contacts"]) => T,
): T => useAppSelector((s) => selector(s.contacts));

export { store };
