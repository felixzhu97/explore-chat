"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/shared/ui/instagram-spinner";
import type { StoryItem, FeedPost } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const RED_LIKE = "rgb(237 73 86)";
const BG_GRAY = "rgb(239 239 239)";

const FeedRoot = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 468px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  background: rgb(255 255 255);
`;

const StoriesWrap = styled.div`
  padding: 16px 0;
  margin-bottom: 8px;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const StoriesScroll = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 16px;
  min-width: min-content;
`;

const StoryItemWrap = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
`;

const StoryRing = styled.div<{ $hasUnseen?: boolean }>`
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 2px;
  background: ${(p: { $hasUnseen?: boolean }) =>
    p.$hasUnseen
      ? "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
      : "rgb(219 219 219)"};
`;

const StoryAvatarWrap = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgb(255 255 255);
  padding: 2px;
  box-sizing: border-box;
`;

const StoryUsername = styled.span`
  font-size: 12px;
  color: ${TEXT_PRIMARY};
  max-width: 74px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostCard = styled.article`
  margin-bottom: 18px;
  border: none;
  border-bottom: ${BORDER};
  border-radius: 0;
  overflow: visible;
  background: rgb(255 255 255);
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;
`;

const PostHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  border-radius: 9999px;
`;

const PostMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.2;
`;

const PostUsername = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
`;

const PostTime = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const SponsoredBadge = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const PostMoreBtn = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${TEXT_PRIMARY};
  margin: -8px -8px -8px 0;
`;

const PostImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 4 / 5;
  background: rgb(0 9 20);
  overflow: hidden;
  line-height: 0;
  position: relative;
`;

const PostImageWrapClickable = styled(PostImageWrap)`
  cursor: pointer;
`;

const PostImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const PostVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const PostMediaCarousel = styled.div`
  width: 100%;
  aspect-ratio: 4 / 5;
  background: rgb(0 9 20);
  position: relative;
  overflow: hidden;
`;

const PostMediaCarouselNav = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p: { $side: "left" | "right" }) =>
    p.$side === "left" ? "left: 8px" : "right: 8px"};
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255 255 255 / 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_PRIMARY};
  z-index: 1;
  &:hover {
    background: white;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const PostMediaDots = styled.div`
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 1;
`;

const PostMediaDot = styled.span<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p: { $active?: boolean }) =>
    p.$active ? "white" : "rgba(255 255 255 / 0.5)"};
`;

const FeedPlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const FeedPlayButtonCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px 6px;
  gap: 6px;
`;

const PostActionBtn = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  margin: 0;
  color: ${(p: { $active?: boolean }) => (p.$active ? RED_LIKE : TEXT_PRIMARY)};
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
`;

const PostActionRight = styled.div`
  margin-left: auto;
`;

const PostCaption = styled.div`
  padding: 0 16px 16px 16px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.25;
`;

const CaptionUsername = styled.span`
  font-weight: 600;
  margin-right: 4px;
`;

const CaptionMore = styled.button`
  margin-left: 6px;
  border: none;
  background: none;
  padding: 0;
  color: ${TEXT_SECONDARY};
  font-size: inherit;
  cursor: pointer;
`;

const FeedError = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: rgb(237 73 86);
`;

const FeedLoading = styled(InstagramSpinnerWrap)`
  padding: 24px 16px;
`;

const FEED_BOTTOM_HEIGHT = 72;

const FeedBottomSlot = styled.div`
  min-height: ${FEED_BOTTOM_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const FeedSentinelInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  pointer-events: none;
  visibility: hidden;
`;

const FeedNoMore = styled.div`
  min-height: ${FEED_BOTTOM_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: var(--ig-secondary-text, rgb(142, 142, 142));
  font-size: 14px;
  box-sizing: border-box;
`;

function isVideoUrl(url: string): boolean {
  if (url.startsWith("data:")) return url.startsWith("data:video/");
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || /video\//i.test(url);
}

function toCountText(value: string): string {
  const s = String(value ?? "").trim();
  if (!s) return "0";
  return s.replace(/\s*(likes?|comments?)$/i, "");
}

interface InstagramFeedProps {
  stories: StoryItem[];
  posts: FeedPost[];
  loading?: boolean;
  initialLoading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  currentUser?: { avatar?: string; username?: string } | null;
  onStoryClick?: (story: StoryItem) => void;
  onUserClick?: (userId: string) => void;
  onCommentClick?: (post: FeedPost) => void;
  onLikeClick?: (post: FeedPost) => void;
  onSaveClick?: (post: FeedPost) => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function InstagramFeed({
  stories,
  posts,
  loading,
  initialLoading = false,
  loadingMore = false,
  error,
  currentUser,
  onStoryClick,
  onUserClick,
  onCommentClick,
  onLikeClick,
  onSaveClick,
  scrollContainerRef,
  onLoadMore,
  hasMore = false,
}: InstagramFeedProps) {
  const { t } = useTranslation();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const loadingRef = useRef(loading);
  onLoadMoreRef.current = onLoadMore;
  loadingRef.current = loading;
  const [pausedPostId, setPausedPostId] = useState<string | null>(null);
  const [mediaIndexByPostId, setMediaIndexByPostId] = useState<
    Record<string, number>
  >({});
  const [expandedCaptionByPostId, setExpandedCaptionByPostId] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    const root = scrollContainerRef?.current ?? null;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current) return;
        const fn = onLoadMoreRef.current;
        if (fn) requestAnimationFrame(() => fn());
      },
      { root, rootMargin: "240px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, scrollContainerRef]);

  const setPostMediaIndex = useCallback((postId: string, index: number) => {
    setMediaIndexByPostId((prev) => ({ ...prev, [postId]: index }));
  }, []);

  const toggleFeedVideo = useCallback(
    (postId: string) => {
      const video = videoRefs.current[postId];
      if (!video) return;
      if (pausedPostId === postId) {
        video.play().catch(() => {});
        setPausedPostId(null);
      } else {
        video.pause();
        setPausedPostId(postId);
      }
    },
    [pausedPostId],
  );

  return (
    <FeedRoot>
      {error && <FeedError>{error}</FeedError>}
      {initialLoading && (
        <FeedLoading>
          <InstagramSpinnerRing $size={28} />
          <InstagramSpinnerText>{t("feed.loading")}</InstagramSpinnerText>
        </FeedLoading>
      )}
      <StoriesWrap>
        <StoriesScroll>
          {stories.map((s, i) => (
            <StoryItemWrap
              key={`story-${s.id}-${i}`}
              type="button"
              onClick={() => onStoryClick?.(s)}
            >
              <StoryRing $hasUnseen={s.hasUnseen}>
                <StoryAvatarWrap>
                  <Avatar
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                  >
                    <AvatarImage src={s.avatar} />
                    <AvatarFallback>{s.username[0]}</AvatarFallback>
                  </Avatar>
                </StoryAvatarWrap>
              </StoryRing>
              <StoryUsername>{s.username}</StoryUsername>
            </StoryItemWrap>
          ))}
        </StoriesScroll>
      </StoriesWrap>

      {posts.map((post, i) => (
        <PostCard key={`post-${post.id}-${i}`}>
          <PostHeader>
            <PostHeaderLeft>
              <UserAvatarButton
                type="button"
                aria-label={`Open profile ${post.username}`}
                onClick={() => onUserClick?.(post.userId)}
              >
                <Avatar style={{ width: 32, height: 32 }}>
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback>
                    {(post.username || post.userId).slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </UserAvatarButton>
              <PostMeta>
                <PostUsername>{post.username}</PostUsername>
                <PostTime>
                  {post.timestamp}
                  {post.isSponsored && " · "}
                  {post.isSponsored && <SponsoredBadge>赞助</SponsoredBadge>}
                </PostTime>
              </PostMeta>
            </PostHeaderLeft>
            <PostMoreBtn>
              <MoreHorizontal size={20} />
            </PostMoreBtn>
          </PostHeader>
          {(() => {
            const urls = post.mediaUrls?.length
              ? post.mediaUrls
              : [post.imageUrl];
            const multi = urls.length > 1;
            const idx = multi ? (mediaIndexByPostId[post.id] ?? 0) : 0;
            const currentUrl = urls[idx] ?? post.imageUrl;
            const isVideo = isVideoUrl(currentUrl);

            if (multi) {
              return (
                <PostMediaCarousel>
                  <PostMediaCarouselNav
                    type="button"
                    $side="left"
                    disabled={idx <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostMediaIndex(post.id, Math.max(0, idx - 1));
                    }}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                  </PostMediaCarouselNav>
                  {isVideo ? (
                    <PostImageWrapClickable
                      onClick={() => onCommentClick?.(post)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        toggleFeedVideo(post.id);
                      }}
                    >
                      <PostVideo
                        ref={(el: HTMLVideoElement | null) => {
                          videoRefs.current[post.id] = el;
                        }}
                        src={currentUrl}
                        muted
                        playsInline
                        autoPlay
                        loop
                      />
                      {pausedPostId === post.id && (
                        <FeedPlayOverlay>
                          <FeedPlayButtonCircle>
                            <Play size={32} fill="currentColor" stroke="none" />
                          </FeedPlayButtonCircle>
                        </FeedPlayOverlay>
                      )}
                    </PostImageWrapClickable>
                  ) : (
                    <PostImageWrap>
                      <PostImg src={currentUrl} alt="" />
                    </PostImageWrap>
                  )}
                  <PostMediaCarouselNav
                    type="button"
                    $side="right"
                    disabled={idx >= urls.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostMediaIndex(
                        post.id,
                        Math.min(urls.length - 1, idx + 1),
                      );
                    }}
                    aria-label="Next"
                  >
                    <ChevronRight size={20} />
                  </PostMediaCarouselNav>
                  <PostMediaDots>
                    {urls.map((_, i) => (
                      <PostMediaDot key={i} $active={i === idx} />
                    ))}
                  </PostMediaDots>
                </PostMediaCarousel>
              );
            }

            if (post.type === "VIDEO" || post.videoUrl) {
              return (
                <PostImageWrapClickable
                  onClick={() => onCommentClick?.(post)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    toggleFeedVideo(post.id);
                  }}
                >
                  <PostVideo
                    ref={(el: HTMLVideoElement | null) => {
                      videoRefs.current[post.id] = el;
                    }}
                    src={post.videoUrl ?? post.imageUrl}
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                  {pausedPostId === post.id && (
                    <FeedPlayOverlay>
                      <FeedPlayButtonCircle>
                        <Play size={32} fill="currentColor" stroke="none" />
                      </FeedPlayButtonCircle>
                    </FeedPlayOverlay>
                  )}
                </PostImageWrapClickable>
              );
            }
            return (
              <PostImageWrap>
                <PostImg src={post.imageUrl} alt="" />
              </PostImageWrap>
            );
          })()}
          <PostActions>
            <PostActionBtn
              $active={post.isLiked}
              onClick={() => onLikeClick?.(post)}
            >
              <Heart
                size={24}
                fill={post.isLiked ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
              <span>{toCountText(post.likeCount)}</span>
            </PostActionBtn>
            <PostActionBtn onClick={() => onCommentClick?.(post)}>
              <MessageCircle size={24} strokeWidth={1.5} />
              <span>{toCountText(post.commentCount)}</span>
            </PostActionBtn>
            <PostActionBtn>
              <Send size={24} strokeWidth={1.5} />
            </PostActionBtn>
            <PostActionRight>
              <PostActionBtn
                $active={post.isSaved}
                onClick={() => onSaveClick?.(post)}
              >
                <Bookmark
                  size={24}
                  fill={post.isSaved ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              </PostActionBtn>
            </PostActionRight>
          </PostActions>
          <PostCaption>
            <CaptionUsername>{post.username}</CaptionUsername>
            {(() => {
              const full = post.caption ?? "";
              const expanded = Boolean(expandedCaptionByPostId[post.id]);
              const shouldTrim = full.length > 120;
              const shown =
                expanded || !shouldTrim ? full : `${full.slice(0, 120)}...`;
              return (
                <>
                  {shown}
                  {shouldTrim && !expanded && (
                    <CaptionMore
                      type="button"
                      onClick={() =>
                        setExpandedCaptionByPostId((prev) => ({
                          ...prev,
                          [post.id]: true,
                        }))
                      }
                    >
                      more
                    </CaptionMore>
                  )}
                </>
              );
            })()}
          </PostCaption>
        </PostCard>
      ))}
      {hasMore && (
        <FeedBottomSlot>
          <FeedSentinelInner ref={sentinelRef} aria-hidden />
          {loadingMore && <InstagramSpinnerRing $size={20} />}
        </FeedBottomSlot>
      )}
      {!hasMore && posts.length > 0 && (
        <FeedNoMore>{t("feed.noMoreContent")}</FeedNoMore>
      )}
    </FeedRoot>
  );
}
