"use client";

import type React from "react";
import orderBy from "lodash/orderBy";
import {
  Search,
  MoreVertical,
  Phone,
  Users,
  UserPlus,
  Star,
  Wifi,
  WifiOff,
  Settings,
  Archive,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { ContactListItem } from "@/chat/components/contact-list-item";
import { SearchSuggestions } from "@/search/search-suggestions";
import type { Contact, User } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

const SidebarRoot = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  background-color: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
`;

const SidebarHeader = styled.div`
  background-color: hsl(var(--card));
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(156 163 175);
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
  background-color: hsl(var(--background));
`;

const EmptyState = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const ScrollAreaFlex = styled(ScrollArea)`
  flex: 1;
  min-height: 0;
`;

interface SidebarProps {
  user: User | null;
  contacts: Contact[];
  selectedContact: Contact | null;
  searchQuery: string;
  isConnected: boolean;
  showSearchSuggestions: boolean;
  recentSearches: string[];
  onContactSelect: (contact: Contact) => void;
  onContactAction: (action: string, contact: Contact) => void;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onGlobalSearch: (query: string) => void;
  onSearchSuggestion: (suggestion: any) => void;
  onRemoveRecentSearch: (search: string) => void;
  onProfileClick: () => void;
  onStatusClick: () => void;
  onCallsClick: () => void;
  onAddFriendClick: () => void;
  onCreateGroupClick: () => void;
  onSearchPageClick: () => void;
  onAdvancedSearchClick: () => void;
  onStarredClick: () => void;
  onSettingsClick: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function Sidebar({
  user,
  contacts = [],
  selectedContact,
  searchQuery = "",
  isConnected = false,
  showSearchSuggestions = false,
  recentSearches = [],
  onContactSelect,
  onContactAction,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onGlobalSearch,
  onSearchSuggestion,
  onRemoveRecentSearch,
  onProfileClick,
  onStatusClick,
  onCallsClick,
  onAddFriendClick,
  onCreateGroupClick,
  onSearchPageClick,
  onAdvancedSearchClick,
  onStarredClick,
  onSettingsClick,
  searchInputRef,
}: SidebarProps) {
  const filteredContacts = contacts.filter((contact) => {
    if (!contact) return false;

    const name = contact.name || "";
    const lastMessage = contact.lastMessage || "";
    const query = searchQuery || "";

    return (
      name.toLowerCase().includes(query.toLowerCase()) ||
      lastMessage.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <SidebarRoot>
      <SidebarHeader>
        <HeaderRow>
          <HeaderLeft>
            <Avatar onClick={onProfileClick}>
              <AvatarImage
                src={
                  user?.avatar || "/placeholder.svg?height=40&width=40&text=我"
                }
              />
              <AvatarFallback>{user?.name?.[0] || "我"}</AvatarFallback>
            </Avatar>
            <ConnectionStatus>
              {isConnected ? (
                <Wifi size={16} color="#22c55e" />
              ) : (
                <WifiOff size={16} color="#ef4444" />
              )}
              <span>{isConnected ? "已连接" : "连接中..."}</span>
            </ConnectionStatus>
          </HeaderLeft>
          <ActionsRow>
            <Button variant="ghost" size="icon" onClick={onStatusClick}>
              <Users size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCallsClick}>
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onAddFriendClick}>
              <UserPlus size={16} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCreateGroupClick}>
                  <Users size={16} style={{ marginRight: 8 }} />
                  新建群组
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSearchPageClick}>
                  <Search size={16} style={{ marginRight: 8 }} />
                  搜索消息
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAdvancedSearchClick}>
                  <Filter size={16} style={{ marginRight: 8 }} />
                  高级搜索
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onStarredClick}>
                  <Star size={16} style={{ marginRight: 8 }} />
                  星标消息
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive size={16} style={{ marginRight: 8 }} />
                  已归档
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick}>
                  <Settings size={16} style={{ marginRight: 8 }} />
                  设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ActionsRow>
        </HeaderRow>

        <SearchContainer>
          <SearchIconWrapper>
            <Search size={16} />
          </SearchIconWrapper>
          <SearchInput
            ref={searchInputRef}
            placeholder="搜索或开始新聊天"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onGlobalSearch(searchQuery);
              }
            }}
          />

          {showSearchSuggestions && (
            <SearchSuggestions
              query={searchQuery}
              contacts={contacts}
              recentSearches={recentSearches}
              onSelect={onSearchSuggestion}
              onRemoveRecent={onRemoveRecentSearch}
              onAdvancedSearch={onAdvancedSearchClick}
            />
          )}
        </SearchContainer>
      </SidebarHeader>

      <ScrollAreaFlex>
        {filteredContacts.length === 0 ? (
          <EmptyState>
            {searchQuery ? "未找到匹配的联系人" : "暂无联系人"}
          </EmptyState>
        ) : (
          orderBy(
            filteredContacts,
            [(contact) => Boolean(contact.pinned)],
            ["desc"],
          ).map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContact?.id === contact.id}
              onSelect={onContactSelect}
              onAction={onContactAction}
            />
          ))
        )}
      </ScrollAreaFlex>
    </SidebarRoot>
  );
}
