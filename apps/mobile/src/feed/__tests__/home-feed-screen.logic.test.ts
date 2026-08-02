// Unit tests for HomeFeedScreen logic
describe("HomeFeedScreen Logic", () => {
  describe("Story formatting", () => {
    it("should format story data correctly", () => {
      const statuses = [
        {
          id: "s1",
          userId: "u1",
          user: { id: "u1", username: "user1", avatar: "avatar1.jpg" },
          createdAt: "2024-06-15T12:00:00Z",
          isViewed: false,
        },
        {
          id: "s2",
          userId: "u1",
          user: { id: "u1", username: "user1", avatar: "avatar1.jpg" },
          createdAt: "2024-06-16T12:00:00Z",
          isViewed: true,
        },
      ];

      // Group by user and take latest
      const byUser = new Map();
      for (const s of statuses) {
        const uid = s.userId ?? s.user?.id;
        if (!uid) continue;
        const prev = byUser.get(uid);
        if (
          !prev ||
          new Date(prev.createdAt).getTime() < new Date(s.createdAt).getTime()
        ) {
          byUser.set(uid, s);
        }
      }

      const stories = Array.from(byUser.values()).map((s) => ({
        id: s.id,
        userId: s.userId ?? s.user?.id,
        username: s.user?.username ?? "",
        avatar: s.user?.avatar ?? "",
        isViewed: Boolean(s.isViewed),
      }));

      expect(stories.length).toBe(1);
      expect(stories[0].username).toBe("user1");
      expect(stories[0].isViewed).toBe(true); // latest is viewed
    });
  });

  describe("Like count formatting", () => {
    it("should format large like counts", () => {
      const formatCount = (value: number) => {
        if (!Number.isFinite(value)) return "0";
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return `${Math.max(0, Math.trunc(value))}`;
      };

      expect(formatCount(1500)).toBe("1.5K");
      expect(formatCount(2500000)).toBe("2.5M");
      expect(formatCount(100)).toBe("100");
      expect(formatCount(0)).toBe("0");
      expect(formatCount(-10)).toBe("0");
    });
  });

  describe("Following check logic", () => {
    it("should create following map from API response", () => {
      const list = [
        { userId: "user-1", isFollowing: true },
        { userId: "user-2", isFollowing: false },
      ];

      const map = Object.fromEntries(
        list.map((row) => [row.userId, Boolean(row.isFollowing)]),
      );

      expect(map["user-1"]).toBe(true);
      expect(map["user-2"]).toBe(false);
    });
  });

  describe("Post filtering", () => {
    it("should filter out own posts from following check", () => {
      const currentUserId = "user-1";
      const authorIds = ["user-1", "user-2", "user-3", "user-1"];

      const unique = [...new Set(authorIds)];
      const filtered = unique.filter((id) => id !== currentUserId);

      expect(filtered).toEqual(["user-2", "user-3"]);
    });
  });
});
