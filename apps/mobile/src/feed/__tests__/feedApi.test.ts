// Tests for feedApi - testing the API endpoints structure
describe("feedApi", () => {
  describe("API Structure", () => {
    it("should export feedApi", () => {
      const { feedApi } = require("../feedApi");
      expect(feedApi).toBeDefined();
    });

    it("should export useGetFeedFirstQuery hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useGetFeedFirstQuery).toBe("function");
    });

    it("should export useLikePostMutation hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useLikePostMutation).toBe("function");
    });

    it("should export useFollowUserMutation hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useFollowUserMutation).toBe("function");
    });

    it("should export useTrackEventsMutation hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useTrackEventsMutation).toBe("function");
    });

    it("should export useGetPostCommentsQuery hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useGetPostCommentsQuery).toBe("function");
    });

    it("should export useCreatePostCommentMutation hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useCreatePostCommentMutation).toBe("function");
    });

    it("should export useDeletePostCommentMutation hook", () => {
      const { feedApi } = require("../feedApi");
      expect(typeof feedApi.useDeletePostCommentMutation).toBe("function");
    });
  });

  describe("Endpoint Names", () => {
    it("should have expected endpoint names", () => {
      const { feedApi } = require("../feedApi");
      const endpointNames = Object.keys(feedApi.endpoints);

      expect(endpointNames).toContain("getFeedFirst");
      expect(endpointNames).toContain("getFeedMore");
      expect(endpointNames).toContain("getReelsFirst");
      expect(endpointNames).toContain("getStoryUsers");
      expect(endpointNames).toContain("getStatuses");
      expect(endpointNames).toContain("likePost");
      expect(endpointNames).toContain("unlikePost");
      expect(endpointNames).toContain("savePost");
      expect(endpointNames).toContain("unsavePost");
      expect(endpointNames).toContain("followUser");
      expect(endpointNames).toContain("unfollowUser");
    });
  });

  describe("Reducer Path", () => {
    it("should have correct reducer path", () => {
      const { feedApi } = require("../feedApi");
      expect(feedApi.reducerPath).toBe("feedApi");
    });
  });
});
