"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search, ChevronRight } from "lucide-react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { AdminPagination } from "@/src/presentation/components/admin-pagination";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ChatList = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  border: 1px solid ${theme.border};
  overflow: hidden;
  box-shadow: none;
`;

const ChatItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid ${theme.border};
  text-decoration: none;
  color: ${theme.text};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${theme.surfaceAlt};
  }
`;

const Pager = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 500;
  color: ${theme.text};
  margin-bottom: 0.25rem;
`;

const ChatMeta = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChatTime = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

const LoadingText = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

interface Chat {
  id: string;
  type: string;
  name: string;
  avatar?: string;
  participants: Array<{ username: string; avatar?: string }>;
  lastMessage?: { content: string; sender?: { username: string } };
  updatedAt: string;
}

export default function ChatsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = getApiClient();

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: "20",
      ...(search && { search }),
    });
    api
      .get<{ data: Chat[]; pagination: { totalPages: number } }>(
        `admin/chats?${params}`
      )
      .then((res) => {
        if (res.success) {
          const r = res as { data?: Chat[]; pagination?: { totalPages: number } };
          setChats(r.data || []);
          setTotalPages(r.pagination?.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const displayName = (c: Chat) =>
    c.name ||
    c.participants?.map((p) => p.username).join(", ") ||
    t("chats.unknownChat");

  return (
    <div>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <InputGroup className="admin-input-group-pill" style={{ width: 320 }}>
            <InputGroup.Text>
              <Search size={18} aria-hidden />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("chats.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn">
            {t("chats.search")}
          </Button>
        </Toolbar>
      </form>
      <ChatList>
        {loading ? (
          <LoadingText>{t("common.loading")}</LoadingText>
        ) : (
          chats.length === 0 ? (
            <EmptyState>{t("chats.empty")}</EmptyState>
          ) : (
            chats.map((c) => (
              <ChatItem key={c.id} href={`/chats/${c.id}`}>
                <Avatar>
                  {displayName(c).charAt(0)?.toUpperCase() || "?"}
                </Avatar>
                <ChatInfo>
                  <ChatName>{displayName(c)}</ChatName>
                  <ChatMeta>
                    {c.lastMessage
                      ? `${c.lastMessage.sender?.username || ""}: ${c.lastMessage.content?.slice(0, 50) || ""}`
                      : t("chats.noMessages")}
                  </ChatMeta>
                </ChatInfo>
                <ChatTime>
                  {format(new Date(c.updatedAt), "MM-dd HH:mm", { locale: dateLocale })}
                </ChatTime>
                <ChevronRight size={20} color={theme.iconMuted} />
              </ChatItem>
            ))
          )
        )}
      </ChatList>
      {totalPages > 1 && (
        <Pager>
          <AdminPagination
            page={page}
            count={totalPages}
            onChange={(p) => setPage(p)}
          />
        </Pager>
      )}
    </div>
  );
}
