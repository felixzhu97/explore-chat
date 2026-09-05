"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { DataGrid } from "@/src/presentation/components/data-grid";
import { PostDetailModal, type PostDetailForModal, type PostRowForModal } from "@/src/presentation/components/post-detail-modal";
import { Search, ImageIcon, ShieldCheck, ShieldAlert, Clock, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { AdminPagination } from "@/src/presentation/components/admin-pagination";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.875rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const StatCard = styled("div", {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "pass" | "reject" | "pending" }>`
  flex: 1;
  min-width: 140px;
  background: ${theme.surface};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  border: 1px solid ${theme.border};
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: none;
  & .icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.text};
  }
  & .label {
    font-size: 12px;
    color: ${theme.textSecondary};
    margin-top: 0.125rem;
  }
  ${(p) =>
    p.variant === "pass" &&
    `
    .icon { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
  `}
  ${(p) =>
    p.variant === "reject" &&
    `
    .icon { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
  `}
  ${(p) =>
    p.variant === "pending" &&
    `
    .icon { background: rgba(156, 163, 175, 0.2); color: ${theme.textSecondary}; }
  `}
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterBtn = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${theme.border};
  background: ${(p) => (p.active ? theme.primary : theme.surface)};
  color: ${(p) => (p.active ? "#fff" : theme.text)};
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: ${(p) => (p.active ? theme.primary : theme.surfaceAlt)};
  }
`;

const BatchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 10px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const ToolbarButton = styled.button<{ $variant?: "primary" | "danger" | "ghost" }>`
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  ${(p) =>
    p.$variant === "primary" &&
    `
      border-color: transparent;
      background: ${theme.primary};
      color: #fff;
    `}
  ${(p) =>
    p.$variant === "danger" &&
    `
      border-color: #dc2626;
      background: transparent;
      color: #dc2626;
    `}
`;

const SelectedCount = styled.span`
  font-size: 14px;
  color: ${theme.text};
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const IconTextButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  color: ${theme.textSecondary};
`;

const FullLineButton = styled.button`
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem 1rem;
  font-size: 14px;
  border: 1px solid ${theme.primary};
  border-radius: 8px;
  background: transparent;
  color: ${theme.primary};
  cursor: pointer;
  font-weight: 500;
`;

const DetailStack = styled.div`
  color: ${theme.text};
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const SmallErrorText = styled.div`
  color: #dc2626;
  font-size: 13px;
`;

const SmallMutedText = styled.div`
  color: ${theme.textSecondary};
  font-size: 13px;
`;

const DetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${theme.border};
`;

const DetailActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 14px;
  border-radius: 8px;
  background: ${(p) => (p.$danger ? "rgba(239, 68, 68, 0.1)" : theme.surface)};
  color: ${(p) => (p.$danger ? "#dc2626" : theme.text)};
  border: 1px solid ${(p) => (p.$danger ? "#dc2626" : theme.border)};
  cursor: pointer;
`;

const DetailRecheckButton = styled.button`
  align-self: flex-start;
  margin-top: 4px;
  padding: 0.4rem 0.75rem;
  font-size: 13px;
  border: 1px solid ${theme.border};
  border-radius: 8px;
  background: ${theme.surface};
  color: ${theme.text};
  cursor: pointer;
`;

const ThumbShell = styled.span`
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: ${theme.inputBg};
  border-radius: 8px;
  color: ${theme.textSecondary};
`;

const ThumbImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
`;

const StatusWrap = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusPill = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

const HiddenPill = styled.span`
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.08);
  color: ${theme.textSecondary};
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DetailPanel = styled.div`
  background: ${theme.surface};
  border-radius: 16px;
  max-width: 440px;
  width: 90%;
  max-height: 85vh;
  overflow: auto;
  box-shadow: ${theme.shadow};
  padding: 1.5rem;
`;

const DetailRow = styled.div`
  margin-bottom: 1rem;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  display: block;
  font-size: 12px;
  color: ${theme.textSecondary};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: ${theme.text};
  word-break: break-word;
`;

const DetailValueFull = styled(DetailValue)`
  white-space: pre-wrap;
  max-height: 240px;
  overflow-y: auto;
`;

const DetailMediaCarousel = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-top: 4px;
`;

const DetailCarouselNav = styled.button<{ $side: "left" | "right" }>`
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
  color: #262626;
  z-index: 1;
  &:hover {
    background: #fff;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const DetailCarouselDots = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 1;
`;

const DetailCarouselDot = styled.span<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#fff" : "rgba(255, 255, 255, 0.5)")};
`;

const DetailMediaWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  & img,
  & video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const DetailMediaClickable = styled(DetailMediaWrap)`
  cursor: pointer;
`;

const DetailPlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const DetailPlayCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
`;

const DetailCommentList = styled.div`
  max-height: 240px;
  overflow-y: auto;
  padding: 8px 0;
  margin-top: 4px;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.border};
    border-radius: 3px;
  }
`;

const DetailCommentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
  font-size: 14px;
  line-height: 1.25;
  color: ${theme.text};
  border-bottom: 1px solid ${theme.borderLight};
  &:last-child {
    border-bottom: none;
  }
`;

const DetailCommentHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
`;

const DetailCommentUser = styled.span`
  font-weight: 600;
  color: ${theme.text};
`;

const DetailCommentTime = styled.span`
  font-size: 12px;
  color: ${theme.textSecondary};
`;

const DetailCommentContent = styled.div`
  font-weight: 400;
  word-break: break-word;
  margin-top: 2px;
`;

const TRUNCATE_LEN = 50;

interface PostDetailData {
  post: Record<string, unknown>;
  engagement: { likeCount: number; commentCount: number; saveCount: number };
  comments: Array<{ id: string; userId: string; content: string; parentId?: string; createdAt: string }>;
}

interface ModerationStats {
  pass: number;
  reject: number;
  pending: number;
}

interface PostRow extends Record<string, unknown> {
  postId: string;
  userId: string;
  type?: string;
  caption?: string;
  hashtags?: string[];
  autoTags?: string[];
  mediaUrls?: string[];
  coverUrl?: string | null;
  location?: string | null;
  createdAt: string;
  moderationStatus?: string;
  moderationCategories?: string[];
  moderationAt?: string | null;
  hidden?: boolean;
}

export default function ContentSafetyPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [stats, setStats] = useState<ModerationStats>({ pass: 0, reject: 0, pending: 0 });
  const [rows, setRows] = useState<PostRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [postDetail, setPostDetail] = useState<PostDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);
  const [detailVideoPaused, setDetailVideoPaused] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const detailVideoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const api = getApiClient();

  useEffect(() => {
    if (!selectedPost?.postId) {
      setPostDetail(null);
      setDetailMediaIndex(0);
      setDetailVideoPaused(false);
      setShowPostDetailModal(false);
      return;
    }
    setDetailMediaIndex(0);
    setDetailVideoPaused(false);
    setDetailLoading(true);
    setPostDetail(null);
    api
      .get<{ success: boolean; data: PostDetailData }>(`admin/posts/${selectedPost.postId}/detail`)
      .then((res) => {
        const data = (res as { data?: PostDetailData }).data;
        if (res.success && data) setPostDetail(data);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedPost?.postId, api]);

  const fetchPostDetail = useCallback(
    async (postId: string): Promise<PostDetailForModal | null> => {
      const res = await api.get<{ success: boolean; data: PostDetailForModal }>(`admin/posts/${postId}/detail`);
      const data = (res as { data?: PostDetailForModal }).data;
      return res.success && data ? data : null;
    },
    [api]
  );

  const toggleSelect = useCallback((postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);
  const selectAllCurrentPage = useCallback(() => {
    setSelectedPostIds(new Set(rows.map((r) => r.postId)));
  }, [rows]);
  const clearSelection = useCallback(() => setSelectedPostIds(new Set()), []);

  const loadStats = useCallback(() => {
    api.get<ModerationStats>("admin/content-safety/stats").then((res) => {
      if (res.success && res.data) setStats(res.data);
    });
  }, [api]);

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { moderationStatus: statusFilter }),
      });
      api
        .get<PostRow[]>(`admin/list/posts?${params}`)
        .then((res) => {
          if (res.success) {
            const r = res as { data?: PostRow[]; pagination?: typeof pagination };
            setRows(r.data || []);
            if (r.pagination) setPagination(r.pagination);
          }
        })
        .finally(() => setLoading(false));
    },
    [api, search, statusFilter]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter]);

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page, statusFilter, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const handleHide = useCallback(
    async (postId: string) => {
      if (!confirm(t("posts.hidePostConfirm"))) return;
      setActionError(null);
      setActionLoading(true);
      try {
        await api.put(`admin/posts/${postId}/hide`);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: true } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId, t]
  );

  const handleUnhide = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        await api.put(`admin/posts/${postId}/unhide`);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: false } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: false } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!confirm(t("posts.deletePostConfirm"))) return;
      setActionError(null);
      setActionLoading(true);
      try {
        await api.delete(`admin/posts/${postId}`);
        setRows((prev) => prev.filter((r) => r.postId !== postId));
        if (selectedPost?.postId === postId) setSelectedPost(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId, t]
  );

  const handleRecheckModeration = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        const res = await api.post<{ moderationStatus: string; moderationCategories: string[]; moderationAt: string }>(
          `admin/posts/${postId}/recheck-moderation`
        );
        const data = (res as { data?: { moderationStatus: string; moderationCategories: string[]; moderationAt: string } }).data;
        if (data && selectedPost?.postId === postId) {
          setSelectedPost((p) => (p ? { ...p, ...data } : null));
          setRows((prev) =>
            prev.map((r) => (r.postId === postId ? { ...r, ...data } : r))
          );
        }
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId]
  );

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchDeleteConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await api.post<{ deleted: number; failed: string[] }>("admin/posts/batch-delete", { postIds: ids });
      const data = (res as { data?: { deleted: number; failed: string[] } }).data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) => prev.filter((r) => !ids.includes(r.postId) || failedSet.has(r.postId)));
        setSelectedPostIds((prev) => new Set([...prev].filter((id) => failedSet.has(id))));
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost(null);
        loadStats();
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [api, selectedPostIds, selectedPost, t, loadStats]);

  const handleBatchHide = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchHideConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await api.post<{ hidden: number; failed: string[] }>("admin/posts/batch-hide", { postIds: ids });
      const data = (res as { data?: { hidden: number; failed: string[] } }).data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) =>
          prev.map((r) => (ids.includes(r.postId) && !failedSet.has(r.postId) ? { ...r, hidden: true } : r))
        );
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
        setSelectedPostIds(new Set());
        loadStats();
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [api, selectedPostIds, selectedPost, t, loadStats]);

  const isValidImageUrl = (s: string) =>
    typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:"));

  const columnDefs = useMemo<ColDef<PostRow>[]>(
    () => [
      {
        colId: "select",
        width: 44,
        maxWidth: 44,
        sortable: false,
        cellRenderer: (p: { data: PostRow }) => (
          <input
            type="checkbox"
            checked={selectedPostIds.has(p.data.postId)}
            onChange={() => toggleSelect(p.data.postId)}
            onClick={(e) => e.stopPropagation()}
            aria-label={t("common.select")}
          />
        ),
      },
      {
        field: "mediaUrls",
        headerName: t("posts.thumbnail"),
        width: 72,
        maxWidth: 72,
        cellRenderer: (p: { value: string[]; data: PostRow }) => {
          const url = Array.isArray(p.value) ? p.value[0] : null;
          if (!url || !isValidImageUrl(url)) {
            return (
              <ThumbShell>
                <ImageIcon size={20} />
              </ThumbShell>
            );
          }
          return (
            <ThumbImage
              src={url}
              alt=""
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
              }}
            />
          );
        },
      },
      {
        field: "userId",
        headerName: t("posts.author"),
        minWidth: 120,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => p.value ?? "—",
      },
      {
        field: "caption",
        headerName: t("posts.caption"),
        flex: 1,
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => {
          const s = p.value ? String(p.value) : "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: { value?: unknown }) => (p.value ? String(p.value) : undefined),
      },
      {
        field: "moderationStatus",
        headerName: t("posts.contentSafety"),
        minWidth: 100,
        cellRenderer: (p: { value: string; data: PostRow }) => {
          const s = p.value || "pending";
          const label =
            s === "reject"
              ? t("posts.moderationReject")
              : s === "pass"
                ? t("posts.moderationPass")
                : t("posts.moderationPending");
          const bg =
            s === "reject"
              ? "rgba(239, 68, 68, 0.14)"
              : s === "pass"
                ? "rgba(22, 163, 74, 0.12)"
                : "rgba(156, 163, 175, 0.18)";
          const color =
            s === "reject" ? "#b91c1c" : s === "pass" ? "#15803d" : theme.textSecondary;
          return (
            <StatusWrap>
              <StatusPill $bg={bg} $color={color}>{label}</StatusPill>
              {p.data.hidden && <HiddenPill>{t("posts.hidden")}</HiddenPill>}
            </StatusWrap>
          );
        },
      },
      {
        field: "moderationCategories",
        headerName: t("posts.moderationCategories"),
        minWidth: 120,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => {
          const arr = Array.isArray(p.value) ? (p.value as string[]) : [];
          return arr.length ? arr.join(", ") : "—";
        },
      },
      {
        field: "moderationAt",
        headerName: t("posts.moderationAt"),
        minWidth: 130,
        valueFormatter: (p: ValueFormatterParams<PostRow>) =>
          p.value
            ? format(new Date(p.value as string), "yyyy-MM-dd HH:mm", { locale: dateLocale })
            : "—",
      },
      {
        field: "createdAt",
        headerName: t("posts.createdAt"),
        minWidth: 120,
        valueFormatter: (p: ValueFormatterParams<PostRow>) =>
          p.value
            ? format(new Date(p.value as string), "yyyy-MM-dd HH:mm", { locale: dateLocale })
            : "—",
      },
    ],
    [t, dateLocale, selectedPostIds, toggleSelect]
  );

  return (
    <div>
      <PageTitle>{t("contentSafety.title")}</PageTitle>
      <StatsRow>
        <StatCard variant="pass">
          <div className="icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="value">{stats.pass}</div>
            <div className="label">{t("posts.moderationPass")}</div>
          </div>
        </StatCard>
        <StatCard variant="reject">
          <div className="icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="value">{stats.reject}</div>
            <div className="label">{t("posts.moderationReject")}</div>
          </div>
        </StatCard>
        <StatCard variant="pending">
          <div className="icon">
            <Clock size={22} />
          </div>
          <div>
            <div className="value">{stats.pending}</div>
            <div className="label">{t("posts.moderationPending")}</div>
          </div>
        </StatCard>
      </StatsRow>
      {selectedPostIds.size > 0 && (
        <BatchBar>
          <SelectedCount>{t("posts.selectedCount", { count: selectedPostIds.size })}</SelectedCount>
          <ToolbarButton type="button" onClick={clearSelection}>
            {t("common.cancel")}
          </ToolbarButton>
          <ToolbarButton type="button" disabled={batchLoading} onClick={handleBatchHide} $variant="primary">
            {t("posts.batchHide")}
          </ToolbarButton>
          <ToolbarButton type="button" disabled={batchLoading} onClick={handleBatchDelete} $variant="danger">
            {t("posts.batchDelete")}
          </ToolbarButton>
        </BatchBar>
      )}
      <form onSubmit={handleSearch}>
        <Toolbar>
          {rows.length > 0 && (
            <ToolbarButton
              type="button"
              onClick={() =>
                selectedPostIds.size === rows.length ? clearSelection() : selectAllCurrentPage()
              }
            >
              {selectedPostIds.size === rows.length ? t("posts.clearSelection") : t("posts.selectAllPage")}
            </ToolbarButton>
          )}
          <InputGroup className="admin-input-group-pill" style={{ width: 280 }}>
            <InputGroup.Text>
              <Search size={16} aria-hidden />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("posts.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <FilterBtn type="button" active={statusFilter === ""} onClick={() => setStatusFilter("")}>
            {t("common.all")}
          </FilterBtn>
          <FilterBtn type="button" active={statusFilter === "pass"} onClick={() => setStatusFilter("pass")}>
            {t("posts.moderationPass")}
          </FilterBtn>
          <FilterBtn type="button" active={statusFilter === "reject"} onClick={() => setStatusFilter("reject")}>
            {t("posts.moderationReject")}
          </FilterBtn>
          <FilterBtn type="button" active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")}>
            {t("posts.moderationPending")}
          </FilterBtn>
          <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn">
            {t("posts.search")}
          </Button>
        </Toolbar>
      </form>
      <DataGrid<PostRow>
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        getRowId={(p) => p.data.postId}
        onRowClicked={({ data }) => setSelectedPost(data)}
      />
      {selectedPost && (
        <DetailOverlay onClick={() => setSelectedPost(null)} role="presentation">
          <DetailPanel onClick={(e) => e.stopPropagation()}>
            <DetailHeader>
              <DetailTitle>{t("posts.detail")}</DetailTitle>
              <IconTextButton type="button" onClick={() => setSelectedPost(null)} aria-label="Close">
                ×
              </IconTextButton>
            </DetailHeader>
            <FullLineButton type="button" onClick={() => setShowPostDetailModal(true)}>
              {t("posts.viewContentAndComments")}
            </FullLineButton>
            <DetailRow>
              <DetailLabel>{t("posts.postType")}</DetailLabel>
              <DetailValue>{selectedPost.type ?? "—"}</DetailValue>
            </DetailRow>
            {Array.isArray(selectedPost.mediaUrls) && selectedPost.mediaUrls.length > 0 && (() => {
              const urls = selectedPost.mediaUrls.filter((u) => u && isValidImageUrl(u));
              if (urls.length === 0) return null;
              const multi = urls.length > 1;
              const idx = multi ? detailMediaIndex : 0;
              const currentUrl = urls[idx];
              const isVideo = currentUrl && (/\.(mp4|webm|mov)(\?|$)/i.test(currentUrl) || /^data:video\//i.test(currentUrl));
              const toggleDetailVideo = () => {
                const el = detailVideoRef.current;
                if (!el) return;
                if (detailVideoPaused) {
                  el.play().catch(() => {});
                  setDetailVideoPaused(false);
                } else {
                  el.pause();
                  setDetailVideoPaused(true);
                }
              };
              return (
                <DetailRow>
                  <DetailLabel>{t("posts.media")}</DetailLabel>
                  <DetailMediaCarousel>
                    {multi && (
                      <>
                        <DetailCarouselNav type="button" $side="left" disabled={idx <= 0} onClick={() => setDetailMediaIndex((i) => Math.max(0, i - 1))} aria-label="Previous">
                          <ChevronLeft size={24} />
                        </DetailCarouselNav>
                        <DetailCarouselNav type="button" $side="right" disabled={idx >= urls.length - 1} onClick={() => setDetailMediaIndex((i) => Math.min(urls.length - 1, i + 1))} aria-label="Next">
                          <ChevronRight size={24} />
                        </DetailCarouselNav>
                        <DetailCarouselDots>
                          {urls.map((_, i) => (
                            <DetailCarouselDot key={i} $active={i === idx} />
                          ))}
                        </DetailCarouselDots>
                      </>
                    )}
                    {isVideo ? (
                      <DetailMediaClickable onClick={toggleDetailVideo}>
                        <video ref={detailVideoRef} src={currentUrl} muted loop playsInline autoPlay onPause={() => setDetailVideoPaused(true)} onPlay={() => setDetailVideoPaused(false)} />
                        {detailVideoPaused && (
                          <DetailPlayOverlay>
                            <DetailPlayCircle>
                              <Play size={32} fill="currentColor" stroke="none" />
                            </DetailPlayCircle>
                          </DetailPlayOverlay>
                        )}
                      </DetailMediaClickable>
                    ) : (
                      <DetailMediaWrap>
                        <img src={currentUrl} alt="" />
                      </DetailMediaWrap>
                    )}
                  </DetailMediaCarousel>
                </DetailRow>
              );
            })()}
            <DetailRow>
              <DetailLabel>{t("posts.author")}</DetailLabel>
              <DetailValue>{selectedPost.userId}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.caption")}</DetailLabel>
              <DetailValueFull>{selectedPost.caption || "—"}</DetailValueFull>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.hashtags")}</DetailLabel>
              <DetailValue>
                {Array.isArray(selectedPost.hashtags) && selectedPost.hashtags.length > 0 ? selectedPost.hashtags.join(", ") : "—"}
              </DetailValue>
            </DetailRow>
            {selectedPost.location && (
              <DetailRow>
                <DetailLabel>{t("posts.location")}</DetailLabel>
                <DetailValue>{selectedPost.location}</DetailValue>
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>{t("posts.createdAt")}</DetailLabel>
              <DetailValue>
                {selectedPost.createdAt
                  ? format(new Date(selectedPost.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: dateLocale })
                  : "—"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.engagement")}</DetailLabel>
              <DetailValue>
                {detailLoading ? "…" : postDetail?.engagement != null ? `${t("posts.likes")}: ${postDetail.engagement.likeCount} · ${t("posts.comments")}: ${postDetail.engagement.commentCount} · ${t("posts.saves")}: ${postDetail.engagement.saveCount}` : "—"}
              </DetailValue>
            </DetailRow>
            {postDetail?.comments && postDetail.comments.length > 0 && (
              <DetailRow>
                <DetailLabel>{t("posts.commentList")}</DetailLabel>
                <DetailCommentList>
                  {postDetail.comments.map((c, i) => (
                    <DetailCommentItem key={c.id || `${i}`}>
                      <DetailCommentHeader>
                        <DetailCommentUser>{c.userId}</DetailCommentUser>
                        <DetailCommentTime>{format(new Date(c.createdAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })}</DetailCommentTime>
                      </DetailCommentHeader>
                      <DetailCommentContent>{c.content}</DetailCommentContent>
                    </DetailCommentItem>
                  ))}
                </DetailCommentList>
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>{t("posts.violationRecognition")}</DetailLabel>
              <DetailStack>
                <span>
                  {t("posts.autoTags")}: {Array.isArray(selectedPost.autoTags) && selectedPost.autoTags.length > 0 ? selectedPost.autoTags.join(", ") : "—"}
                </span>
                <span>
                  {t("posts.moderationStatus")}:{" "}
                  {selectedPost.moderationStatus === "reject" ? t("posts.moderationReject") : selectedPost.moderationStatus === "pass" ? t("posts.moderationPass") : t("posts.moderationPending")}
                </span>
                {Array.isArray(selectedPost.moderationCategories) && selectedPost.moderationCategories.length > 0 && (
                  <span>
                    {t("posts.moderationCategories")}: {selectedPost.moderationCategories.join(", ")}
                  </span>
                )}
                {selectedPost.moderationAt && (
                  <span>
                    {t("posts.moderationAt")}: {format(new Date(selectedPost.moderationAt), "yyyy-MM-dd HH:mm:ss", { locale: dateLocale })}
                  </span>
                )}
                <DetailRecheckButton
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleRecheckModeration(selectedPost.postId)}
                >
                  {t("posts.recheckModeration")}
                </DetailRecheckButton>
              </DetailStack>
            </DetailRow>
            {selectedPost.hidden && (
              <DetailRow>
                <SmallMutedText>{t("posts.hidden")}</SmallMutedText>
              </DetailRow>
            )}
            {actionError && (
              <DetailRow>
                <SmallErrorText>{actionError}</SmallErrorText>
              </DetailRow>
            )}
            <DetailActions>
              {selectedPost.hidden ? (
                <DetailActionButton type="button" disabled={actionLoading} onClick={() => handleUnhide(selectedPost.postId)}>
                  {t("posts.unhidePost")}
                </DetailActionButton>
              ) : (
                <DetailActionButton type="button" disabled={actionLoading} onClick={() => handleHide(selectedPost.postId)}>
                  {t("posts.hidePost")}
                </DetailActionButton>
              )}
              <DetailActionButton type="button" disabled={actionLoading} onClick={() => handleDelete(selectedPost.postId)} $danger>
                {t("posts.deletePost")}
              </DetailActionButton>
            </DetailActions>
          </DetailPanel>
        </DetailOverlay>
      )}
      <PostDetailModal
        open={showPostDetailModal && !!selectedPost}
        onClose={() => setShowPostDetailModal(false)}
        postId={selectedPost?.postId ?? null}
        initialPost={selectedPost as PostRowForModal | null}
        fetchDetail={fetchPostDetail}
        onHide={handleHide}
        onUnhide={handleUnhide}
        onDelete={handleDelete}
        onRecheckModeration={handleRecheckModeration}
        actionLoading={actionLoading}
        actionError={actionError}
        showAdminActions
      />
      {pagination.totalPages > 1 && (
        <Pagination>
          <AdminPagination
            page={pagination.page}
            count={pagination.totalPages}
            onChange={(p) => load(p)}
          />
        </Pagination>
      )}
    </div>
  );
}
