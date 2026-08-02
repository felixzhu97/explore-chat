import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Contact } from "@/chat/contact.model";

interface ContactsState {
  contacts: Contact[];
  selectedContactId: string | null;
  searchQuery: string;
  favoriteContacts: string[];
  blockedContacts: string[];
}

const initialState: ContactsState = {
  contacts: [],
  selectedContactId: null,
  searchQuery: "",
  favoriteContacts: [],
  blockedContacts: [],
};

function filterByQuery(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts;
  const q = query.toLowerCase();
  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.phoneNumber && c.phoneNumber.includes(q)),
  );
}

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    updateContact: (
      state,
      action: PayloadAction<{ contactId: string; updates: Partial<Contact> }>,
    ) => {
      const idx = state.contacts.findIndex(
        (c) => c.id === action.payload.contactId,
      );
      if (idx !== -1) {
        state.contacts[idx] = {
          ...state.contacts[idx],
          ...action.payload.updates,
        };
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      if (state.selectedContactId === action.payload) {
        state.selectedContactId = null;
      }
    },
    setSelectedContact: (state, action: PayloadAction<string | null>) => {
      state.selectedContactId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.favoriteContacts.includes(id)) {
        state.favoriteContacts.push(id);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteContacts = state.favoriteContacts.filter(
        (id) => id !== action.payload,
      );
    },
    blockContact: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.blockedContacts.includes(id)) {
        state.blockedContacts.push(id);
      }
    },
    unblockContact: (state, action: PayloadAction<string>) => {
      state.blockedContacts = state.blockedContacts.filter(
        (id) => id !== action.payload,
      );
    },
  },
});

export const {
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  setSelectedContact,
  setSearchQuery,
  addToFavorites,
  removeFromFavorites,
  blockContact,
  unblockContact,
} = contactsSlice.actions;

export const selectFilteredContacts = (state: { contacts: ContactsState }) =>
  filterByQuery(state.contacts.contacts, state.contacts.searchQuery);
export const selectContactById = (
  state: { contacts: ContactsState },
  id: string,
) => state.contacts.contacts.find((c) => c.id === id);
export const selectSelectedContact = (state: { contacts: ContactsState }) =>
  state.contacts.selectedContactId
    ? (state.contacts.contacts.find(
        (c) => c.id === state.contacts.selectedContactId,
      ) ?? null)
    : null;

export default contactsSlice.reducer;
