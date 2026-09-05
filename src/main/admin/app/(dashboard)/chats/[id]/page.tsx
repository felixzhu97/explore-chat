"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.primary};
  text-decoration: none;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

const MessageList = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  border: 1px solid ${theme.border};
  overflow: hidden;
  box-shadow: none;
`;

const MessageItem = styled.div`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid ${theme.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  &:last-child {
    border-bottom: none;
  }
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageSender = styled.div`
  font-size: 0.8125rem;
  color: ${theme.primary};
  margin-bottom: 0.25rem;
`;

const MessageText = styled.div`
  font-size: 0.9375rem;
  color: ${theme.text};
  word-break: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
  flex-shrink: 0;
`;

const DeleteBtn = styled.button`
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: ${theme.danger};
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: ${theme.dangerHover};
  }
`;

const LoadingWrap = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

const DeletedText = styled.span`
  color: ${theme.textSecondary};
  font-style: italic;
`;

const Pager = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PagerBtn = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  border-radius: 10px;
  cursor: pointer;
`;

const PagerText = styled.span`
  padding: 0.5rem;
  color: ${theme.textSecondary};
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

interface Message {
  id: string;
  content: string;
  type: string;
  isDeleted: boolean;
  sender: { id: string; username: string; email: string; avatar?: string };
  createdAt: string;
}

export default function ChatMessagesPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = getApiClient();

  const load = (p = 1) => {
    setLoading(true);
    api
      .get<{ data: Message[]; pagination: { totalPages: number } }>(
        `admin/chats/${params.id}/messages?page=${p}&limit=50`
      )
      .then((res) => {
        if (res.success) {
          const r = res as { data?: Message[]; pagination?: { totalPages: number } };
          setMessages(r.data || []);
          setTotalPages(r.pagination?.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (params.id) load(page);
  }, [params.id, page]);

  const handleDelete = (messageId: string) => {
    if (!confirm(t("chats.deleteMessageConfirm"))) return;
    api.delete(`admin/messages/${messageId}`).then(() => load(page));
  };

  return (
    <div>
      <BackLink href="/chats">
        <ArrowLeft size={18} /> {t("chats.backToList")}
      </BackLink>
      <MessageList>
        {loading ? (
          <LoadingWrap>{t("common.loading")}</LoadingWrap>
        ) : (
          messages.length === 0 ? (
            <EmptyState>{t("chats.emptyMessages")}</EmptyState>
          ) : (
            messages.map((m) => (
              <MessageItem key={m.id}>
                <MessageContent>
                  <MessageSender>
                    {m.sender?.username} ({m.sender?.email})
                  </MessageSender>
                  <MessageText>
                    {m.isDeleted ? (
                      <DeletedText>[{t("chats.deleted")}]</DeletedText>
                    ) : (
                      m.content
                    )}
                  </MessageText>
                  <MessageTime>
                    {format(new Date(m.createdAt), "PPpp", { locale: dateLocale })}
                  </MessageTime>
                </MessageContent>
                {!m.isDeleted && (
                  <DeleteBtn onClick={() => handleDelete(m.id)} title={t("chats.deleteMessage")}>
                    <Trash2 size={16} />
                  </DeleteBtn>
                )}
              </MessageItem>
            ))
          )
        )}
      </MessageList>
      {totalPages > 1 && (
        <Pager>
          <PagerBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("common.prev")}
          </PagerBtn>
          <PagerText>{page} / {totalPages}</PagerText>
          <PagerBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("common.next")}
          </PagerBtn>
        </Pager>
      )}
    </div>
  );
}
