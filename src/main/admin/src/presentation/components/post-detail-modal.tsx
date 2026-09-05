"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Play, X, Heart, MessageCircle, Bookmark } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ModalBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 90vw;
  max-width: 936px;
  height: 85vh;
  max-height: 800px;
  background: rgb(255 255 255);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
`;

const MediaSection = styled.div`
  flex: 1;
  min-width: 0;
  background: rgb(0 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MediaSectionRelative = styled(MediaSection)`
  position: relative;
`;

const MediaSectionClickable = styled(MediaSection)`
  cursor: pointer;
`;

const MediaImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const MediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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

const PlayCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(38 38 38);
`;

const CarouselNav = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 12px" : "right: 12px")};
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_PRIMARY};
  z-index: 2;
  &:hover {
    background: #fff;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const CarouselDots = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 2;
`;

const CarouselDot = styled.span<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#fff" : "rgba(255, 255, 255, 0.5)")};
`;

const RightSection = styled.div`
  width: 400px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  border-left: ${BORDER};
  overflow: hidden;
`;

const PostHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  padding-right: 48px;
  border-bottom: ${BORDER};
  flex-shrink: 0;
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostHeaderMeta = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${TEXT_PRIMARY};
  z-index: 1;
  font-size: 24px;
  line-height: 1;
`;

const CaptionBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.25;
  flex-shrink: 0;
  border-bottom: ${BORDER};
  max-height: 120px;
  overflow-y: auto;
`;

const CaptionMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const CaptionUsername = styled.span`
  font-weight: 600;
  margin-right: 6px;
`;

const LikesRow = styled.div`
  padding: 0 16px 2px;
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
  flex-shrink: 0;
`;

const TimeRow = styled.div`
  padding: 0 16px 12px;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  flex-shrink: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px 6px;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: ${BORDER};
`;

const ActionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_PRIMARY};
`;

const LoadingCommentText = styled.div`
  padding: 16px;
  color: ${TEXT_SECONDARY};
  font-size: 14px;
`;

const EmptyMedia = styled.div`
  color: #888;
  padding: 24px;
`;

const HeaderRelative = styled(PostHeaderRow)`
  position: relative;
`;

const CommentList = styled.div`
  flex: 1;
  min-height: 120px;
  overflow: auto;
  padding: 8px 0;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgb(219 219 219);
    border-radius: 3px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  line-height: 1.25;
`;

const CommentMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommentTop = styled.div`
  margin-bottom: 2px;
`;

const CommentUsername = styled.span`
  font-weight: 600;
  margin-right: 6px;
`;

const CommentContent = styled.span`
  font-weight: 400;
  word-break: break-word;
`;

const CommentMeta = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  margin-top: 4px;
`;

const AdminActionsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: ${BORDER};
  flex-shrink: 0;
`;

const AdminBtn = styled.button`
  padding: 0.5rem 1rem;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgb(219 219 219);
  background: #fff;
  color: ${TEXT_PRIMARY};
  &:hover:not(:disabled) {
    background: rgb(239 239 239);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AdminBtnDanger = styled(AdminBtn)`
  border-color: #dc2626;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
  &:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.15);
  }
`;

const ActionError = styled.div`
  padding: 0 16px 8px;
  font-size: 13px;
  color: #dc2626;
`;

export interface PostRowForModal {
  postId: string;
  userId: string;
  type?: string;
  caption?: string;
  mediaUrls?: string[];
  createdAt?: string;
  hidden?: boolean;
}

export interface PostDetailForModal {
  post: Record<string, unknown>;
  engagement: { likeCount: number; commentCount: number; saveCount: number };
  comments: Array<{ id: string; userId: string; content: string; parentId?: string; createdAt: string }>;
}

const isValidMediaUrl = (s: string) =>
  typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:"));
const isVideoUrl = (s: string) =>
  /\.(mp4|webm|mov)(\?|$)/i.test(s) || /^data:video\//i.test(s);

export interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  postId: string | null;
  initialPost: PostRowForModal | null;
  fetchDetail: (postId: string) => Promise<PostDetailForModal | null>;
  onHide?: (postId: string) => void;
  onUnhide?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onRecheckModeration?: (postId: string) => void;
  actionLoading?: boolean;
  actionError?: string | null;
  showAdminActions?: boolean;
}

export function PostDetailModal({
  open,
  onClose,
  postId,
  initialPost,
  fetchDetail,
  onHide,
  onUnhide,
  onDelete,
  onRecheckModeration,
  actionLoading = false,
  actionError = null,
  showAdminActions = true,
}: PostDetailModalProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [detail, setDetail] = useState<PostDetailForModal | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [videoPaused, setVideoPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open || !postId) {
      setDetail(null);
      setMediaIndex(0);
      setVideoPaused(false);
      return;
    }
    setMediaIndex(0);
    setVideoPaused(false);
    setLoading(true);
    setDetail(null);
    fetchDetail(postId)
      .then((d) => d && setDetail(d))
      .finally(() => setLoading(false));
  }, [open, postId, fetchDetail]);

  const toggleVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (videoPaused) {
      el.play().catch(() => {});
      setVideoPaused(false);
    } else {
      el.pause();
      setVideoPaused(true);
    }
  }, [videoPaused]);

  if (!open) return null;

  const post = initialPost;
  const urls = post?.mediaUrls?.filter(isValidMediaUrl) ?? [];
  const multi = urls.length > 1;
  const idx = multi ? mediaIndex : 0;
  const currentUrl = urls[idx];
  const isVideo = currentUrl ? isVideoUrl(currentUrl) : false;
  const engagement = detail?.engagement;
  const comments = detail?.comments ?? [];
  const createdAt = post?.createdAt ?? detail?.post?.createdAt;
  const createdTime =
    typeof createdAt === "string"
      ? format(new Date(createdAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })
      : "";

  return (
    <Overlay onClick={onClose} role="presentation">
      <ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <MediaSectionRelative>
          {urls.length > 0 ? (
            <>
              {multi && (
                <>
                  <CarouselNav
                    type="button"
                    $side="left"
                    disabled={idx <= 0}
                    onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={24} />
                  </CarouselNav>
                  <CarouselNav
                    type="button"
                    $side="right"
                    disabled={idx >= urls.length - 1}
                    onClick={() => setMediaIndex((i) => Math.min(urls.length - 1, i + 1))}
                    aria-label="Next"
                  >
                    <ChevronRight size={24} />
                  </CarouselNav>
                  <CarouselDots>
                    {urls.map((_, i) => (
                      <CarouselDot key={i} $active={i === idx} />
                    ))}
                  </CarouselDots>
                </>
              )}
              {isVideo ? (
                <MediaSectionClickable onClick={toggleVideo}>
                  <MediaVideo
                    ref={videoRef}
                    src={currentUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onPause={() => setVideoPaused(true)}
                    onPlay={() => setVideoPaused(false)}
                  />
                  {videoPaused && (
                    <PlayOverlay>
                      <PlayCircle>
                        <Play size={36} fill="currentColor" stroke="none" />
                      </PlayCircle>
                    </PlayOverlay>
                  )}
                </MediaSectionClickable>
              ) : (
                <MediaSection>
                  <MediaImg src={currentUrl} alt="" />
                </MediaSection>
              )}
            </>
          ) : (
            <EmptyMedia>{t("posts.media")}</EmptyMedia>
          )}
        </MediaSectionRelative>
        <RightSection>
          <HeaderRelative>
            <PostHeaderLeft>
              <PostHeaderMeta>{post?.userId ?? "—"}</PostHeaderMeta>
            </PostHeaderLeft>
            <CloseBtn type="button" onClick={onClose} aria-label="Close">
              <X size={24} />
            </CloseBtn>
          </HeaderRelative>
          {post?.caption != null && String(post.caption).trim() !== "" && (
            <CaptionBlock>
              <CaptionMain>
                <div>
                  <CaptionUsername>{post.userId}</CaptionUsername>
                  {post.caption}
                </div>
              </CaptionMain>
            </CaptionBlock>
          )}
          <ActionsRow>
            <ActionIcon>
              <Heart size={24} />
            </ActionIcon>
            <ActionIcon>
              <MessageCircle size={24} />
            </ActionIcon>
            <ActionIcon>
              <Bookmark size={24} />
            </ActionIcon>
          </ActionsRow>
          <LikesRow>
            {loading
              ? "…"
              : engagement != null
                ? `${t("posts.likes")} ${engagement.likeCount} · ${t("posts.comments")} ${engagement.commentCount} · ${t("posts.saves")} ${engagement.saveCount}`
                : "—"}
          </LikesRow>
          <TimeRow>{createdTime || "—"}</TimeRow>
          <CommentList>
            {loading && <LoadingCommentText>…</LoadingCommentText>}
            {!loading &&
              comments.map((c, i) => (
                <CommentItem key={c.id || `${i}`}>
                  <CommentMain>
                    <CommentTop>
                      <CommentUsername>{c.userId}</CommentUsername>
                      <CommentContent>{c.content}</CommentContent>
                    </CommentTop>
                    <CommentMeta>
                      {format(new Date(c.createdAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })}
                    </CommentMeta>
                  </CommentMain>
                </CommentItem>
              ))}
          </CommentList>
          {actionError && <ActionError>{actionError}</ActionError>}
          {showAdminActions && postId && (
            <AdminActionsBar>
              {onRecheckModeration && (
                <AdminBtn
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onRecheckModeration(postId)}
                >
                  {t("posts.recheckModeration")}
                </AdminBtn>
              )}
              {post?.hidden ? (
                onUnhide && (
                  <AdminBtn type="button" disabled={actionLoading} onClick={() => onUnhide(postId)}>
                    {t("posts.unhidePost")}
                  </AdminBtn>
                )
              ) : (
                onHide && (
                  <AdminBtn type="button" disabled={actionLoading} onClick={() => onHide(postId)}>
                    {t("posts.hidePost")}
                  </AdminBtn>
                )
              )}
              {onDelete && (
                <AdminBtnDanger
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onDelete(postId)}
                >
                  {t("posts.deletePost")}
                </AdminBtnDanger>
              )}
            </AdminActionsBar>
          )}
        </RightSection>
      </ModalBox>
    </Overlay>
  );
}
