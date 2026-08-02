import { useCallback, useRef, useState } from "react";
import uniqBy from "lodash/uniqBy";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import { getFeedApi } from "@/core/composition-root";

const INITIAL_LIMIT = 5;
const LOAD_MORE_LIMIT = 5;

export function useMobileFeed() {
  const [items, setItems] = useState<MobileFeedPost[]>([]);
  const [pageState, setPageState] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      if (!reset && !hasMore) return;
      if (reset) {
        setItems([]);
        setPageState(undefined);
        setHasMore(true);
      }
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      try {
        const isInitial = reset || !pageState;
        const limit = isInitial ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
        const currentPageState = isInitial ? undefined : pageState;
        const { posts, nextPageState } = await getFeedApi().getFeed(
          limit,
          currentPageState,
        );
        setHasMore(Boolean(nextPageState));
        setPageState(nextPageState);
        setItems((prev) => {
          if (isInitial) return posts;
          return uniqBy([...prev, ...posts], "id");
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [hasMore, pageState],
  );

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const initialLoading = loading && items.length === 0;
  const loadingMore = loading && items.length > 0;

  return {
    items,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    load,
    refresh,
  };
}
