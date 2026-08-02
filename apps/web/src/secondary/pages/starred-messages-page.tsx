"use client";

import { useState } from "react";
import { ArrowLeft, Star, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { MessageBubble } from "@/chat/components/message-bubble";
import { styled } from "@/src/shared/utils/emotion";
import type { Message } from "@/shared/types";

interface StarredMessage extends Message {
  chatName: string;
  chatAvatar: string;
}

interface StarredMessagesPageProps {
  onBack: () => void;
}

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const Header = styled.div`
  background-color: #16a34a;
  color: white;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const BackBtn = styled(Button)`
  color: white;

  &:hover {
    background-color: #15803d;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 500;
`;

const ArrowIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
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
  background-color: rgb(255 255 255 / 0.1);
  border-color: rgb(255 255 255 / 0.2);
  color: white;

  &::placeholder {
    color: rgb(255 255 255 / 0.7);
  }
`;

const ListArea = styled(ScrollArea)`
  flex: 1;
`;

const ListInner = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const SmallAvatar = styled(Avatar)`
  height: 1.5rem;
  width: 1.5rem;
`;

const SmallFallback = styled(AvatarFallback)`
  font-size: 0.75rem;
`;

const StarIcon = styled(Star)`
  height: 0.75rem;
  width: 0.75rem;
  color: rgb(234 179 8);
  fill: currentColor;
  margin-left: auto;
`;

const MessageContent = styled.div`
  margin-left: 2rem;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyInner = styled.div`
  text-align: center;
`;

const EmptyStarIcon = styled(Star)`
  height: 4rem;
  width: 4rem;
  color: rgb(209 213 219);
  margin: 0 auto 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  color: rgb(75 85 99);
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: rgb(107 114 128);
`;

export function StarredMessagesPage({ onBack }: StarredMessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [starredMessages] = useState<StarredMessage[]>([
    {
      id: "1",
      content: "记得明天的会议时间是下午2点",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      senderId: "user1",
      senderName: "张三",
      type: "text",
      status: "read",
      chatName: "张三",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=张",
    },
    {
      id: "2",
      content: "这个项目的截止日期是下周五",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      senderId: "user2",
      senderName: "李四",
      type: "text",
      status: "read",
      chatName: "李四",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=李",
    },
    {
      id: "3",
      content: "/placeholder.svg?height=200&width=300&text=重要图片",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      senderId: "user3",
      senderName: "王五",
      type: "image",
      status: "read",
      chatName: "工作群",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=工",
    },
    {
      id: "4",
      content: "生日聚会地址：中山路123号",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      senderId: "user4",
      senderName: "赵六",
      type: "text",
      status: "read",
      chatName: "王五",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=王",
    },
  ]);

  const filteredMessages = starredMessages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.chatName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (timestamp: string | Date | undefined) => {
    if (timestamp == null) return "";
    const now = new Date();
    const ts = new Date(timestamp);
    if (Number.isNaN(ts.getTime())) return "";
    const diffInDays = Math.floor(
      (now.getTime() - ts.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return "今天";
    } else if (diffInDays === 1) {
      return "昨天";
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return ts.toLocaleDateString();
    }
  };

  return (
    <PageRoot>
      <Header>
        <HeaderRow>
          <BackBtn variant="ghost" size="icon" onClick={onBack}>
            <ArrowIcon />
          </BackBtn>
          <Title>星标消息</Title>
        </HeaderRow>

        <SearchWrap>
          <SearchIcon />
          <SearchInput
            placeholder="搜索星标消息"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrap>
      </Header>

      <ListArea>
        {filteredMessages.length > 0 ? (
          <ListInner>
            {filteredMessages.map((message) => (
              <MessageBlock key={message.id}>
                <MetaRow>
                  <SmallAvatar>
                    <AvatarImage
                      src={message.chatAvatar || "/placeholder.svg"}
                    />
                    <SmallFallback>{message.chatName[0]}</SmallFallback>
                  </SmallAvatar>
                  <span>{message.chatName}</span>
                  <span>•</span>
                  <span>{formatDate(message.timestamp)}</span>
                  <StarIcon />
                </MetaRow>

                <MessageContent>
                  <MessageBubble
                    message={message}
                    isOwn={false}
                    showAvatar={false}
                  />
                </MessageContent>
              </MessageBlock>
            ))}
          </ListInner>
        ) : (
          <EmptyState>
            <EmptyInner>
              <EmptyStarIcon />
              <EmptyTitle>没有星标消息</EmptyTitle>
              <EmptyText>
                {searchQuery
                  ? "没有找到匹配的星标消息"
                  : "点击消息旁的星标图标来收藏重要消息"}
              </EmptyText>
            </EmptyInner>
          </EmptyState>
        )}
      </ListArea>
    </PageRoot>
  );
}
