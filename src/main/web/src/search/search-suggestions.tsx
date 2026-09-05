"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Clock, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { styled } from "@/src/shared/utils/emotion";
import type { Contact } from "@/shared/types";
import { useLongPress } from "@/shared/use-long-press";

interface SearchSuggestion {
  id: string;
  type: "contact" | "recent" | "hashtag" | "command";
  title: string;
  subtitle?: string;
  avatar?: string;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  query: string;
  contacts: Contact[];
  recentSearches: string[];
  onSelect: (suggestion: SearchSuggestion) => void;
  onClearRecentSearches?: () => void;
  onRemoveRecent?: (search: string) => void;
  onAdvancedSearch?: () => void;
}

const Root = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgb(229 231 235);
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  z-index: 50;
  max-height: 20rem;
  overflow: hidden;
`;

const ScrollRoot = styled(ScrollArea)`
  max-height: 20rem;
`;

const Inner = styled.div`
  padding: 0.5rem 0;
`;

const RecentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
`;

const RecentLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(75 85 99);
`;

const ClearBtn = styled(Button)`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  height: 1.5rem;
`;

const SuggestionRow = styled.div<{ $hovered?: boolean; $longPress?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  background: ${(p) =>
    p.$longPress
      ? "rgb(254 226 226)"
      : p.$hovered
        ? "rgb(243 244 246)"
        : "transparent"};
  transform: ${(p) => (p.$longPress ? "scale(0.98)" : "none")};

  &:hover {
    background: ${(p) =>
      p.$longPress ? "rgb(254 226 226)" : "rgb(249 250 251)"};
  }
`;

const IconBox = styled.div`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(156 163 175);
`;

const SuggestionMain = styled.div`
  flex: 1;
  text-align: left;
  min-width: 0;
`;

const SuggestionTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(17 24 31);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SuggestionSubtitle = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AvatarSmall = styled(Avatar)`
  height: 2rem;
  width: 2rem;
`;

const FallbackSmall = styled(AvatarFallback)`
  font-size: 0.875rem;
`;

const LongPressHint = styled.div`
  font-size: 0.75rem;
  color: rgb(156 163 175);
`;

const ClockIcon = styled(Clock)`
  height: 1rem;
  width: 1rem;
`;

const HashIcon = styled(Hash)`
  height: 1rem;
  width: 1rem;
`;

const SearchIcon = styled(Search)`
  height: 1rem;
  width: 1rem;
`;

export function SearchSuggestions({
  query,
  contacts,
  recentSearches,
  onSelect,
  onClearRecentSearches,
  onRemoveRecent,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [longPressIndex, setLongPressIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressEvents = useLongPress({
    onLongPress: (index: number, suggestion: SearchSuggestion) => {
      setLongPressIndex(index);
      if (suggestion.type === "recent" && onRemoveRecent) {
        onRemoveRecent(suggestion.title);
      }
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    onPress: (suggestion: SearchSuggestion) => onSelect(suggestion),
    delay: 500,
  });

  useEffect(() => {
    const newSuggestions: SearchSuggestion[] = [];

    if (!query.trim()) {
      recentSearches.slice(0, 5).forEach((search, index) => {
        newSuggestions.push({
          id: `recent-${index}`,
          type: "recent",
          title: search,
          icon: <ClockIcon />,
        });
      });

      const commands = [
        { id: "from", title: "from:", subtitle: "搜索特定联系人的消息" },
        { id: "type", title: "type:", subtitle: "按消息类型搜索" },
        { id: "date", title: "date:", subtitle: "按日期搜索" },
      ];

      commands.forEach((cmd) => {
        newSuggestions.push({
          id: `command-${cmd.id}`,
          type: "command",
          title: cmd.title,
          subtitle: cmd.subtitle,
          icon: <HashIcon />,
        });
      });
    } else {
      const matchingContacts = contacts
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      matchingContacts.forEach((contact) => {
        newSuggestions.push({
          id: `contact-${contact.id}`,
          type: "contact",
          title: contact.name,
          subtitle: contact.isGroup
            ? `群组 • ${contact.memberCount} 位成员`
            : "联系人",
          avatar: contact.avatar,
        });
      });

      if (query.length >= 2) {
        [
          `在所有聊天中搜索 "${query}"`,
          `在图片中搜索 "${query}"`,
          `在文件中搜索 "${query}"`,
        ].forEach((title, index) => {
          newSuggestions.push({
            id: `search-${index}`,
            type: "command",
            title,
            icon: <SearchIcon />,
          });
        });
      }
    }

    setSuggestions(newSuggestions);
    setHoveredIndex(-1);
  }, [query, contacts, recentSearches]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHoveredIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHoveredIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (hoveredIndex >= 0 && hoveredIndex < suggestions.length) {
            onSelect(suggestions[hoveredIndex]);
          }
          break;
        case "Escape":
          setHoveredIndex(-1);
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, hoveredIndex, onSelect]);

  if (suggestions.length === 0) return null;

  return (
    <Root ref={containerRef}>
      <ScrollRoot>
        <Inner>
          {!query.trim() && recentSearches.length > 0 && (
            <>
              <RecentHeader>
                <RecentLabel>最近搜索</RecentLabel>
                <ClearBtn
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecentSearches}
                  disabled={!onClearRecentSearches}
                >
                  清除
                </ClearBtn>
              </RecentHeader>
              <Separator />
            </>
          )}

          {suggestions.map((suggestion, index) => (
            <div key={suggestion.id}>
              <SuggestionRow
                $hovered={hoveredIndex === index}
                $longPress={longPressIndex === index}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() =>
                  longPressEvents.onPress && longPressEvents.onPress(suggestion)
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (
                    suggestion.type === "recent" &&
                    onRemoveRecent &&
                    longPressEvents.onLongPress
                  ) {
                    longPressEvents.onLongPress(index, suggestion);
                  }
                }}
              >
                {suggestion.avatar ? (
                  <AvatarSmall>
                    <AvatarImage
                      src={suggestion.avatar || "/placeholder.svg"}
                    />
                    <FallbackSmall>{suggestion.title[0]}</FallbackSmall>
                  </AvatarSmall>
                ) : (
                  <IconBox>{suggestion.icon}</IconBox>
                )}
                <SuggestionMain>
                  <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                  {suggestion.subtitle && (
                    <SuggestionSubtitle>
                      {suggestion.subtitle}
                    </SuggestionSubtitle>
                  )}
                </SuggestionMain>
                {suggestion.type === "recent" && (
                  <LongPressHint>长按删除</LongPressHint>
                )}
              </SuggestionRow>
              {index < suggestions.length - 1 &&
                suggestion.type !== suggestions[index + 1]?.type && (
                  <Separator />
                )}
            </div>
          ))}
        </Inner>
      </ScrollRoot>
    </Root>
  );
}
