"use client";

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  VolumeX,
  Music,
  Play,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import type { FeedPost } from "@/shared/types";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/shared/ui/instagram-spinner";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const RED_LIKE = "rgb(237 73 86)";
const REEL_SIDEBAR_WIDTH = 112;
const REEL_VIDEO_MAX_WIDTH = 590;
const REEL_VIDEO_VERTICAL_PADDING = 24;

const ReelsRoot = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: rgb(255 255 255);
  display: flex;
  justify-content: center;
  align-items: stretch;
`;

const ReelsCenterGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
  padding: ${REEL_VIDEO_VERTICAL_PADDING}px 0;
  box-sizing: border-box;
  gap: 0 12px;
`;

const ReelsScrollWrap = styled.div`
  width: ${REEL_VIDEO_MAX_WIDTH}px;
  max-width: 100%;
  flex-shrink: 0;
  height: 100%;
  background: rgb(0 0 0);
  position: relative;
  border-radius: 8px;
`;

const ReelsScroll = styled.div`
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const ReelCell = styled.section`
  height: 100%;
  min-height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const VideoWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0);
  cursor: pointer;
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const PlayButtonCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
`;

const VideoEl = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const VolumeBtn = styled.button`
  position: absolute;
  bottom: 24px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgb(0 0 0 / 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
`;

const ReelsRightSidebar = styled.aside`
  width: ${REEL_SIDEBAR_WIDTH}px;
  flex-shrink: 0;
  background: rgb(255 255 255);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 24px;
`;

const ReelsActionsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: auto;
`;

const NavArrowsWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 32px;
  padding-bottom: 32px;
`;

const NavArrow = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: rgb(239 239 239);
  color: ${TEXT_PRIMARY};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const RightAction = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 400;
`;

const RightIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BottomOverlay = styled.div`
  position: absolute;
  left: 16px;
  right: 56px;
  bottom: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
`;

const CreatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CreatorAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  flex-shrink: 0;
`;

const CreatorHandle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
`;

const FollowBtn = styled(Button)`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  background: rgb(0 0 0);
  color: white;
  border: none;
  border-radius: 8px;

  &:hover {
    background: rgb(38 38 38);
  }
`;

const AudioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255 255 255 / 0.95);
  font-size: 13px;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
`;

const CaptionText = styled.p`
  font-size: 14px;
  color: white;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
  margin: 0;
  line-height: 1.35;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  background: rgb(255 255 255);
  color: ${TEXT_SECONDARY};
  font-size: 16px;
  padding: 24px;
  text-align: center;
`;

const LoadingWrap = styled(InstagramSpinnerWrap)`
  padding: 24px;
  min-height: 200px;
`;

export interface InstagramReelsProps {
  reels: FeedPost[];
  loading?: boolean;
  onCommentClick?: (post: FeedPost) => void;
  onFollow?: (userId: string) => void;
  onLikeClick?: (post: FeedPost) => void;
  onSaveClick?: (post: FeedPost) => void;
  currentUserId?: string;
}

export function InstagramReels({
  reels,
  loading,
  onCommentClick,
  onFollow,
  onLikeClick,
  onSaveClick,
  currentUserId,
}: InstagramReelsProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPausedIndex, setUserPausedIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setUserPausedIndex(null);
  }, [activeIndex]);

  const handleVideoClick = useCallback(
    (index: number) => {
      if (index !== activeIndex) return;
      const video = videoRefs.current[index];
      if (!video) return;
      if (userPausedIndex === index) {
        video.play().catch(() => {});
        setUserPausedIndex(null);
      } else {
        video.pause();
        setUserPausedIndex(index);
      }
    },
    [activeIndex, userPausedIndex],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current || index < 0 || index >= reels.length) return;
      const el = scrollRef.current.children[index] as HTMLElement;
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setActiveIndex(index);
    },
    [reels.length],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const children = container.children;
      if (children.length === 0) return;
      const mid = container.scrollTop + container.clientHeight / 2;
      for (let i = 0; i < children.length; i++) {
        const el = children[i] as HTMLElement;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (mid >= top && mid < bottom) {
          setActiveIndex(i);
          break;
        }
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [reels.length]);

  useLayoutEffect(() => {
    for (let i = 0; i < reels.length; i++) {
      const video = videoRefs.current[i];
      if (!video) continue;
      if (i === activeIndex && userPausedIndex !== activeIndex) {
        const p = video.play();
        if (p && typeof p.then === "function") p.catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [activeIndex, reels.length, userPausedIndex]);

  if (loading) {
    return (
      <ReelsRoot>
        <LoadingWrap>
          <InstagramSpinnerRing $size={32} />
          <InstagramSpinnerText>{t("reels.loading")}</InstagramSpinnerText>
        </LoadingWrap>
      </ReelsRoot>
    );
  }

  if (reels.length === 0) {
    return (
      <ReelsRoot>
        <EmptyWrap>{t("reels.noReels")}</EmptyWrap>
      </ReelsRoot>
    );
  }

  const activePost = reels[activeIndex];

  return (
    <ReelsRoot>
      <ReelsCenterGroup>
        <ReelsScrollWrap>
          <ReelsScroll ref={scrollRef}>
            {reels.map((post, index) => (
              <ReelCell key={`reel-${post.id}-${index}`}>
                <VideoWrap onClick={() => handleVideoClick(index)}>
                  <VideoEl
                    ref={(el: HTMLVideoElement | null) => {
                      videoRefs.current[index] = el;
                    }}
                    src={post.videoUrl || post.imageUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="auto"
                    onCanPlay={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                      if (activeIndex === index && userPausedIndex !== index)
                        e.currentTarget.play().catch(() => {});
                    }}
                  />
                  {activeIndex === index && userPausedIndex === index && (
                    <PlayOverlay>
                      <PlayButtonCircle>
                        <Play size={36} fill="currentColor" stroke="none" />
                      </PlayButtonCircle>
                    </PlayOverlay>
                  )}
                </VideoWrap>
                <VolumeBtn type="button" aria-label={t("reels.muted")}>
                  <VolumeX size={22} />
                </VolumeBtn>
                <BottomOverlay>
                  <CreatorRow>
                    <CreatorAvatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>
                        {(post.username || "?")[0]}
                      </AvatarFallback>
                    </CreatorAvatar>
                    <CreatorHandle>@{post.username}</CreatorHandle>
                    {currentUserId && post.userId === currentUserId ? null : (
                      <FollowBtn
                        type="button"
                        size="sm"
                        onClick={() => onFollow?.(post.userId)}
                      >
                        {post.isFollowing
                          ? t("reels.unfollow")
                          : t("reels.follow")}
                      </FollowBtn>
                    )}
                  </CreatorRow>
                  <AudioRow>
                    <Music size={14} strokeWidth={2} />
                    <span>{t("reels.originalAudio")}</span>
                  </AudioRow>
                  {post.caption ? (
                    <CaptionText>{post.caption}</CaptionText>
                  ) : null}
                </BottomOverlay>
              </ReelCell>
            ))}
          </ReelsScroll>
        </ReelsScrollWrap>
        {reels.length > 0 ? (
          <ReelsRightSidebar>
            <NavArrowsWrap>
              <NavArrow
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex <= 0}
                aria-label="Previous"
              >
                <ChevronUp size={22} />
              </NavArrow>
              <NavArrow
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex >= reels.length - 1}
                aria-label="Next"
              >
                <ChevronDown size={22} />
              </NavArrow>
            </NavArrowsWrap>
            {activePost && (
              <ReelsActionsColumn>
                <RightAction
                  $active={activePost.isLiked}
                  onClick={() => onLikeClick?.(activePost)}
                >
                  <RightIcon>
                    <Heart
                      size={24}
                      fill={activePost.isLiked ? "currentColor" : "none"}
                      strokeWidth={1.5}
                      color={activePost.isLiked ? RED_LIKE : undefined}
                    />
                  </RightIcon>
                  <span>{activePost.likeCount || "0"}</span>
                </RightAction>
                <RightAction onClick={() => onCommentClick?.(activePost)}>
                  <RightIcon>
                    <MessageCircle size={24} strokeWidth={1.5} />
                  </RightIcon>
                  <span>{activePost.commentCount || "0"}</span>
                </RightAction>
                <RightAction>
                  <RightIcon>
                    <Send size={24} strokeWidth={1.5} />
                  </RightIcon>
                  <span>{t("feed.share")}</span>
                </RightAction>
                <RightAction
                  $active={activePost.isSaved}
                  onClick={() => onSaveClick?.(activePost)}
                >
                  <RightIcon>
                    <Bookmark
                      size={24}
                      fill={activePost.isSaved ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </RightIcon>
                  <span>{t("feed.save")}</span>
                </RightAction>
                <RightAction>
                  <RightIcon>
                    <MoreHorizontal size={24} strokeWidth={1.5} />
                  </RightIcon>
                  <span>{t("feed.more")}</span>
                </RightAction>
              </ReelsActionsColumn>
            )}
          </ReelsRightSidebar>
        ) : null}
      </ReelsCenterGroup>
    </ReelsRoot>
  );
}
