import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import type { StoryUser as MobileStoryUser } from "@/feed/story-user.model";
import { getFeedApi } from "@/core/composition-root";
import { apiClient } from "@/core/api-client";

type FeedPage = { posts: MobileFeedPost[]; nextPageState?: string };

type EngagementResult = {
  postId: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

type FollowResult = {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
};
type FollowingCheckResult = { userId: string; isFollowing: boolean };

type StatusViewResult = { statusId: string; isViewed: boolean };

type AnalyticsEventInput = {
  eventName: string;
  idempotencyKey?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  context?: { userId?: string; sessionId?: string; platform?: string };
};

type UploadMediaInput = {
  uri: string;
  mimeType: string;
  fileName?: string;
  folder?: string;
};

type UploadMediaResult = {
  key: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
};

type CreatePostInput = {
  caption: string;
  type: "TEXT" | "IMAGE" | "VIDEO";
  mediaUrls?: string[];
  location?: string;
  coverUrl?: string;
};

type CreatePostResult = {
  postId: string;
  userId: string;
  createdAt: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
  location?: string;
  coverUrl?: string;
};

type PostComment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
};

type PostCommentListQuery = {
  postId: string;
  page?: number;
  limit?: number;
};

type PostCommentCreateInput = {
  postId: string;
  content: string;
  parentId?: string;
};

export const feedApi = createApi({
  reducerPath: "feedApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Feed", "Stories", "Status", "Comments"],
  endpoints: (build) => ({
    getFeedFirst: build.query<FeedPage, { limit: number }>({
      queryFn: async ({ limit }) => {
        try {
          const data = await getFeedApi().getFeed(limit);
          return { data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
      providesTags: ["Feed"],
    }),
    getFeedMore: build.query<FeedPage, { limit: number; pageState: string }>({
      queryFn: async ({ limit, pageState }) => {
        try {
          const data = await getFeedApi().getFeed(limit, pageState);
          return { data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
    }),
    getReelsFirst: build.query<FeedPage, { limit: number }>({
      queryFn: async ({ limit }) => {
        try {
          const data = await getFeedApi().getReels(limit);
          return { data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
      providesTags: ["Feed"],
    }),
    getReelsMore: build.query<FeedPage, { limit: number; pageState: string }>({
      queryFn: async ({ limit, pageState }) => {
        try {
          const data = await getFeedApi().getReels(limit, pageState);
          return { data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
    }),
    getStoryUsers: build.query<MobileStoryUser[], { limit: number }>({
      queryFn: async ({ limit }) => {
        try {
          const data = await getFeedApi().getSuggestions(limit);
          return { data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
      providesTags: ["Stories"],
    }),
    getStatuses: build.query<any[], void>({
      queryFn: async () => {
        try {
          const res = await apiClient.get<{ statuses?: any[] }>("/status");
          return {
            data: Array.isArray(res.data?.statuses) ? res.data.statuses : [],
          };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
      providesTags: ["Status"],
    }),
    likePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<EngagementResult>(
            `/posts/${postId}:like`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData(
            "getFeedFirst",
            { limit: 8 },
            (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              if (!p.isLiked) {
                p.isLiked = true;
                p.likeCount = Math.max(0, (p.likeCount ?? 0) + 1);
              }
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData(
              "getFeedFirst",
              { limit: 8 },
              (draft) => {
                const p = draft.posts?.find((x) => x.id === postId);
                if (!p) return;
                p.isLiked = true;
                p.likeCount = data.likeCount;
                p.commentCount = data.commentCount;
                p.isSaved = p.isSaved ?? data.isSaved;
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    unlikePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<EngagementResult>(
            `/posts/${postId}:unlike`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData(
            "getFeedFirst",
            { limit: 8 },
            (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              if (p.isLiked) {
                p.isLiked = false;
                p.likeCount = Math.max(0, (p.likeCount ?? 0) - 1);
              }
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData(
              "getFeedFirst",
              { limit: 8 },
              (draft) => {
                const p = draft.posts?.find((x) => x.id === postId);
                if (!p) return;
                p.isLiked = false;
                p.likeCount = data.likeCount;
                p.commentCount = data.commentCount;
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    savePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<EngagementResult>(
            `/posts/${postId}:save`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData(
            "getFeedFirst",
            { limit: 8 },
            (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isSaved = true;
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData(
              "getFeedFirst",
              { limit: 8 },
              (draft) => {
                const p = draft.posts?.find((x) => x.id === postId);
                if (!p) return;
                p.isSaved = true;
                p.likeCount = data.likeCount;
                p.commentCount = data.commentCount;
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    unsavePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<EngagementResult>(
            `/posts/${postId}:unsave`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData(
            "getFeedFirst",
            { limit: 8 },
            (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isSaved = false;
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData(
              "getFeedFirst",
              { limit: 8 },
              (draft) => {
                const p = draft.posts?.find((x) => x.id === postId);
                if (!p) return;
                p.isSaved = false;
                p.likeCount = data.likeCount;
                p.commentCount = data.commentCount;
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    followUser: build.mutation<FollowResult, { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const res = await apiClient.post<FollowResult>(
            `/users/${userId}:follow`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
    }),
    unfollowUser: build.mutation<FollowResult, { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const res = await apiClient.post<FollowResult>(
            `/users/${userId}:unfollow`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
    }),
    checkFollowingUsers: build.mutation<
      FollowingCheckResult[],
      { userIds: string[] }
    >({
      queryFn: async ({ userIds }) => {
        try {
          const res = await apiClient.post<{
            results?: FollowingCheckResult[];
          }>(`/users/following:check`, { userIds });
          return {
            data: Array.isArray(res.data?.results) ? res.data.results : [],
          };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
    }),
    viewStatus: build.mutation<StatusViewResult, { statusId: string }>({
      queryFn: async ({ statusId }) => {
        try {
          const res = await apiClient.post<StatusViewResult>(
            `/status/${statusId}:view`,
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "操作失败",
            } as any,
          };
        }
      },
      invalidatesTags: ["Status"],
    }),
    trackEvents: build.mutation<
      { success: true },
      { events: AnalyticsEventInput[] }
    >({
      queryFn: async ({ events }) => {
        try {
          await apiClient.post(`/analytics/events`, { events });
          return { data: { success: true } };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "上报失败",
            } as any,
          };
        }
      },
    }),
    uploadMedia: build.mutation<UploadMediaResult, UploadMediaInput>({
      queryFn: async ({ uri, mimeType, fileName, folder }) => {
        try {
          const formData = new FormData();
          formData.append("file", {
            uri,
            type: mimeType,
            name: fileName ?? `upload-${Date.now()}`,
          } as any);
          if (folder) formData.append("folder", folder);
          const res = await apiClient.post<UploadMediaResult>(
            `/media/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "上传失败",
            } as any,
          };
        }
      },
    }),
    createPost: build.mutation<CreatePostResult, CreatePostInput>({
      queryFn: async (body) => {
        try {
          const res = await apiClient.post<CreatePostResult>(`/posts`, body);
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "发布失败",
            } as any,
          };
        }
      },
      invalidatesTags: ["Feed"],
    }),
    getPostComments: build.query<PostComment[], PostCommentListQuery>({
      queryFn: async ({ postId, page = 1, limit = 20 }) => {
        try {
          const res = await apiClient.get<{ comments?: PostComment[] }>(
            `/posts/${postId}/comments`,
            {
              params: { page_size: limit },
            },
          );
          return {
            data: Array.isArray(res.data?.comments) ? res.data.comments : [],
          };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "加载失败",
            } as any,
          };
        }
      },
      providesTags: (_result, _error, arg) => [
        { type: "Comments", id: arg.postId },
      ],
    }),
    createPostComment: build.mutation<PostComment, PostCommentCreateInput>({
      queryFn: async ({ postId, content, parentId }) => {
        try {
          const res = await apiClient.post<PostComment>(
            `/posts/${postId}/comments`,
            {
              content,
              parentId,
            },
          );
          return { data: res.data };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "发送失败",
            } as any,
          };
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Comments", id: arg.postId },
        "Feed",
      ],
    }),
    deletePostComment: build.mutation<
      { deleted: boolean },
      { postId: string; commentId: string }
    >({
      queryFn: async ({ commentId }) => {
        try {
          await apiClient.delete(`/comments/${commentId}`);
          return { data: { deleted: true } };
        } catch (e) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: e instanceof Error ? e.message : "删除失败",
            } as any,
          };
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Comments", id: arg.postId },
        "Feed",
      ],
    }),
  }),
});

export const {
  useGetFeedFirstQuery,
  useLazyGetFeedMoreQuery,
  useGetReelsFirstQuery,
  useLazyGetReelsMoreQuery,
  useGetStoryUsersQuery,
  useGetStatusesQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCheckFollowingUsersMutation,
  useViewStatusMutation,
  useTrackEventsMutation,
  useUploadMediaMutation,
  useCreatePostMutation,
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
} = feedApi;
