import { useCallback, useEffect, useState } from "react";
import type { StoryUser as MobileStoryUser } from "@/feed/story-user.model";
import { getFeedApi } from "@/core/composition-root";

export function useMobileStories(limit: number = 12) {
  const [items, setItems] = useState<MobileStoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getFeedApi().getSuggestions(limit);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}
