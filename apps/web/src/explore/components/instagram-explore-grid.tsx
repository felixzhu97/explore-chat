"use client";

import { Play, Heart, MessageCircle } from "lucide-react";
import type { FeedPost } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/shared/ui/instagram-spinner";

const EXPLORE_MAX_WIDTH = 963;

const GridRoot = styled.div`
  width: min(100%, ${EXPLORE_MAX_WIDTH}px);
  min-width: 0;
  min-height: 100%;
  margin-left: auto;
  margin-right: auto;
  align-self: center;
  padding: 0 clamp(12px, 4vw, 24px);
  box-sizing: border-box;
  background: rgb(255 255 255);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  width: 100%;
  max-width: 100%;
`;

const Cell = styled.button`
  position: relative;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  background: rgb(239 239 239);
  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px rgb(0 149 246);
  }
  &:focus:not(:focus-visible) {
    box-shadow: none;
  }
  &:hover .explore-hover-overlay {
    opacity: 1;
  }
`;

const HoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  background-color: rgb(0 0 0 / 0.45);
  color: rgb(255 255 255);
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
`;

const HoverStat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 1rem;
  font-weight: 600;
`;

const CellMedia = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CellVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
`;

const PlayBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  color: rgb(255 255 255);
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.6));
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: rgb(142 142 142);
  font-size: 14px;
  text-align: center;
  min-height: 240px;
`;

const ErrorState = styled.div`
  padding: 24px;
  color: rgb(185 28 28);
  font-size: 14px;
  text-align: center;
`;

interface InstagramExploreGridProps {
  posts: FeedPost[];
  loading: boolean;
  error: string | null;
  onPostClick: (post: FeedPost) => void;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function isVideoSrc(u: string): boolean {
  if (!u) return false;
  if (u.startsWith("data:")) return /^data:video\//i.test(u);
  return VIDEO_EXT.test(u);
}

function isVideo(post: FeedPost): boolean {
  return (
    post.type === "VIDEO" ||
    Boolean(post.videoUrl && isVideoSrc(post.videoUrl)) ||
    (post.mediaUrls?.some((u) => isVideoSrc(u)) ?? false)
  );
}

function formatCount(value: string): string {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("en-US");
}

function videoPosterSrc(post: FeedPost): string {
  const candidates = [post.coverUrl, post.coverImageUrl, post.imageUrl];
  for (const u of candidates) {
    if (u && !isVideoSrc(u)) return u;
  }
  return "";
}

function videoPlaybackSrc(post: FeedPost): string {
  if (post.videoUrl && isVideoSrc(post.videoUrl)) return post.videoUrl;
  const first = post.mediaUrls?.find((u) => u && isVideoSrc(u));
  if (first) return first;
  const fallback = post.imageUrl || "";
  return isVideoSrc(fallback) ? fallback : "";
}

function needsVideoElement(post: FeedPost): boolean {
  if (!isVideo(post)) return false;
  if (videoPosterSrc(post)) return false;
  return Boolean(videoPlaybackSrc(post));
}

export function InstagramExploreGrid({
  posts,
  loading,
  error,
  onPostClick,
}: InstagramExploreGridProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <GridRoot>
        <ErrorState>{error}</ErrorState>
      </GridRoot>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <GridRoot>
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <InstagramSpinnerWrap>
            <InstagramSpinnerRing />
            <InstagramSpinnerText>{t("feed.loading")}</InstagramSpinnerText>
          </InstagramSpinnerWrap>
        </div>
      </GridRoot>
    );
  }

  if (posts.length === 0) {
    return (
      <GridRoot>
        <EmptyState>{t("explore.empty")}</EmptyState>
      </GridRoot>
    );
  }

  return (
    <GridRoot>
      <Grid>
        {posts.map((post) => {
          const posterSrc = videoPosterSrc(post);
          const showVideo = needsVideoElement(post);
          const videoSrc = videoPlaybackSrc(post);
          const poster = posterSrc || undefined;
          const rawImg = posterSrc || post.coverImageUrl || post.imageUrl || "";
          const imgSrc = rawImg && !isVideoSrc(rawImg) ? rawImg : "";
          return (
            <Cell
              key={post.id}
              type="button"
              onClick={() => onPostClick(post)}
              aria-label={post.caption?.slice(0, 80) || post.username}
            >
              {showVideo && videoSrc ? (
                <CellVideo
                  src={videoSrc}
                  poster={poster}
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden
                />
              ) : imgSrc ? (
                <CellMedia src={imgSrc} alt="" loading="lazy" />
              ) : (
                <CellMedia
                  src="/placeholder.svg?height=400&width=400"
                  alt=""
                  loading="lazy"
                />
              )}
              {isVideo(post) && (
                <PlayBadge aria-hidden>
                  <Play size={22} fill="currentColor" strokeWidth={0} />
                </PlayBadge>
              )}
              <HoverOverlay className="explore-hover-overlay" aria-hidden>
                <HoverStat>
                  <Heart size={20} fill="currentColor" strokeWidth={0} />
                  {formatCount(post.likeCount)}
                </HoverStat>
                <HoverStat>
                  <MessageCircle
                    size={20}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  {formatCount(post.commentCount)}
                </HoverStat>
              </HoverOverlay>
            </Cell>
          );
        })}
      </Grid>
    </GridRoot>
  );
}
