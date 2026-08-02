"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Forward,
  Star,
  Info,
  Play,
  Download,
  FileText,
} from "lucide-react";
import type { Message } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
  isOwn?: boolean;
  showAvatar?: boolean;
  sameSenderAbove?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onStar?: (messageId: string) => void;
  onInfo?: (message: Message) => void;
}

const Row = styled.div<{ $isSent: boolean; $compactTop?: boolean }>`
  display: flex;
  align-items: flex-end;
  column-gap: 0.5rem;
  margin-top: ${(p) => (p.$compactTop ? "2px" : "0.5rem")};
  ${({ $isSent }) =>
    $isSent
      ? `
    flex-direction: row-reverse;
  `
      : `
    flex-direction: row;
  `}
`;

const Bubble = styled.div<{ $isSent: boolean }>`
  position: relative;
  max-width: 20rem;
  border-radius: 1.125rem;
  padding: 0.5rem 0.875rem;
  ${({ $isSent }) =>
    $isSent
      ? `
    background-color: rgb(0 149 246);
    color: rgb(255 255 255);
    border-bottom-right-radius: 4px;
  `
      : `
    background-color: rgb(239 239 239);
    color: rgb(38 38 38);
    border-bottom-left-radius: 4px;
  `}

  @media (min-width: 1024px) {
    max-width: 28rem;
  }
`;

const GroupSender = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(75 85 99);
  margin-bottom: 0.25rem;
`;

const TextContent = styled.p`
  font-size: 0.875rem;
`;

const EditedMark = styled.span`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  font-style: italic;
  margin-left: 0.25rem;
`;

const TimeRow = styled.div<{ $isSent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 0.25rem;
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  ${({ $isSent }) =>
    $isSent
      ? `
    color: rgb(255 255 255 / 0.85);
  `
      : `
    color: rgb(107 114 128);
  `}
`;

const StatusIcons = styled.div`
  display: flex;
`;

const ReadIcon = styled.span`
  color: #60a5fa;
`;

const ReplyIconWrap = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
`;

const DeleteMenuItem = styled(DropdownMenuItem)`
  color: rgb(220 38 38);
`;

const ImageWrapper = styled.div`
  position: relative;
  max-width: 16rem;
`;

const ImageElement = styled.img`
  width: 100%;
  border-radius: 0.75rem;
`;

const ImageTimeBadge = styled.div`
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  background-color: rgb(0 0 0 / 0.5);
  color: white;
`;

const VideoElement = styled.video`
  width: 100%;
  max-width: 16rem;
  border-radius: 0.75rem;
`;

const VideoThumb = styled.div`
  max-width: 16rem;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(229 231 235);
`;

const AudioWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
  max-width: 16rem;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background-color: rgb(243 244 246);
`;

const AudioBar = styled.div`
  flex: 1;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: rgb(209 213 219);
  overflow: hidden;
`;

const AudioProgress = styled.div`
  width: 33%;
  height: 100%;
  border-radius: inherit;
  background-color: #3b82f6;
`;

const AudioTime = styled.span`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const FileWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.75rem;
  max-width: 16rem;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background-color: rgb(243 244 246);
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
`;

const FileMeta = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const MenuTriggerButton = styled(Button)<{ $isSent: boolean }>`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  height: 1.5rem;
  width: 1.5rem;
  padding: 0;
  opacity: 0;
  border-radius: 9999px;
  transition: opacity 0.15s ease;
  ${({ $isSent }) =>
    $isSent
      ? `
    background-color: #16a34a;
    color: white;
  `
      : `
    background-color: rgb(243 244 246);
  `}

  ${Row}:hover & {
    opacity: 1;
  }
`;

export function MessageBubble({
  message,
  isGroup = false,
  isOwn,
  showAvatar,
  sameSenderAbove = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isSent =
    isOwn !== undefined
      ? isOwn
      : message.senderId === "current-user" || message.senderId === "me";

  const formatTime = (timestamp: string | Date | undefined) => {
    if (timestamp == null) return "";
    const d = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <ImageWrapper>
            <ImageElement
              src="/placeholder.svg?height=200&width=300&text=图片"
              alt="图片消息"
            />
            <ImageTimeBadge>{formatTime(message.timestamp)}</ImageTimeBadge>
          </ImageWrapper>
        );
      case "video":
        return (
          <ImageWrapper>
            {message.mediaUrl ? (
              <VideoElement src={message.mediaUrl} controls />
            ) : (
              <VideoThumb>
                <Play size={32} color="#4b5563" />
              </VideoThumb>
            )}
            <ImageTimeBadge>{formatTime(message.timestamp)}</ImageTimeBadge>
          </ImageWrapper>
        );
      case "audio":
        return (
          <AudioWrapper>
            <Button size="sm" variant="ghost">
              <Play size={16} />
            </Button>
            <AudioBar>
              <AudioProgress />
            </AudioBar>
            <AudioTime>0:30</AudioTime>
          </AudioWrapper>
        );
      case "file":
        return (
          <FileWrapper>
            <FileText size={32} color="#4b5563" />
            <FileInfo>
              <FileTitle>{message.fileName || "文件"}</FileTitle>
              <FileMeta>{message.fileSize || "未知大小"}</FileMeta>
            </FileInfo>
            <Button size="sm" variant="ghost">
              <Download size={16} />
            </Button>
          </FileWrapper>
        );
      default:
        return (
          <div>
            <TextContent>{message.content}</TextContent>
            {message.isEdited && <EditedMark>已编辑</EditedMark>}
          </div>
        );
    }
  };

  return (
    <Row $isSent={isSent} $compactTop={sameSenderAbove}>
      {/* Avatar for received messages in groups */}
      {!isSent && isGroup && (
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32&text=头像" />
          <AvatarFallback>{message.senderName?.[0] || "U"}</AvatarFallback>
        </Avatar>
      )}

      <Bubble $isSent={isSent}>
        {/* Sender name for group messages */}
        {!isSent && isGroup && <GroupSender>{message.senderName}</GroupSender>}

        {/* Message content */}
        {renderMessageContent()}

        {/* Message time and status */}
        {message.type === "text" && (
          <TimeRow $isSent={isSent}>
            <span>{formatTime(message.timestamp)}</span>
            {isSent && (
              <StatusIcons>
                {message.status === "sent" && <span>✓</span>}
                {message.status === "delivered" && <span>✓✓</span>}
                {message.status === "read" && <ReadIcon>✓✓</ReadIcon>}
              </StatusIcons>
            )}
          </TimeRow>
        )}

        <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
          <DropdownMenuTrigger asChild>
            <MenuTriggerButton variant="ghost" size="sm" $isSent={isSent}>
              <MoreVertical size={12} />
            </MenuTriggerButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReply && onReply(message)}>
              <ReplyIconWrap>
                <Reply size={16} />
              </ReplyIconWrap>
              回复
            </DropdownMenuItem>
            {isSent && message.type === "text" && (
              <DropdownMenuItem
                onClick={() => onEdit && onEdit(message.id, message.content)}
              >
                <Edit size={16} style={{ marginRight: 8 }} />
                编辑
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onForward && onForward(message)}>
              <Forward size={16} style={{ marginRight: 8 }} />
              转发
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStar && onStar(message.id)}>
              <Star size={16} style={{ marginRight: 8 }} />
              收藏
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInfo && onInfo(message)}>
              <Info size={16} style={{ marginRight: 8 }} />
              信息
            </DropdownMenuItem>
            {isSent && (
              <DeleteMenuItem onClick={() => onDelete && onDelete(message.id)}>
                <Trash2 size={16} style={{ marginRight: 8 }} />
                删除
              </DeleteMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Bubble>
    </Row>
  );
}
