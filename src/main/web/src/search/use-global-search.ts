"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import {
  SearchScopes,
  SearchUiScopes,
  type SearchUiScope,
} from "@whatschat/shared-types";
import { FeedApi } from "@/feed/feed.api";
import { getApiClient } from "@/auth/api-client";

const api = new FeedApi(getApiClient());
const LIMIT = 20;
const DEBOUNCE_MS = 350;

/** @deprecated Prefer SearchUiScope from @whatschat/shared-types */
export type SearchType = SearchUiScope;

export interface SearchHit {
  type: "user" | "post" | "hashtag";
  id: string;
  data: Record<string, unknown>;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchUiScope>(
    SearchUiScopes.All,
  );
  const [userHits, setUserHits] = useState<unknown[]>([]);
  const [postHits, setPostHits] = useState<unknown[]>([]);
  const [hashtagHits, setHashtagHits] = useState<unknown[]>([]);
  const [userNextCursor, setUserNextCursor] = useState<string | undefined>();
  const [postNextCursor, setPostNextCursor] = useState<string | undefined>();
  const [hashtagNextCursor, setHashtagNextCursor] = useState<
    string | undefined
  >();
  const [postTotal, setPostTotal] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<unknown[]>([]);
  const runSearch = useCallback(
    async (
      q: string,
      type: SearchUiScope,
      cursor?: string,
      append?: boolean,
    ) => {
      const trimmed = q.trim();
      if (!trimmed && type !== SearchUiScopes.All) return;
      const isLoadMore = !!cursor;
      if (type === SearchUiScopes.All) {
        if (isLoadMore) return;
        setLoading(true);
        setError(null);
        try {
          const [u, p, h] = await Promise.all([
            api.search(trimmed, SearchScopes.Users, 10),
            api.search(trimmed, SearchScopes.Posts, LIMIT),
            api.search(trimmed, SearchScopes.Hashtags, 10),
          ]);
          setUserHits(u.hits);
          setUserNextCursor(u.nextCursor);
          setPostHits(p.hits);
          setPostNextCursor(p.nextCursor);
          setPostTotal(p.total);
          setHashtagHits(h.hits);
          setHashtagNextCursor(h.nextCursor);
          setHashtagSuggestions((h.hits as unknown[]).slice(0, 5));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Search failed");
        } finally {
          setLoading(false);
        }
        return;
      }
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const typeKey =
          type === SearchScopes.Users
            ? SearchScopes.Users
            : type === SearchScopes.Posts
              ? SearchScopes.Posts
              : SearchScopes.Hashtags;
        const res = await api.search(trimmed, typeKey, LIMIT, cursor);
        if (type === SearchScopes.Users) {
          if (append)
            setUserHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setUserHits(res.hits as unknown[]);
          setUserNextCursor(res.nextCursor);
        } else if (type === SearchScopes.Posts) {
          if (append)
            setPostHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setPostHits(res.hits as unknown[]);
          setPostNextCursor(res.nextCursor);
          setPostTotal(res.total);
        } else {
          if (append)
            setHashtagHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setHashtagHits(res.hits as unknown[]);
          setHashtagNextCursor(res.nextCursor);
          setHashtagSuggestions((res.hits as unknown[]).slice(0, 5));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const loadHashtagSuggestions = useCallback(async (q: string) => {
    const t = q.replace(/^#/, "").trim().toLowerCase();
    if (!t) {
      setHashtagSuggestions([]);
      return;
    }
    try {
      const res = await api.search(t, SearchScopes.Hashtags, 5);
      setHashtagSuggestions(res.hits);
    } catch {
      setHashtagSuggestions([]);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextQuery: string, nextType: SearchUiScope) => {
        void runSearch(nextQuery, nextType);
      }, DEBOUNCE_MS),
    [runSearch],
  );

  const debouncedSuggestions = useMemo(
    () =>
      debounce((nextQuery: string) => {
        void loadHashtagSuggestions(nextQuery);
      }, 200),
    [loadHashtagSuggestions],
  );

  useEffect(() => {
    if (!query.trim()) {
      debouncedSearch.cancel();
      setUserHits([]);
      setPostHits([]);
      setHashtagHits([]);
      setUserNextCursor(undefined);
      setPostNextCursor(undefined);
      setHashtagNextCursor(undefined);
      setPostTotal(undefined);
      setError(null);
      return;
    }
    debouncedSearch(query, searchType);
    return () => debouncedSearch.cancel();
  }, [query, searchType, debouncedSearch]);

  useEffect(() => {
    if (
      searchType === SearchUiScopes.All ||
      searchType === SearchScopes.Hashtags
    ) {
      debouncedSuggestions.cancel();
      return;
    }
    debouncedSuggestions(query);
    return () => debouncedSuggestions.cancel();
  }, [query, searchType, debouncedSuggestions]);

  const loadMore = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || searchType === SearchUiScopes.All) return;
    if (searchType === SearchScopes.Users && userNextCursor) {
      runSearch(trimmed, SearchScopes.Users, userNextCursor, true);
    } else if (searchType === SearchScopes.Posts && postNextCursor) {
      runSearch(trimmed, SearchScopes.Posts, postNextCursor, true);
    } else if (searchType === SearchScopes.Hashtags && hashtagNextCursor) {
      runSearch(trimmed, SearchScopes.Hashtags, hashtagNextCursor, true);
    }
  }, [
    query,
    searchType,
    userNextCursor,
    postNextCursor,
    hashtagNextCursor,
    runSearch,
  ]);

  const nextCursor =
    searchType === SearchScopes.Users
      ? userNextCursor
      : searchType === SearchScopes.Posts
        ? postNextCursor
        : searchType === SearchScopes.Hashtags
          ? hashtagNextCursor
          : undefined;

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    userHits,
    postHits,
    hashtagHits,
    postTotal,
    loading,
    loadingMore,
    error,
    nextCursor,
    loadMore,
    hashtagSuggestions,
    runSearch,
  };
}
