"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import {
  adminPostsApi,
  type AdminPostDetailData,
  type AdminPostRow,
} from "@/src/infrastructure/adapters/api/posts-api";
import { DataGrid } from "@/src/presentation/components/data-grid";
import { PostDetailModal, type PostDetailForModal, type PostRowForModal } from "@/src/presentation/components/post-detail-modal";
import { Search, ImageIcon, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { AdminPagination } from "@/src/presentation/components/admin-pagination";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import type { ColDef, ITooltipParams, ValueFormatterParams } from "ag-grid-community";

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
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
  font-size: 1.125rem;
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
  gap: 0.5rem;
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
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background: ${theme.inputBg};
  border-radius: 8px;
  color: ${theme.textSecondary};
`;

const ThumbWrap = styled.span`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 48px;
`;

const ThumbImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
`;

const ThumbFallback = styled.span`
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background: ${theme.inputBg};
  border-radius: 8px;
  color: ${theme.textSecondary};
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
  max-width: 480px;
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
  font-size: 15px;
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

const TRUNCATE_LEN = 60;

export default function PostsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [rows, setRows] = useState<AdminPostRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<AdminPostRow | null>(null);
  const [postDetail, setPostDetail] = useState<AdminPostDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);
  const [detailVideoPaused, setDetailVideoPaused] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const detailVideoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
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
    adminPostsApi
      .getPostDetail(selectedPost.postId)
      .then((res) => {
        if (res.success && res.data) setPostDetail(res.data);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedPost?.postId]);

  const fetchPostDetail = useCallback(
    async (postId: string): Promise<PostDetailForModal | null> => {
      const res = await adminPostsApi.getPostDetail(postId);
      return res.success && res.data ? (res.data as PostDetailForModal) : null;
    },
    []
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

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
      });
      adminPostsApi
        .listPosts(params.toString())
        .then((res) => {
          if (res.success) {
            setRows(res.data || []);
            if (res.pagination) setPagination(res.pagination as typeof pagination);
          }
        })
        .finally(() => setLoading(false));
    },
    [search]
  );

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page, load]);

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
        await adminPostsApi.hidePost(postId);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: true } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [selectedPost?.postId, t]
  );

  const handleUnhide = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        await adminPostsApi.unhidePost(postId);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: false } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: false } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [selectedPost?.postId]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!confirm(t("posts.deletePostConfirm"))) return;
      setActionError(null);
      setActionLoading(true);
      try {
        await adminPostsApi.deletePost(postId);
        setRows((prev) => prev.filter((r) => r.postId !== postId));
        if (selectedPost?.postId === postId) setSelectedPost(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [selectedPost?.postId, t]
  );

  const handleRecheckModeration = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        const res = await adminPostsApi.recheckModeration(postId);
        const data = res.data;
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
    [selectedPost?.postId]
  );

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchDeleteConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await adminPostsApi.batchDelete(ids);
      const data = res.data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) => prev.filter((r) => !ids.includes(r.postId) || failedSet.has(r.postId)));
        setSelectedPostIds((prev) => new Set([...prev].filter((id) => failedSet.has(id))));
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost(null);
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [selectedPostIds, selectedPost, t]);

  const handleBatchHide = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchHideConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await adminPostsApi.batchHide(ids);
      const data = res.data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) =>
          prev.map((r) => (ids.includes(r.postId) && !failedSet.has(r.postId) ? { ...r, hidden: true } : r))
        );
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
        setSelectedPostIds(new Set());
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [selectedPostIds, selectedPost, t]);

  const isValidImageUrl = (s: string) =>
    typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:"));

  const columnDefs = useMemo<ColDef<AdminPostRow>[]>(
    () => [
      {
        colId: "select",
        width: 44,
        maxWidth: 44,
        sortable: false,
        cellRenderer: (p: { data: AdminPostRow }) => (
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
        width: 80,
        maxWidth: 80,
        cellRenderer: (p: { value: string[]; data: AdminPostRow }) => {
          const url = Array.isArray(p.value) ? p.value[0] : null;
          if (!url || !isValidImageUrl(url)) {
            return (
              <ThumbShell title={url === "[inline]" ? "Inline image" : undefined}>
                <ImageIcon size={24} />
              </ThumbShell>
            );
          }
          return (
            <ThumbWrap>
              <ThumbImage
                src={url}
                alt=""
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  const fallback = el.parentElement?.querySelector(".thumb-fallback");
                  if (fallback) (fallback as HTMLElement).style.display = "inline-flex";
                }}
              />
              <ThumbFallback className="thumb-fallback">
                <ImageIcon size={24} />
              </ThumbFallback>
            </ThumbWrap>
          );
        },
      },
      {
        field: "userId",
        headerName: t("posts.author"),
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<AdminPostRow>) => p.value ?? "—",
      },
      {
        field: "caption",
        headerName: t("posts.caption"),
        flex: 1,
        minWidth: 180,
        valueFormatter: (p: ValueFormatterParams<AdminPostRow>) => {
          const s = p.value ? String(p.value) : "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ITooltipParams<AdminPostRow>) =>
          p.value != null && p.value !== "" ? String(p.value) : undefined,
      },
      {
        field: "hashtags",
        headerName: t("posts.hashtags"),
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<AdminPostRow>) => {
          const arr = Array.isArray(p.value) ? (p.value as string[]) : [];
          const s = arr.join(", ") || "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ITooltipParams<AdminPostRow, string[]>) =>
          Array.isArray(p.value) ? p.value.join(", ") || undefined : undefined,
      },
      {
        field: "autoTags",
        headerName: t("posts.autoTags"),
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<AdminPostRow>) => {
          const arr = Array.isArray(p.value) ? (p.value as string[]) : [];
          const s = arr.join(", ") || "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ITooltipParams<AdminPostRow, string[]>) =>
          Array.isArray(p.value) ? p.value.join(", ") || undefined : undefined,
      },
      {
        field: "createdAt",
        headerName: t("posts.createdAt"),
        minWidth: 130,
        valueFormatter: (p: ValueFormatterParams<AdminPostRow>) =>
          p.value ? format(new Date(p.value as string), "yyyy-MM-dd HH:mm", { locale: dateLocale }) : "—",
      },
      {
        field: "moderationStatus",
        headerName: t("posts.contentSafety"),
        minWidth: 100,
        cellRenderer: (p: { value: string; data: AdminPostRow }) => {
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
            s === "reject"
              ? "#b91c1c"
              : s === "pass"
                ? "#15803d"
                : theme.textSecondary;
          return (
            <StatusWrap>
              <StatusPill $bg={bg} $color={color}>{label}</StatusPill>
              {p.data.hidden && <HiddenPill>{t("posts.hidden")}</HiddenPill>}
            </StatusWrap>
          );
        },
      },
    ],
    [t, dateLocale, selectedPostIds, toggleSelect]
  );

  return (
    <div>
      <PageTitle>{t("posts.title")}</PageTitle>
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
          <InputGroup className="admin-input-group-pill" style={{ width: 320 }}>
            <InputGroup.Text>
              <Search size={18} aria-hidden />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("posts.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn">
            {t("posts.search")}
          </Button>
        </Toolbar>
      </form>
      <DataGrid<AdminPostRow>
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
                        <DetailCarouselNav
                          type="button"
                          $side="left"
                          disabled={idx <= 0}
                          onClick={() => setDetailMediaIndex((i) => Math.max(0, i - 1))}
                          aria-label="Previous"
                        >
                          <ChevronLeft size={24} />
                        </DetailCarouselNav>
                        <DetailCarouselNav
                          type="button"
                          $side="right"
                          disabled={idx >= urls.length - 1}
                          onClick={() => setDetailMediaIndex((i) => Math.min(urls.length - 1, i + 1))}
                          aria-label="Next"
                        >
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
                        <video
                          ref={detailVideoRef}
                          src={currentUrl}
                          muted
                          loop
                          playsInline
                          autoPlay
                          onPause={() => setDetailVideoPaused(true)}
                          onPlay={() => setDetailVideoPaused(false)}
                        />
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
            {selectedPost.location && (
              <DetailRow>
                <DetailLabel>{t("posts.location")}</DetailLabel>
                <DetailValue>{selectedPost.location}</DetailValue>
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>{t("posts.hashtags")}</DetailLabel>
              <DetailValue>
                {Array.isArray(selectedPost.hashtags) && selectedPost.hashtags.length > 0
                  ? selectedPost.hashtags.join(", ")
                  : "—"}
              </DetailValue>
            </DetailRow>
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
                {detailLoading
                  ? "…"
                  : postDetail?.engagement != null
                    ? `${t("posts.likes")}: ${postDetail.engagement.likeCount} · ${t("posts.comments")}: ${postDetail.engagement.commentCount} · ${t("posts.saves")}: ${postDetail.engagement.saveCount}`
                    : "—"}
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
                        <DetailCommentTime>
                          {format(new Date(c.createdAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })}
                        </DetailCommentTime>
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
                  {t("posts.autoTags")}:{" "}
                  {Array.isArray(selectedPost.autoTags) && selectedPost.autoTags.length > 0
                    ? selectedPost.autoTags.join(", ")
                    : "—"}
                </span>
                <span>
                  {t("posts.moderationStatus")}:{" "}
                  {selectedPost.moderationStatus === "reject"
                    ? t("posts.moderationReject")
                    : selectedPost.moderationStatus === "pass"
                      ? t("posts.moderationPass")
                      : t("posts.moderationPending")}
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
                <DetailActionButton
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUnhide(selectedPost.postId)}
                >
                  {t("posts.unhidePost")}
                </DetailActionButton>
              ) : (
                <DetailActionButton
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleHide(selectedPost.postId)}
                >
                  {t("posts.hidePost")}
                </DetailActionButton>
              )}
              <DetailActionButton
                type="button"
                disabled={actionLoading}
                onClick={() => handleDelete(selectedPost.postId)}
                $danger
              >
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
