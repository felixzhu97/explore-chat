"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import type {
  IFollowListService,
  FollowListItem,
} from "@/ai/components/dialog-services.types";

function useFollowingState(
  list: Array<{ id: string; isFollowing?: boolean }>,
): [Set<string>, (id: string, following: boolean) => void] {
  const [followingIds, setFollowingIds] = useState<Set<string>>(
    () => new Set(list.filter((u) => u.isFollowing === true).map((u) => u.id)),
  );
  useEffect(() => {
    setFollowingIds(
      new Set(list.filter((u) => u.isFollowing === true).map((u) => u.id)),
    );
  }, [list]);
  const setFollowing = useCallback((id: string, following: boolean) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (following) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  return [followingIds, setFollowing];
}

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: rgb(239 239 239);
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 0.875rem;
  outline: none;
  color: rgb(38 38 38);
  &::placeholder {
    color: rgb(142 142 142);
  }
`;

const ListWrap = styled.div`
  flex: 1;
  min-height: 200px;
  max-height: 50vh;
  overflow-y: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgb(219 219 219);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const BtnFollow = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(0 149 246);
  cursor: pointer;
  &:hover {
    color: rgb(0 119 197);
  }
`;

const BtnFollowing = styled.button`
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgb(219 219 219);
  background: rgb(239 239 239);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(38 38 38);
  cursor: pointer;
  &:hover {
    background: rgb(219 219 219);
  }
`;

const BtnRemove = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(142 142 142);
  cursor: pointer;
  &:hover {
    color: rgb(38 38 38);
  }
`;

const UserAvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
`;

export interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  title: "followers" | "following";
  userId: string;
  currentUserId: string | undefined;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  followListService: IFollowListService;
  onUserClick?: (userId: string) => void;
}

export function FollowListModal({
  open,
  onClose,
  title,
  userId,
  currentUserId,
  onFollow,
  onUnfollow,
  followListService,
  onUserClick,
}: FollowListModalProps) {
  const { t } = useTranslation();
  const [list, setList] = useState<FollowListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageState, setPageState] = useState<string | undefined>();
  const [followingIds, setFollowing] = useFollowingState(list);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listWrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    (append: boolean = false) => {
      if (!userId) return;
      const nextPageState = append ? pageState : undefined;
      if (append && !nextPageState) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      const promise =
        title === "followers"
          ? followListService.getFollowers(userId, 20, nextPageState)
          : followListService.getFollowing(userId, 20, nextPageState);
      promise
        .then((res) => {
          if (append) {
            setList((prev) => [...prev, ...res.list]);
          } else {
            setList(res.list);
          }
          setPageState(res.pageState);
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [userId, title, followListService, pageState],
  );

  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    if (userId) {
      setList([]);
      setPageState(undefined);
      loadRef.current(false);
    }
  }, [open, userId, title, followListService]);

  useEffect(() => {
    if (!open || search.trim()) return;
    const root = listWrapRef.current;
    const el = sentinelRef.current;
    if (!root || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loading || loadingMore || !pageState)
          return;
        load(true);
      },
      { root, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, search, loading, loadingMore, pageState, load]);

  const handleFollow = useCallback(
    (id: string) => {
      setFollowing(id, true);
      setList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isFollowing: true } : u)),
      );
      onFollow?.(id);
    },
    [onFollow, setFollowing],
  );

  const handleUnfollow = useCallback(
    (id: string) => {
      setFollowing(id, false);
      setList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isFollowing: false } : u)),
      );
      onUnfollow?.(id);
    },
    [onUnfollow, setFollowing],
  );

  const filtered = search.trim()
    ? list.filter((u) =>
        u.username.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : list;

  const titleKey =
    title === "followers" ? "profile.followersTitle" : "profile.followingTitle";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent accessibleTitle={t(titleKey)}>
        <DialogHeader>
          <DialogTitle style={{ textAlign: "center" }}>
            {t(titleKey)}
          </DialogTitle>
        </DialogHeader>
        <SearchWrap>
          <Search size={16} color="rgb(142 142 142)" />
          <SearchInput
            type="text"
            placeholder={t("profile.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        <ListWrap ref={listWrapRef}>
          {loading ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                color: "rgb(142 142 142)",
              }}
            >
              ...
            </div>
          ) : (
            <>
              {filtered.map((u) => (
                <Row key={u.id}>
                  <UserAvatarButton
                    type="button"
                    aria-label={`Open profile ${u.username}`}
                    onClick={() => onUserClick?.(u.id)}
                  >
                    <Avatar style={{ width: 44, height: 44 }}>
                      <AvatarImage src={u.avatar || undefined} />
                      <AvatarFallback>
                        {(u.username || u.id).slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </UserAvatarButton>
                  <UserInfo>
                    <Username>{u.username}</Username>
                  </UserInfo>
                  {currentUserId &&
                    u.id !== currentUserId &&
                    (followingIds.has(u.id) ? (
                      <BtnFollowing
                        type="button"
                        onClick={() => handleUnfollow(u.id)}
                      >
                        {t("profile.followingBtn")}
                      </BtnFollowing>
                    ) : (
                      <BtnFollow
                        type="button"
                        onClick={() => handleFollow(u.id)}
                      >
                        {t("sidebar.follow")}
                      </BtnFollow>
                    ))}
                </Row>
              ))}
              {!search.trim() && pageState && (
                <div
                  ref={sentinelRef}
                  style={{ height: 1, visibility: "hidden" }}
                  aria-hidden
                />
              )}
              {loadingMore && (
                <div
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    color: "rgb(142 142 142)",
                    fontSize: "0.875rem",
                  }}
                >
                  ...
                </div>
              )}
            </>
          )}
        </ListWrap>
      </DialogContent>
    </Dialog>
  );
}
