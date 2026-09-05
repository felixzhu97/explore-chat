"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { StoryItem, FeedPost } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

const OverlayRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgb(26 26 26);
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  flex-shrink: 0;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StoryMeta = styled.span`
  font-size: 14px;
  color: rgb(255 255 255);
  font-weight: 500;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: rgb(255 255 255);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:hover {
    background: rgb(255 255 255 / 0.1);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MediaWrap = styled.div`
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0);
`;

const MediaImg = styled.img`
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  display: block;
`;

const MediaVideo = styled.video`
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  display: block;
`;

const NavZone = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "left" ? "left: 0" : "right: 0")};
  width: 33%;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 2;
`;

const NavArrowBtn = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 12px" : "right: 12px")};
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgb(0 0 0 / 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  &:hover {
    background: rgb(0 0 0 / 0.6);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const BottomBar = styled.footer`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  border-top: 1px solid rgb(255 255 255 / 0.08);
`;

const ReplyInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: rgb(255 255 255);
  font-size: 14px;
  outline: none;
  &::placeholder {
    color: rgb(255 255 255 / 0.5);
  }
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: rgb(255 255 255);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:hover {
    background: rgb(255 255 255 / 0.1);
  }
`;

const ProgressRow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  display: flex;
  gap: 4px;
  padding: 12px 16px 0;
  z-index: 4;
`;

const ProgressSegment = styled.div<{ $active?: boolean; $filled?: boolean }>`
  flex: 1;
  height: 100%;
  background: ${(p) =>
    p.$filled
      ? "rgb(255 255 255)"
      : p.$active
        ? "rgb(255 255 255 / 0.4)"
        : "rgb(255 255 255 / 0.2)"};
  border-radius: 2px;
  transition: background 0.15s ease;
`;

export interface StorySlide {
  story: StoryItem;
  post: FeedPost | null;
}

interface StoryOverlayProps {
  slides: StorySlide[];
  initialIndex: number;
  onClose: (viewedUserIds: string[]) => void;
}

function isVideoPost(post: FeedPost): boolean {
  return post.type === "VIDEO" && Boolean(post.videoUrl);
}

export function StoryOverlay({
  slides,
  initialIndex,
  onClose,
}: StoryOverlayProps) {
  const [index, setIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const slide = slides[index];
  const hasPrev = index > 0;
  const hasNext = index < slides.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) setIndex((i) => i - 1);
  }, [hasPrev]);

  const getViewedUserIds = useCallback(() => {
    return slides.slice(0, index + 1).map((s) => s.story.userId);
  }, [slides, index]);

  const handleClose = useCallback(() => {
    onClose(getViewedUserIds());
  }, [onClose, getViewedUserIds]);

  const goNext = useCallback(() => {
    if (hasNext) setIndex((i) => i + 1);
    else handleClose();
  }, [hasNext, handleClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, goPrev, goNext]);

  useEffect(() => {
    if (slide?.post && isVideoPost(slide.post) && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [index, slide?.post]);

  if (slides.length === 0) return null;

  const currentSlide = slide ?? slides[0];
  const post = currentSlide.post;
  const mediaUrl = post
    ? isVideoPost(post)
      ? post.videoUrl
      : (post.mediaUrls?.[0] ?? post.imageUrl)
    : null;
  const isVideo = post ? isVideoPost(post) : false;

  return (
    <OverlayRoot role="dialog" aria-modal="true" aria-label="Story">
      <ProgressRow>
        {slides.map((_, i) => (
          <ProgressSegment key={i} $active={i === index} $filled={i < index} />
        ))}
      </ProgressRow>
      <TopBar>
        <TopBarLeft>
          <Avatar style={{ width: 32, height: 32 }}>
            <AvatarImage src={currentSlide.story.avatar} />
            <AvatarFallback>{currentSlide.story.username[0]}</AvatarFallback>
          </Avatar>
          <StoryMeta>
            {currentSlide.story.username}
            {post?.timestamp ? ` · ${post.timestamp}` : ""}
          </StoryMeta>
        </TopBarLeft>
        <CloseBtn type="button" onClick={handleClose} aria-label="Close">
          <X size={24} />
        </CloseBtn>
      </TopBar>
      <ContentArea>
        <NavZone
          $side="left"
          type="button"
          onClick={goPrev}
          aria-label="Previous"
        />
        <NavZone
          $side="right"
          type="button"
          onClick={goNext}
          aria-label="Next"
        />
        <NavArrowBtn
          $side="left"
          type="button"
          onClick={goPrev}
          disabled={!hasPrev}
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </NavArrowBtn>
        <NavArrowBtn
          $side="right"
          type="button"
          onClick={goNext}
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </NavArrowBtn>
        <MediaWrap>
          {mediaUrl ? (
            isVideo ? (
              <MediaVideo
                ref={videoRef}
                src={mediaUrl}
                playsInline
                muted={false}
                loop={false}
                onEnded={goNext}
              />
            ) : (
              <MediaImg src={mediaUrl} alt="" />
            )
          ) : (
            <MediaImg
              src={currentSlide.story.avatar}
              alt=""
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
        </MediaWrap>
      </ContentArea>
      <BottomBar>
        <ReplyInput
          type="text"
          placeholder={`Reply to ${currentSlide.story.username}...`}
        />
        <IconBtn type="button" aria-label="Like">
          <Heart size={22} />
        </IconBtn>
        <IconBtn type="button" aria-label="Send">
          <Send size={22} />
        </IconBtn>
      </BottomBar>
    </OverlayRoot>
  );
}
