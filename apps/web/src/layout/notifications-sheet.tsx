"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Sheet } from "@/shared/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import type { SuggestedUser } from "@/shared/types";
import type { RootState, AppDispatch } from "@/core/store/store";
import {
  fetchNotifications,
  loadMoreNotifications,
  prependNotification,
} from "@/core/store/slices/notificationsSlice";
import { getWebSocketAdapter } from "@/core/websocket/websocket";
import type { NotificationItemRes } from "@/feed/feed.api";

const SheetPortal = SheetPrimitive.Portal;
const NotificationsSheetContent = styled(SheetPrimitive.Content)`
  position: fixed;
  z-index: 50;
  top: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 75%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 0;
  background-color: rgb(255 255 255);
  border-right: 1px solid rgb(239 239 239);
  box-shadow: 4px 0 24px rgb(0 0 0 / 0.08);
`;
const HiddenDescription = styled(SheetPrimitive.Description)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const CloseBtn = styled(SheetPrimitive.Close)`
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem;
  color: rgb(38 38 38);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  gap: 0;
  background-color: rgb(255 255 255);
`;

const SheetHeader = styled.div`
  padding: 1rem 2.5rem 0.75rem 1rem;
  border-bottom: 1px solid rgb(239 239 239);
  flex-shrink: 0;
`;

const A11yTitle = styled(SheetPrimitive.Title)`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(38 38 38);
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const SectionTitle = styled.div`
  padding: 1rem 1rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 96px;
  height: 96px;
  border: 2px solid rgb(38 38 38);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: rgb(38 38 38);
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: rgb(142 142 142);
  line-height: 1.4;
  max-width: 280px;
`;

const ActivityList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ActivityRow = styled.li<{ $unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: ${(p) => (p.$unread ? "rgb(250 250 250)" : "transparent")};
  border-bottom: 1px solid rgb(250 250 250);
`;

const ActivityText = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  color: rgb(38 38 38);
  line-height: 1.35;
`;

const FollowBtn = styled.button`
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 8px;
  background-color: rgb(0 149 246);
  color: rgb(255 255 255);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: rgb(0 119 197);
  }
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0 1rem;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
`;

const SuggestionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionUsername = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const SuggestionMeta = styled.div`
  font-size: 0.75rem;
  color: rgb(142 142 142);
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

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: SuggestedUser[];
  onFollow?: (userId: string) => void;
  onUserClick?: (userId: string) => void;
}

function isNotificationItem(payload: unknown): payload is NotificationItemRes {
  if (!payload || typeof payload !== "object") return false;
  const o = payload as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.actorId === "string" &&
    typeof o.postId === "string" &&
    (o.type === "like" || o.type === "comment")
  );
}

export function NotificationsSheet({
  open,
  onOpenChange,
  suggestions,
  onFollow,
  onUserClick,
}: NotificationsSheetProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.notifications.items);
  const nextCursor = useSelector((s: RootState) => s.notifications.nextCursor);
  const loading = useSelector((s: RootState) => s.notifications.loading);
  const loadingMore = useSelector(
    (s: RootState) => s.notifications.loadingMore,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSent = useRef(false);

  useEffect(() => {
    if (!open) return;
    dispatch(fetchNotifications({ limit: 20 }));
  }, [open, dispatch]);

  useEffect(() => {
    const ws = getWebSocketAdapter();
    const handler = (payload: unknown) => {
      if (isNotificationItem(payload)) dispatch(prependNotification(payload));
    };
    ws.on("notification:new", handler);
    return () => ws.off("notification:new", handler);
  }, [dispatch]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !nextCursor || loadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 80) {
      if (loadMoreSent.current) return;
      loadMoreSent.current = true;
      dispatch(loadMoreNotifications({ limit: 20 })).finally(() => {
        loadMoreSent.current = false;
      });
    }
  }, [nextCursor, loadingMore, dispatch]);

  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <NotificationsSheetContent>
          <HiddenDescription>
            {t("notifications.activityEmpty")}
          </HiddenDescription>
          <CloseBtn type="button">
            <X size={18} />
            <span className="sr-only">Close</span>
          </CloseBtn>
          <SheetInner>
            <SheetHeader>
              <A11yTitle>{t("nav.notifications")}</A11yTitle>
            </SheetHeader>
            <ScrollArea ref={scrollRef} onScroll={onScroll}>
              <SectionTitle>{t("notifications.activityTitle")}</SectionTitle>
              {loading && items.length === 0 ? (
                <EmptyWrap>
                  <EmptyText>{t("feed.loading")}</EmptyText>
                </EmptyWrap>
              ) : items.length === 0 ? (
                <EmptyWrap>
                  <EmptyIcon>
                    <Heart size={40} strokeWidth={1.2} />
                  </EmptyIcon>
                  <EmptyText>{t("notifications.activityEmpty")}</EmptyText>
                </EmptyWrap>
              ) : (
                <ActivityList>
                  {items.map((n, i) => (
                    <ActivityRow
                      key={`activity-${n.id}-${i}`}
                      $unread={!n.readAt}
                    >
                      <UserAvatarButton
                        type="button"
                        aria-label={`Open profile ${n.actorId}`}
                        onClick={() => onUserClick?.(n.actorId)}
                      >
                        <Avatar style={{ width: 32, height: 32 }}>
                          <AvatarImage src={undefined} />
                          <AvatarFallback>
                            {n.actorId.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      </UserAvatarButton>
                      <ActivityText>
                        {n.type === "like"
                          ? t("notifications.likedYourPost")
                          : t("notifications.commentedOnPost")}
                        {n.contentPreview ? ` "${n.contentPreview}"` : ""}
                      </ActivityText>
                    </ActivityRow>
                  ))}
                </ActivityList>
              )}
              {loadingMore && (
                <EmptyWrap>
                  <EmptyText>{t("feed.loading")}</EmptyText>
                </EmptyWrap>
              )}
              <SectionTitle>{t("notifications.suggestedTitle")}</SectionTitle>
              <SuggestionList>
                {suggestions.map((u, i) => (
                  <SuggestionItem key={`notif-suggestion-${u.id}-${i}`}>
                    <UserAvatarButton
                      type="button"
                      aria-label={`Open profile ${u.username ?? u.id}`}
                      onClick={() => onUserClick?.(u.id)}
                    >
                      <Avatar style={{ width: 32, height: 32 }}>
                        <AvatarImage src={u.avatar ?? undefined} />
                        <AvatarFallback>
                          {u.username?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </UserAvatarButton>
                    <SuggestionInfo>
                      <SuggestionUsername>{u.username}</SuggestionUsername>
                      <SuggestionMeta>
                        {u.description ?? t("notifications.suggestedForYou")}
                      </SuggestionMeta>
                    </SuggestionInfo>
                    {onFollow && (
                      <FollowBtn type="button" onClick={() => onFollow(u.id)}>
                        {t("sidebar.follow")}
                      </FollowBtn>
                    )}
                  </SuggestionItem>
                ))}
              </SuggestionList>
            </ScrollArea>
          </SheetInner>
        </NotificationsSheetContent>
      </SheetPortal>
    </Sheet>
  );
}
