"use client";

import { Search, ChevronDown, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useTranslation } from "@/src/shared/i18n";
import type { Contact, User } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

const Root = styled.div`
  width: 400px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  background-color: rgb(255 255 255);
  border-right: 1px solid rgb(219 219 219);
`;

const Header = styled.div`
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgb(219 219 219);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const UsernameBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0;
  border: none;
  background: none;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(38 38 38);
  cursor: pointer;
`;

const ComposeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: rgb(38 38 38);
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: rgb(239 239 239);
  }
`;

const SearchWrap = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(142 142 142);
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: none;
  border-radius: 8px;
  background: rgb(239 239 239);
  font-size: 0.875rem;
  color: rgb(38 38 38);
  outline: none;
  &::placeholder {
    color: rgb(142 142 142);
  }
`;

const NotesWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

const NoteBubble = styled.div`
  font-size: 0.75rem;
  color: rgb(38 38 38);
  background: rgb(239 239 239);
  padding: 4px 8px;
  border-radius: 8px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoteLabel = styled.span`
  font-size: 0.75rem;
  color: rgb(142 142 142);
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
`;

const TabMessages = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const TabRequests = styled.button`
  font-size: 0.875rem;
  font-weight: 400;
  color: rgb(142 142 142);
  border: none;
  background: none;
  cursor: pointer;
  &:hover {
    color: rgb(38 38 38);
  }
`;

const ListScroll = styled(ScrollArea)`
  flex: 1;
  min-height: 0;
`;

const ConversationRow = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 12px 1rem;
  border: none;
  background: ${(p) => (p.$selected ? "rgb(239 239 239)" : "transparent")};
  cursor: pointer;
  text-align: left;
  &:hover {
    background: rgb(250 250 250);
  }
`;

const ConvAvatar = styled(Avatar)`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
`;

const ConvMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConvName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConvPreview = styled.div`
  font-size: 0.8125rem;
  color: rgb(142 142 142);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
`;

function formatPreviewTime(ts?: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "1d";
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return d.toLocaleDateString();
}

export interface InstagramMessagesSidebarProps {
  user: User | null;
  contacts: Contact[];
  selectedContact: Contact | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onContactSelect: (c: Contact) => void;
  onComposeClick?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function InstagramMessagesSidebar({
  user,
  contacts,
  selectedContact,
  searchQuery,
  onSearchChange,
  onContactSelect,
  onComposeClick,
  searchInputRef,
}: InstagramMessagesSidebarProps) {
  const { t } = useTranslation();
  const filtered = contacts.filter((c) => {
    const name = c.name ?? "";
    const last = c.lastMessage ?? "";
    const q = searchQuery.trim().toLowerCase();
    return (
      !q || name.toLowerCase().includes(q) || last.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  return (
    <Root>
      <Header>
        <HeaderRow>
          <UsernameBtn type="button">
            {user?.username ?? user?.name ?? "Messages"}
            <ChevronDown size={20} />
          </UsernameBtn>
          <ComposeBtn
            type="button"
            onClick={onComposeClick}
            aria-label={t("dm.sendMessage")}
          >
            <SquarePen size={24} />
          </ComposeBtn>
        </HeaderRow>
        <SearchWrap>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder={t("dm.search")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchWrap>
        <NotesWrap>
          <Avatar style={{ width: 56, height: 56 }}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {(user?.name ?? user?.username ?? "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <NoteBubble>Can&apos;t decide...</NoteBubble>
            <NoteLabel>{t("dm.yourNote")}</NoteLabel>
          </div>
        </NotesWrap>
        <TabsRow>
          <TabMessages>{t("dm.messages")}</TabMessages>
          <TabRequests type="button">{t("dm.requests")}</TabRequests>
        </TabsRow>
      </Header>
      <ListScroll>
        {sorted.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgb(142 142 142)",
            }}
          >
            {searchQuery ? "No matches" : "No conversations yet"}
          </div>
        ) : (
          sorted.map((c) => {
            const preview = c.lastMessage
              ? `${t("dm.youPrefix")}${c.lastMessage}`
              : "";
            const time = formatPreviewTime(c.timestamp);
            const line = time ? `${preview} · ${time}` : preview;
            return (
              <ConversationRow
                key={c.id}
                type="button"
                $selected={selectedContact?.id === c.id}
                onClick={() => onContactSelect(c)}
              >
                <ConvAvatar>
                  <AvatarImage src={c.avatar} />
                  <AvatarFallback>{(c.name ?? "?")[0]}</AvatarFallback>
                </ConvAvatar>
                <ConvMain>
                  <ConvName>{c.name}</ConvName>
                  <ConvPreview>{line}</ConvPreview>
                </ConvMain>
              </ConversationRow>
            );
          })
        )}
      </ListScroll>
    </Root>
  );
}
