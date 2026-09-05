import { useState, useRef, useCallback } from "react";
import type { Contact } from "@/shared/types";

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowSearchSuggestions(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSearchSuggestions(false), 200);
  }, []);

  const handleGlobalSearch = useCallback((query: string) => {
    if (query.trim()) {
      setRecentSearches((prev) =>
        [query, ...prev.filter((s) => s !== query)].slice(0, 10),
      );
    }
  }, []);

  const handleSearchSuggestion = useCallback(
    (
      suggestion: any,
      contacts: Contact[],
      onContactSelect: (contact: Contact) => void,
    ) => {
      if (suggestion.type === "contact") {
        const contact = contacts.find((c) => c.id === suggestion.id);
        if (contact) {
          onContactSelect(contact);
        }
      }
      setShowSearchSuggestions(false);
    },
    [],
  );

  const handleRemoveRecentSearch = useCallback((search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  }, []);

  const filterContacts = useCallback((contacts: Contact[], query: string) => {
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, []);

  return {
    searchQuery,
    showSearchSuggestions,
    recentSearches,
    searchInputRef,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleGlobalSearch,
    handleSearchSuggestion,
    handleRemoveRecentSearch,
    filterContacts,
  };
}
