import React, { useEffect, useMemo, useRef, useState } from "react";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import unionBy from "lodash/unionBy";
import uniq from "lodash/uniq";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ViewToken,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useScrollToTop } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { styled } from "@/shared/emotion";
import { FeedPostCard } from "@/shared/components";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import {
  useGetFeedFirstQuery,
  useLazyGetFeedMoreQuery,
  useGetStatusesQuery,
  useGetStoryUsersQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCheckFollowingUsersMutation,
  useTrackEventsMutation,
} from "@/feed/feedApi";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/core/store/hooks";

const Page = styled.View`
  flex: 1;
  background-color: (p: {theme: {colors: {background: string}}}) =>
    p.theme.colors.background;
`;

const Header = styled.View`
  padding: 8px 12px 6px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderIconButton = styled.TouchableOpacity`
  padding: 4px;
  margin-left: 12px;
`;

const StoriesContainer = styled.View`
  padding-vertical: 8px;
`;

const StoriesListBase = styled.View`
  padding-left: 8px;
`;

const StoryItem = styled.View`
  width: 70px;
  align-items: center;
  margin-right: 8px;
`;

const StoryAvatarWrap = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
`;

const StoryAvatarInner = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  overflow: hidden;
  background-color: (p: {theme: {colors: {tertiaryBackground: string}}}) =>
    p.theme.colors.tertiaryBackground;
`;

const StoryAvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const StoryName = styled.Text`
  font-size: 11px;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

const ListHeader = styled.View`
  background-color: (p: {theme: {colors: {background: string}}}) =>
    p.theme.colors.background;
  padding-bottom: 8px;
`;

const LoadingMore = styled.View`
  padding-vertical: 12px;
`;

const EmptyState = styled.View`
  padding-vertical: 40px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: (p: {theme: {colors: {secondaryText: string}}}) =>
    p.theme.colors.secondaryText;
  margin-top: 8px;
`;

const SkeletonCard = styled.View`
  background-color: (p: {theme: {colors: {secondaryBackground: string}}}) =>
    p.theme.colors.secondaryBackground;
  padding: 12px;
  margin-bottom: 24px;
`;

const SkeletonBar = styled.View<{ w: number; h: number }>`
  width: ${(p) => p.w}px;
  height: ${(p) => p.h}px;
  border-radius: 8px;
  background-color: (p: {theme: {colors: {tertiaryBackground: string}}}) =>
    p.theme.colors.tertiaryBackground;
  margin-bottom: 10px;
`;

export const HomeFeedScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const {
    data: feedFirst,
    isFetching: isFetchingFirst,
    isError: isFeedError,
    refetch,
  } = useGetFeedFirstQuery({
    limit: 8,
  });
  const [triggerMore, moreResult] = useLazyGetFeedMoreQuery();
  const { data: statuses } = useGetStatusesQuery();
  const { data: storyUsers } = useGetStoryUsersQuery({ limit: 12 });
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [checkFollowingUsers] = useCheckFollowingUsersMutation();
  const [trackEvents] = useTrackEventsMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const listRef = useRef<FlatList<any> | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [nextPageState, setNextPageState] = useState<string | undefined>(
    undefined,
  );
  const [followingByUserId, setFollowingByUserId] = useState<
    Record<string, boolean>
  >({});

  useScrollToTop(listRef);

  const viewabilityConfig = { itemVisiblePercentThreshold: 70 };
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const first = viewableItems.find((v) => v.isViewable && v.item?.id);
      if (first && typeof first.item.id === "string") {
        setActivePostId(first.item.id);
        const key = `post_impression:${first.item.id}:${Math.floor(Date.now() / 60000)}`;
        trackEvents({
          events: [
            {
              eventName: "post_impression",
              idempotencyKey: key,
              properties: { postId: first.item.id, source: "home_feed" },
            },
          ],
        });
      } else {
        setActivePostId(null);
      }
    },
  );

  useEffect(() => {
    if (feedFirst?.posts) {
      setItems(feedFirst.posts);
      setNextPageState(feedFirst.nextPageState);
    }
  }, [feedFirst?.posts, feedFirst?.nextPageState]);

  const authorIds = useMemo(() => {
    const ids = items
      .map((p) => p.userId)
      .filter((id) => typeof id === "string" && id.length > 0);
    const unique = uniq(ids);
    return currentUserId ? unique.filter((id) => id !== currentUserId) : unique;
  }, [items, currentUserId]);

  const authorIdsKey = useMemo(() => sortBy(authorIds).join("|"), [authorIds]);

  useEffect(() => {
    if (!currentUserId) return;
    if (authorIds.length === 0) {
      setFollowingByUserId({});
      return;
    }
    checkFollowingUsers({ userIds: authorIds })
      .unwrap()
      .then((list) => {
        const map = Object.fromEntries(
          Object.entries(keyBy(list, "userId")).map(([userId, row]) => [
            userId,
            Boolean(row?.isFollowing),
          ]),
        ) as Record<string, boolean>;
        setFollowingByUserId(map);
      })
      .catch(() => {
        setFollowingByUserId({});
      });
  }, [authorIdsKey, currentUserId, checkFollowingUsers]);

  const stories = useMemo(() => {
    const list =
      Array.isArray(statuses) && statuses.length > 0 ? statuses : null;
    if (list) {
      const byUser = new Map<string, any>();
      for (const s of list) {
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
      return Array.from(byUser.values()).map((s) => ({
        id: s.id,
        userId: s.userId ?? s.user?.id,
        username: s.user?.username ?? "",
        avatar: s.user?.avatar ?? "",
        isViewed: Boolean(s.isViewed),
      }));
    }
    const users = Array.isArray(storyUsers) ? storyUsers : [];
    return users.map((u) => ({
      id: u.id,
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
      isViewed: false,
    }));
  }, [statuses, storyUsers]);

  const initialLoading = isFetchingFirst && items.length === 0;
  const loadingMore = moreResult.isFetching;

  const listData = initialLoading
    ? [{ id: "__skeleton_1" }, { id: "__skeleton_2" }, { id: "__skeleton_3" }]
    : items;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <FlatList
          ref={listRef}
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
          renderItem={({ item }) =>
            initialLoading ? (
              <SkeletonCard>
                <SkeletonBar w={160} h={14} />
                <SkeletonBar w={240} h={12} />
                <SkeletonBar w={360} h={420} />
                <SkeletonBar w={200} h={12} />
              </SkeletonCard>
            ) : (
              <FeedPostCard
                post={item}
                isActive={item.id === activePostId}
                currentUserId={currentUserId}
                isFollowing={Boolean(followingByUserId[item.userId])}
                onPressLike={async (id) => {
                  const current = items.find((p) => p.id === id);
                  if (!current) return;
                  const willLike = !current.isLiked;
                  setItems((prev) =>
                    prev.map((p) =>
                      p.id === id
                        ? {
                            ...p,
                            isLiked: willLike,
                            likeCount: Math.max(
                              0,
                              (p.likeCount ?? 0) + (willLike ? 1 : -1),
                            ),
                          }
                        : p,
                    ),
                  );
                  try {
                    await (
                      willLike
                        ? likePost({ postId: id })
                        : unlikePost({ postId: id })
                    ).unwrap();
                  } catch {
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === id
                          ? {
                              ...p,
                              isLiked: current.isLiked,
                              likeCount: current.likeCount,
                              commentCount: current.commentCount,
                            }
                          : p,
                      ),
                    );
                  }
                }}
                onPressSave={async (id) => {
                  const current = items.find((p) => p.id === id);
                  if (!current) return;
                  const willSave = !current.isSaved;
                  setItems((prev) =>
                    prev.map((p) =>
                      p.id === id
                        ? {
                            ...p,
                            isSaved: willSave,
                          }
                        : p,
                    ),
                  );
                  try {
                    await (
                      willSave
                        ? savePost({ postId: id })
                        : unsavePost({ postId: id })
                    ).unwrap();
                  } catch {
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === id
                          ? {
                              ...p,
                              isSaved: current.isSaved,
                              likeCount: current.likeCount,
                              commentCount: current.commentCount,
                            }
                          : p,
                      ),
                    );
                  }
                }}
                onPressUser={(userId) => router.push(`/user-profile/${userId}`)}
                onPressComment={(id) =>
                  router.push({
                    pathname: "/post-comments",
                    params: { postId: id },
                  } as any)
                }
                onPressShare={(id) =>
                  router.push({
                    pathname: "/share",
                    params: { postId: id },
                  } as any)
                }
                onPressFollow={async (userId) => {
                  if (!currentUserId || userId === currentUserId) return;
                  const isFollowing = Boolean(followingByUserId[userId]);
                  const action = isFollowing ? unfollowUser : followUser;
                  try {
                    const res = await action({ userId }).unwrap();
                    setFollowingByUserId((prev) => ({
                      ...prev,
                      [userId]: res.isFollowing,
                    }));
                  } catch {
                    return;
                  }
                }}
                onPressMedia={(postId, index) =>
                  router.push({
                    pathname: "/media-viewer",
                    params: { postId, index: String(index) },
                  } as any)
                }
              />
            )
          }
          ListHeaderComponent={
            <ListHeader>
              <Header>
                <HeaderTitle>{t("home.title")}</HeaderTitle>
                <HeaderRight>
                  <HeaderIconButton onPress={() => router.push("/create-post")}>
                    <Feather
                      name="plus-square"
                      size={24}
                      color={colors.primaryText}
                    />
                  </HeaderIconButton>
                  <HeaderIconButton
                    onPress={() => router.push("/notifications")}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={24}
                      color={colors.primaryText}
                    />
                  </HeaderIconButton>
                  <HeaderIconButton onPress={() => router.push("/inbox")}>
                    <Ionicons
                      name="paper-plane-outline"
                      size={24}
                      color={colors.primaryText}
                    />
                  </HeaderIconButton>
                </HeaderRight>
              </Header>
              <StoriesContainer>
                <FlatList
                  data={stories}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/story-viewer",
                          params: { userId: item.userId },
                        } as any)
                      }
                      activeOpacity={0.85}
                    >
                      <StoryItem>
                        <StoryAvatarWrap
                          style={{
                            borderWidth: 2,
                            borderColor: item.isViewed
                              ? colors.tertiaryBackground
                              : colors.iosRed,
                          }}
                        >
                          <StoryAvatarInner>
                            <StoryAvatarImage
                              source={{ uri: item.avatar || undefined }}
                              resizeMode="cover"
                            />
                          </StoryAvatarInner>
                        </StoryAvatarWrap>
                        <StoryName numberOfLines={1}>{item.username}</StoryName>
                      </StoryItem>
                    </TouchableOpacity>
                  )}
                />
              </StoriesContainer>
            </ListHeader>
          }
          ListFooterComponent={
            loadingMore ? (
              <LoadingMore>
                <ActivityIndicator size="small" color={colors.primaryGreen} />
              </LoadingMore>
            ) : null
          }
          ListEmptyComponent={
            !initialLoading ? (
              <EmptyState>
                <Ionicons
                  name="image-outline"
                  size={40}
                  color={colors.secondaryText}
                />
                <EmptyText>
                  {isFeedError ? t("home.loadFailed") : t("home.empty")}
                </EmptyText>
                {isFeedError ? (
                  <HeaderIconButton onPress={() => refetch()}>
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color={colors.primaryText}
                    />
                  </HeaderIconButton>
                ) : null}
              </EmptyState>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing || initialLoading}
              onRefresh={async () => {
                setRefreshing(true);
                const res = await refetch();
                if ("data" in res && (res as any).data?.posts) {
                  setItems((res as any).data.posts);
                  setNextPageState((res as any).data.nextPageState);
                }
                setRefreshing(false);
              }}
              tintColor={colors.primaryGreen}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (loadingMore) return;
            if (!nextPageState) return;
            triggerMore({ limit: 8, pageState: nextPageState })
              .unwrap()
              .then((page) => {
                setNextPageState(page.nextPageState);
                setItems((prev) => unionBy(prev, page.posts ?? [], "id"));
              })
              .catch(() => {});
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged.current}
        />
      </Page>
    </SafeAreaView>
  );
};
