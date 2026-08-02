"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  ImageIcon,
  Video,
  Mic,
  File,
} from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/shared/ui/instagram-spinner";
import type { Contact, Message } from "@/shared/types";

interface MessageSearchPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  allMessages: Array<{
    contactId: string;
    messages: Message[];
  }>;
  contacts: Contact[];
  onSelectMessage: (contactId: string, messageId: string) => void;
}

interface SearchResult {
  message: Message;
  contact: Contact;
  matchedText: string;
}

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgb(229 231 235);
`;

const HeaderSearchWrap = styled.div`
  flex: 1;
`;

const SearchWrap = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  width: 1rem;
  color: rgb(156 163 175);
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

const ArrowIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
`;

const FilterIcon = styled(Filter)`
  height: 1.25rem;
  width: 1.25rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid rgb(229 231 235);
  overflow-x: auto;
`;

const FilterBtn = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
`;

const Body = styled(ScrollArea)`
  flex: 1;
`;

const BodyInner = styled.div`
  padding: 1rem;
`;

const SpinnerWrap = styled(InstagramSpinnerWrap)`
  padding: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: rgb(107 114 128);
`;

const EmptyIcon = styled(Search)`
  height: 4rem;
  width: 4rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ResultsCount = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultCard = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(249 250 251);
  }
`;

const ResultRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ResultMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const ContactName = styled.p`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgb(107 114 128);
`;

const MetaTime = styled.span`
  font-size: 0.75rem;
`;

const ResultContent = styled.div`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const ResultExcerpt = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SenderName = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  margin-top: 0.25rem;
`;

const MediaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AvatarSmall = styled(Avatar)`
  height: 2.5rem;
  width: 2.5rem;
`;

const GroupBadge = styled(Badge)`
  font-size: 0.75rem;
`;

export function MessageSearchPage({
  isOpen,
  onClose,
  initialQuery = "",
  allMessages,
  contacts,
  onSelectMessage,
}: MessageSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filters = [
    { id: "all", name: "全部", icon: Search },
    { id: "text", name: "文本", icon: FileText },
    { id: "image", name: "图片", icon: ImageIcon },
    { id: "video", name: "视频", icon: Video },
    { id: "audio", name: "语音", icon: Mic },
    { id: "file", name: "文件", icon: File },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilter]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results: SearchResult[] = [];

    allMessages.forEach(({ contactId, messages }) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      messages.forEach((message) => {
        if (selectedFilter !== "all" && message.type !== selectedFilter) return;
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            message,
            contact,
            matchedText: highlightMatch(message.content, query),
          });
        }
      });
    });

    const timeMs = (t: string | Date | undefined) =>
      t == null ? 0 : new Date(t).getTime();
    results.sort(
      (a, b) => timeMs(b.message.timestamp) - timeMs(a.message.timestamp),
    );

    setSearchResults(results);
    setIsSearching(false);
  };

  const highlightMatch = (text: string, query: string): string => {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const formatDate = (date: string | Date | undefined) => {
    if (date == null) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return messageDate.toLocaleDateString("zh-CN");
    }
  };

  const getMessageTypeIcon = (type: string) => {
    const size = 16;
    switch (type) {
      case "image":
        return <ImageIcon size={size} />;
      case "video":
        return <Video size={size} />;
      case "audio":
        return <Mic size={size} />;
      case "file":
        return <File size={size} />;
      default:
        return <FileText size={size} />;
    }
  };

  if (!isOpen) return null;

  return (
    <PageRoot>
      <Header>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowIcon />
        </Button>
        <HeaderSearchWrap>
          <SearchWrap>
            <SearchIcon />
            <SearchInput
              placeholder="搜索消息..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrap>
        </HeaderSearchWrap>
        <Button variant="ghost" size="icon">
          <FilterIcon />
        </Button>
      </Header>

      <FiltersRow>
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          const isSelected = selectedFilter === filter.id;
          return (
            <FilterBtn
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
            >
              <IconComponent size={16} />
              {filter.name}
            </FilterBtn>
          );
        })}
      </FiltersRow>

      <Body>
        <BodyInner>
          {isSearching ? (
            <SpinnerWrap>
              <InstagramSpinnerRing $size={32} />
              <InstagramSpinnerText>搜索中...</InstagramSpinnerText>
            </SpinnerWrap>
          ) : searchQuery.trim() === "" ? (
            <EmptyState>
              <EmptyIcon />
              <EmptyTitle>搜索消息</EmptyTitle>
              <p>输入关键词搜索聊天记录</p>
            </EmptyState>
          ) : searchResults.length === 0 ? (
            <EmptyState>
              <EmptyIcon />
              <EmptyTitle>没有找到结果</EmptyTitle>
              <p>尝试使用其他关键词</p>
            </EmptyState>
          ) : (
            <>
              <ResultsHeader>
                <ResultsCount>
                  找到 {searchResults.length} 条相关消息
                </ResultsCount>
              </ResultsHeader>

              <ResultsList>
                {searchResults.map((result, index) => (
                  <ResultCard
                    key={`${result.message.id}-${index}`}
                    onClick={() =>
                      onSelectMessage(result.contact.id, result.message.id)
                    }
                  >
                    <ResultRow>
                      <AvatarSmall>
                        <AvatarImage
                          src={result.contact.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {result.contact.name[0]}
                        </AvatarFallback>
                      </AvatarSmall>
                      <ResultMain>
                        <ResultTop>
                          <ContactName>{result.contact.name}</ContactName>
                          {result.contact.isGroup && (
                            <GroupBadge variant="secondary">群组</GroupBadge>
                          )}
                          <MetaRow>
                            {getMessageTypeIcon(result.message.type)}
                            <MetaTime>
                              {formatDate(result.message.timestamp)}
                            </MetaTime>
                          </MetaRow>
                        </ResultTop>
                        <ResultContent>
                          {result.message.type === "text" ? (
                            <ResultExcerpt
                              dangerouslySetInnerHTML={{
                                __html: result.matchedText,
                              }}
                            />
                          ) : (
                            <MediaRow>
                              {getMessageTypeIcon(result.message.type)}
                              <span>{result.message.content}</span>
                            </MediaRow>
                          )}
                        </ResultContent>
                        {result.message.senderName &&
                          result.contact.isGroup && (
                            <SenderName>{result.message.senderName}</SenderName>
                          )}
                      </ResultMain>
                    </ResultRow>
                  </ResultCard>
                ))}
              </ResultsList>
            </>
          )}
        </BodyInner>
      </Body>
    </PageRoot>
  );
}
