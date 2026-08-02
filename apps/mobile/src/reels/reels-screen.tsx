import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useScrollToTop } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { uniqBy } from "lodash";
import { VideoView, useVideoPlayer } from "expo-video";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import {
  useGetReelsFirstQuery,
  useLazyGetReelsMoreQuery,
  useLikePostMutation,
  useUnlikePostMutation,
} from "@/feed/feedApi";

const DEBUG_REELS = true;

const Page = styled.View`
  flex: 1;
  background-color: #000;
`;

const LoadingWrap = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ReelCard = styled.View<{ $h: number }>`
  width: 100%;
  height: ${(p) => p.$h}px;
  background-color: #000;
`;

const MediaFill = styled.View`
  flex: 1;
`;

const VideoPressable = styled.Pressable`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const MuteButton = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
`;

const BottomOverlay = styled.View<{ $bottomPadding: number }>`
  position: absolute;
  left: 0;
  right: 72px;
  bottom: 0;
  padding-horizontal: 14px;
  padding-top: 10px;
  padding-bottom: ${(p) => p.$bottomPadding}px;
`;

const BottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.Image`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.16);
`;

const UserName = styled.Text`
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-shadow-color: rgba(0, 0, 0, 0.55);
  text-shadow-offset: 0px 1px;
  text-shadow-radius: 3px;
`;

const UserMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const FollowButton = styled.Pressable`
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding-vertical: 4px;
  padding-horizontal: 12px;
`;

const FollowButtonText = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 600;
`;

const Caption = styled.Text`
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  margin-top: 6px;
  text-shadow-color: rgba(0, 0, 0, 0.45);
  text-shadow-offset: 0px 1px;
  text-shadow-radius: 3px;
`;

const ActionsColumn = styled.View`
  position: absolute;
  right: 8px;
  bottom: 96px;
  z-index: 5;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.Pressable`
  min-width: 52px;
  padding-vertical: 4px;
  padding-horizontal: 6px;
  align-items: center;
`;

const ActionCount = styled.Text`
  margin-top: 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-shadow-color: rgba(0, 0, 0, 0.55);
  text-shadow-offset: 0px 1px;
  text-shadow-radius: 3px;
`;

const MoreButton = styled.Pressable`
  min-width: 52px;
  padding-vertical: 4px;
  align-items: center;
`;

const ReelThumb = styled.Image`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.9);
`;

const EmptyText = styled.Text`
  margin-top: 12px;
  font-size: 14px;
  text-align: center;
  color: ${(p) =>
    (p.theme as { colors: { secondaryText: string } }).colors.secondaryText};
`;

const UnsupportedText = styled.Text`
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: center;
`;

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function isHttpVideoUrl(url: string) {
  return /^https?:\/\//i.test(url) && VIDEO_EXT_RE.test(url);
}

function getVideoKind(uri: string) {
  if (isHttpVideoUrl(uri)) return "http";
  return "other";
}

function formatCount(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.max(0, Math.trunc(value))}`;
}

function getShareCount(item: MobileFeedPost) {
  const candidate = (item as MobileFeedPost & { shareCount?: number })
    .shareCount;
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? Math.max(0, candidate)
    : null;
}

function getFollowMeta(item: MobileFeedPost) {
  const ext = item as MobileFeedPost & {
    isFollowing?: boolean;
    followLabel?: string;
  };
  const hasFollowing = typeof ext.isFollowing === "boolean";
  const hasLabel =
    typeof ext.followLabel === "string" && ext.followLabel.trim().length > 0;
  return {
    showFollow: hasFollowing || hasLabel,
    isFollowing: hasFollowing ? ext.isFollowing : false,
    followLabel: hasLabel ? ext.followLabel!.trim() : "",
  };
}

const ReelVideo: React.FC<{
  postId: string;
  uri: string;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  width: number;
  height: number;
  reelsRevision: number;
}> = ({
  postId,
  uri,
  isActive,
  muted,
  onToggleMute,
  width,
  height,
  reelsRevision,
}) => {
  if (uri.startsWith("data:")) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={32} color="#fff" />
        <UnsupportedText>该视频不支持</UnsupportedText>
      </View>
    );
  }

  if (!isHttpVideoUrl(uri)) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={32} color="#fff" />
        <UnsupportedText>该视频不支持</UnsupportedText>
      </View>
    );
  }

  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.muted = muted;
    p.pause();
  });

  useEffect(() => {
    if (DEBUG_REELS && isActive) {
      console.log("[ReelsVideo][native]", postId, { isActive, muted });
    }
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!DEBUG_REELS) return;
    console.log("[ReelsVideo][props]", postId, {
      isActive,
      muted,
      reelsRevision,
      videoKind: getVideoKind(uri),
    });
  }, [postId, uri, isActive, muted, reelsRevision]);

  useEffect(() => {
    if (!isActive) {
      if (DEBUG_REELS) {
        console.log("[ReelsVideo][pause]", postId, { isActive, muted });
      }
      player.pause();
      return;
    }
    if (DEBUG_REELS) {
      console.log("[ReelsVideo][play]", postId, { isActive, muted });
    }
    try {
      player.pause();
      const timeout = setTimeout(() => {
        try {
          const res: any = player.play();
          if (typeof res?.catch === "function") {
            res.catch((err: unknown) => {
              console.log("[ReelsVideo][play][error]", postId, err);
            });
          }
        } catch (err) {
          console.log("[ReelsVideo][play][throw]", postId, err);
        }
      }, 50);
      return () => clearTimeout(timeout);
    } catch (err) {
      console.log("[ReelsVideo][play][throw]", postId, err);
    }
  }, [isActive, player, muted, reelsRevision]);

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      <VideoPressable onPress={onToggleMute}>
        <VideoView
          style={{ width, height }}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
        <MuteButton pointerEvents="none">
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={24}
            color="#fff"
          />
        </MuteButton>
      </VideoPressable>
    </View>
  );
};

export const ReelsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: feedFirst,
    isFetching: isFetchingFirst,
    isError: isFeedError,
    refetch,
  } = useGetReelsFirstQuery({
    limit: 3,
  });
  const [triggerMore, moreResult] = useLazyGetReelsMoreQuery();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  const [items, setItems] = useState<MobileFeedPost[]>([]);
  const [nextPageState, setNextPageState] = useState<string | undefined>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const requestedMorePageStateRef = useRef<string | null>(null);
  const [reelsRevision, setReelsRevision] = useState(0);
  const scrollYRef = useRef(0);
  const pendingScrollRestoreRef = useRef(false);
  const [reelsViewportHeight, setReelsViewportHeight] = useState(0);

  const listRef = useRef<FlatList<MobileFeedPost> | null>(null);
  useScrollToTop(listRef);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const pageHeight = useMemo(
    () => Math.max(1, reelsViewportHeight || screenHeight),
    [reelsViewportHeight, screenHeight],
  );
  const onReelsViewportLayout = useCallback((e: LayoutChangeEvent) => {
    const nextHeight = Math.round(e.nativeEvent.layout.height);
    setReelsViewportHeight((prev) => (prev === nextHeight ? prev : nextHeight));
  }, []);

  useEffect(() => {
    if (!feedFirst?.posts) return;
    setItems(feedFirst.posts);
    setNextPageState(feedFirst.nextPageState);
    setActiveIndex(0);
    if (DEBUG_REELS) {
      const firstId = feedFirst.posts[0]?.id;
      console.log("[ReelsScreen][init]", {
        itemsLength: feedFirst.posts.length,
        activeIndex: 0,
        firstId,
      });
    }
  }, [feedFirst?.posts, feedFirst?.nextPageState]);

  const initialLoading = isFetchingFirst && items.length === 0;
  const loadingMore = moreResult.isFetching;

  const toggleLike = useCallback(
    async (postId: string) => {
      const current = items.find((p) => p.id === postId);
      if (!current) return;
      const willLike = !current.isLiked;
      const safeLikeCount =
        typeof current.likeCount === "number" &&
        !Number.isNaN(current.likeCount)
          ? current.likeCount
          : 0;

      setItems((prev) =>
        prev.map((p) =>
          p.id !== postId
            ? p
            : {
                ...p,
                isLiked: willLike,
                likeCount: Math.max(0, safeLikeCount + (willLike ? 1 : -1)),
              },
        ),
      );

      try {
        await (
          willLike ? likePost({ postId }) : unlikePost({ postId })
        ).unwrap();
      } catch {
        setItems((prev) =>
          prev.map((p) =>
            p.id !== postId
              ? p
              : {
                  ...p,
                  isLiked: current.isLiked,
                  likeCount: current.likeCount,
                  commentCount: current.commentCount,
                },
          ),
        );
      }
    },
    [items, likePost, unlikePost],
  );

  const loadMore = useCallback(
    async (pageStateToUse: string) => {
      if (loadingMore) return;
      if (DEBUG_REELS) {
        const activeId = items[activeIndex]?.id;
        console.log("[ReelsScreen][loadMore][before]", {
          activeIndex,
          activeId,
          pageStateToUse,
          itemsLength: items.length,
        });
      }
      await triggerMore({ limit: 3, pageState: pageStateToUse })
        .unwrap()
        .then((page) => {
          setNextPageState(page.nextPageState);
          const append = page.posts ?? [];
          setItems((prev) => {
            const next = uniqBy([...prev, ...append], (p) => p.id);
            if (DEBUG_REELS) {
              const id = next[activeIndex]?.id;
              console.log("[ReelsScreen][loadMore][after]", {
                appendCount: append.length,
                nextItemsLength: next.length,
                activeIndex,
                activeIdAfter: id,
              });
            }
            return next;
          });
          setReelsRevision((v) => v + 1);
          pendingScrollRestoreRef.current = true;
          if (DEBUG_REELS) {
            console.log("[ReelsScreen][loadMore][response]", {
              nextPageState: page.nextPageState,
              appendIds: append.map((p) => p.id).slice(0, 10),
            });
          }
        })
        .catch(() => {});
    },
    [loadingMore, triggerMore],
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y ?? 0;
      scrollYRef.current = y;
      const pageIndex = Math.round(y / pageHeight);
      if (Number.isNaN(pageIndex)) return;
      const bounded = Math.max(
        0,
        Math.min(pageIndex, Math.max(0, items.length - 1)),
      );
      if (DEBUG_REELS) {
        console.log("[ReelsScreen][scrollEnd]", {
          y,
          pageIndex,
          bounded,
          itemsLength: items.length,
        });
      }
      setActiveIndex(bounded);
    },
    [items.length, pageHeight],
  );

  useEffect(() => {
    if (!pendingScrollRestoreRef.current) return;
    if (loadingMore) return;
    const offset = scrollYRef.current ?? 0;
    const nextItemsLength = items.length;
    pendingScrollRestoreRef.current = false;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset, animated: false });
      const bounded = Math.max(
        0,
        Math.min(
          Math.round(offset / pageHeight),
          Math.max(0, nextItemsLength - 1),
        ),
      );
      setActiveIndex(bounded);
      if (DEBUG_REELS) {
        console.log("[ReelsScreen][scrollRestore]", {
          offset,
          bounded,
          itemsLength: nextItemsLength,
        });
      }
    });
  }, [items.length, loadingMore, pageHeight]);

  useEffect(() => {
    if (loadingMore) return;
    if (!nextPageState) return;
    if (items.length < 2) return;
    if (activeIndex !== items.length - 2) return;
    if (requestedMorePageStateRef.current === nextPageState) return;

    requestedMorePageStateRef.current = nextPageState;
    if (DEBUG_REELS) {
      const activeId = items[activeIndex]?.id;
      console.log("[ReelsScreen][loadMore][trigger]", {
        activeIndex,
        activeId,
        nextPageState,
        itemsLength: items.length,
      });
    }
    void loadMore(nextPageState);
  }, [activeIndex, items.length, loadMore, loadingMore, nextPageState]);

  useEffect(() => {
    if (!DEBUG_REELS) return;
    const activeId = items[activeIndex]?.id;
    console.log("[ReelsScreen][activeIndex]", {
      activeIndex,
      activeId,
      itemsLength: items.length,
    });
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (!DEBUG_REELS) return;
    if (!items.length) return;
    const active = items[activeIndex];
    const around: Array<{
      index: number;
      postId: string;
      isActive: boolean;
      videoKind: string;
    }> = [];
    for (const idx of [activeIndex - 1, activeIndex, activeIndex + 1]) {
      if (idx < 0 || idx >= items.length) continue;
      const p = items[idx];
      around.push({
        index: idx,
        postId: p.id,
        isActive: idx === activeIndex,
        videoKind: getVideoKind(p.videoUrl ?? ""),
      });
    }
    console.log("[ReelsScreen][localVideos]", {
      reelsRevision,
      itemsLength: items.length,
      activeIndex,
      activeId: active?.id,
      around,
    });
  }, [reelsRevision, items.length, activeIndex]);

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Page>
          <LoadingWrap>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
          </LoadingWrap>
        </Page>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <View style={{ flex: 1 }} onLayout={onReelsViewportLayout}>
          <FlatList
            ref={(r) => {
              listRef.current = r;
            }}
            data={items}
            keyExtractor={(item) => item.id}
            extraData={{ activeIndex, muted }}
            onScroll={(e) => {
              scrollYRef.current = e.nativeEvent.contentOffset.y ?? 0;
            }}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const isActive = index === activeIndex;
              const shareCount = getShareCount(item);
              const followMeta = getFollowMeta(item);
              return (
                <ReelCard $h={pageHeight}>
                  <MediaFill>
                    {item.videoUrl ? (
                      <ReelVideo
                        postId={item.id}
                        uri={item.videoUrl}
                        isActive={isActive}
                        muted={muted}
                        onToggleMute={() => setMuted((v) => !v)}
                        width={screenWidth}
                        height={pageHeight}
                        reelsRevision={reelsRevision}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.imageUrl || undefined }}
                        resizeMode="cover"
                        style={{ width: screenWidth, height: pageHeight }}
                      />
                    )}
                  </MediaFill>

                  <ActionsColumn>
                    <ActionButton onPress={() => toggleLike(item.id)}>
                      <Ionicons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={32}
                        color={item.isLiked ? colors.iosRed : "#fff"}
                      />
                      <ActionCount>
                        {formatCount(item.likeCount ?? 0)}
                      </ActionCount>
                    </ActionButton>
                    <ActionButton
                      onPress={() =>
                        router.push({
                          pathname: "/post-comments",
                          params: { postId: item.id },
                        } as any)
                      }
                    >
                      <Feather name="message-circle" size={30} color="#fff" />
                      <ActionCount>
                        {formatCount(item.commentCount ?? 0)}
                      </ActionCount>
                    </ActionButton>
                    <ActionButton
                      onPress={() =>
                        router.push({
                          pathname: "/share",
                          params: { postId: item.id },
                        } as any)
                      }
                    >
                      <Ionicons
                        name="paper-plane-outline"
                        size={30}
                        color="#fff"
                      />
                      {shareCount !== null ? (
                        <ActionCount>{formatCount(shareCount)}</ActionCount>
                      ) : null}
                    </ActionButton>
                    <MoreButton onPress={() => {}}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="#fff"
                      />
                    </MoreButton>
                    <ReelThumb
                      source={{
                        uri: item.coverImageUrl || item.imageUrl || undefined,
                      }}
                    />
                  </ActionsColumn>

                  <BottomOverlay $bottomPadding={insets.bottom + 4}>
                    <BottomRow>
                      <Pressable
                        onPress={() =>
                          router.push(`/user-profile/${item.userId}`)
                        }
                        hitSlop={8}
                      >
                        <Avatar source={{ uri: item.avatar || undefined }} />
                      </Pressable>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <UserMetaRow>
                          <UserName numberOfLines={1}>{item.username}</UserName>
                          {followMeta.showFollow ? (
                            <FollowButton onPress={() => {}}>
                              <FollowButtonText>
                                {followMeta.followLabel ||
                                  (followMeta.isFollowing
                                    ? t("profile.following")
                                    : t("common.follow"))}
                              </FollowButtonText>
                            </FollowButton>
                          ) : null}
                        </UserMetaRow>
                        {item.caption ? (
                          <Caption numberOfLines={2}>{item.caption}</Caption>
                        ) : null}
                      </View>
                    </BottomRow>
                  </BottomOverlay>
                </ReelCard>
              );
            }}
            pagingEnabled
            snapToInterval={pageHeight}
            decelerationRate="fast"
            snapToAlignment="start"
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="movie-open-outline"
                  size={64}
                  color={colors.secondaryText}
                />
                <EmptyText>
                  {isFeedError ? t("reels.loadFailed") : t("reels.empty")}
                </EmptyText>
                {isFeedError ? (
                  <Pressable
                    onPress={() => refetch()}
                    style={{
                      marginTop: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={22}
                      color={colors.primaryGreen}
                    />
                  </Pressable>
                ) : null}
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 16, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={colors.primaryGreen} />
                </View>
              ) : null
            }
            removeClippedSubviews
            initialNumToRender={2}
            windowSize={5}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
          />
        </View>
      </Page>
    </SafeAreaView>
  );
};
