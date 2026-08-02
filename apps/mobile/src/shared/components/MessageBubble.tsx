import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message, MessageType, MessageStatus } from "@/chat/message.model";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showSenderName?: boolean;
  showAvatar?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
}

const Row = styled.View<{ isMe: boolean }>`
  flex-direction: row;
  margin-vertical: 2px;
  margin-horizontal: 4px;
  align-items: flex-end;
  justify-content: ${(p) => (p.isMe ? "flex-end" : "flex-start")};
`;

const Avatar = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const AvatarText = styled.Text`
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
`;

const MessageWrapper = styled.View`
  flex: 1;
  max-width: 78%;
`;

const ReplyIndicator = styled.View`
  margin-bottom: 8px;
  padding: 8px;
  background-color: rgba(128, 128, 128, 0.2);
  border-radius: 12px;
  flex-direction: row;
`;

const ReplyBorder = styled.View`
  width: 3px;
  margin-right: 8px;
  border-radius: 2px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const ReplyContent = styled.View`
  flex: 1;
`;

const ReplyLabel = styled.Text`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  color: ${(p) => p.theme.colors.primaryGreen};
`;

const ReplyText = styled.Text`
  font-size: 12px;
  color: #808080;
`;

const Bubble = styled.View<{ isMe: boolean }>`
  padding: 10px 14px 8px 14px;
  background-color: ${(p) =>
    p.isMe
      ? p.theme.colors.myMessageBubble
      : p.theme.colors.otherMessageBubble};
  border-radius: 18px;
`;

const SenderName = styled.Text`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(p) => p.theme.colors.primaryGreen};
`;

const MessageText = styled.Text`
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: ${(p: {
    isMe: boolean;
    isDark?: boolean;
    theme?: { colors: { primaryText: string } };
  }) =>
    p.isMe
      ? p.isDark
        ? "#FFFFFF"
        : "#111B21"
      : (p.theme?.colors?.primaryText ?? "#000000")};
`;

const ImageMessage = styled.Image`
  width: 200px;
  height: 200px;
  border-radius: 12px;
`;

const VideoContainer = styled.View`
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
`;

const VideoThumbnail = styled.Image`
  width: 100%;
  height: 100%;
`;

const VideoOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
`;

const VideoDuration = styled.View`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 8px;
`;

const DurationText = styled.Text`
  color: #ffffff;
  font-size: 12px;
`;

const MediaRow = styled.View`
  width: 200px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
`;

const MediaIcon = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const FileIcon = styled(MediaIcon)`
  border-radius: 8px;
`;

const LocationIcon = styled(MediaIcon)`
  background-color: ${(p) => p.theme.colors.iosRed};
`;

const MediaInfo = styled.View`
  flex: 1;
`;

const MediaLabel = styled.Text`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
`;

const MediaMeta = styled.Text`
  font-size: 12px;
  color: #808080;
`;

const SystemContainer = styled.View`
  padding: 6px 12px;
  background-color: rgba(128, 128, 128, 0.2);
  border-radius: 12px;
`;

const SystemText = styled.Text`
  font-size: 13px;
  color: #808080;
  font-style: italic;
  text-align: center;
`;

const MessageInfo = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-end;
  margin-top: 4px;
  gap: 4px;
`;

const TimeText = styled.Text`
  font-size: 11px;
  color: ${(p: { isMe?: boolean; isDark?: boolean }) =>
    p.isMe
      ? p.isDark
        ? "rgba(255,255,255,0.85)"
        : "rgba(17,27,33,0.6)"
      : "rgba(0,0,0,0.45)"};
`;

function formatTime(timestamp: Date): string {
  const now = new Date();
  const hour = timestamp.getHours();
  const minute = timestamp.getMinutes();
  if (
    now.getDate() === timestamp.getDate() &&
    now.getMonth() === timestamp.getMonth() &&
    now.getFullYear() === timestamp.getFullYear()
  ) {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }
  return `${timestamp.getMonth() + 1}/${timestamp.getDate()} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showSenderName = false,
  showAvatar = false,
  onTap,
  onLongPress,
}) => {
  const { colors, isDark } = useTheme();
  const sentStatusColor = isDark
    ? "rgba(255,255,255,0.85)"
    : "rgba(17,27,33,0.6)";

  const renderMessageStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.Sent:
        return <Ionicons name="checkmark" size={12} color={sentStatusColor} />;
      case MessageStatus.Delivered:
        return (
          <Ionicons name="checkmark-done" size={12} color={sentStatusColor} />
        );
      case MessageStatus.Read:
        return (
          <Ionicons
            name="checkmark-done"
            size={12}
            color={colors.deliveredColor}
          />
        );
      case MessageStatus.Failed:
        return <Ionicons name="alert-circle" size={12} color={colors.iosRed} />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.Text:
        return (
          <MessageText isMe={isMe} isDark={isDark}>
            {message.content}
          </MessageText>
        );
      case MessageType.Image:
        return (
          <ImageMessage
            source={{ uri: message.fileUrl || message.content }}
            resizeMode="cover"
          />
        );
      case MessageType.Video:
        return (
          <VideoContainer>
            <VideoThumbnail
              source={{
                uri: message.thumbnailUrl || message.fileUrl || message.content,
              }}
              resizeMode="cover"
            />
            <VideoOverlay>
              <Ionicons name="play-circle" size={48} color="#FFFFFF" />
            </VideoOverlay>
            {message.duration && (
              <VideoDuration>
                <DurationText>{formatDuration(message.duration)}</DurationText>
              </VideoDuration>
            )}
          </VideoContainer>
        );
      case MessageType.Audio:
      case MessageType.Voice:
        return (
          <MediaRow>
            <MediaIcon>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </MediaIcon>
            <MediaInfo>
              <MediaLabel>
                {message.type === MessageType.Voice ? "语音消息" : "音频文件"}
              </MediaLabel>
              <MediaMeta>
                {message.duration ? formatDuration(message.duration) : "00:00"}
              </MediaMeta>
            </MediaInfo>
          </MediaRow>
        );
      case MessageType.File:
        return (
          <MediaRow>
            <FileIcon>
              <Ionicons name="document" size={16} color="#FFFFFF" />
            </FileIcon>
            <MediaInfo>
              <MediaLabel numberOfLines={1}>
                {message.fileName || "文件"}
              </MediaLabel>
              <MediaMeta>
                {message.fileSize != null
                  ? formatFileSize(Number(message.fileSize))
                  : "未知大小"}
              </MediaMeta>
            </MediaInfo>
          </MediaRow>
        );
      case MessageType.Location:
        return (
          <MediaRow>
            <LocationIcon>
              <Ionicons name="location" size={16} color="#FFFFFF" />
            </LocationIcon>
            <MediaInfo>
              <MediaLabel>位置</MediaLabel>
              <MediaMeta numberOfLines={1}>
                {message.locationName || "未知位置"}
              </MediaMeta>
            </MediaInfo>
          </MediaRow>
        );
      case MessageType.System:
        return (
          <SystemContainer>
            <SystemText>{message.content}</SystemText>
          </SystemContainer>
        );
      default:
        return (
          <MessageText isMe={isMe} isDark={isDark}>
            {message.content}
          </MessageText>
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onTap}
      onLongPress={onLongPress}
    >
      <Row isMe={isMe}>
        {!isMe && showAvatar && (
          <Avatar>
            <AvatarText>
              {message.senderName?.[0]?.toUpperCase() || "U"}
            </AvatarText>
          </Avatar>
        )}
        <MessageWrapper>
          {message.replyToId && (
            <ReplyIndicator>
              <ReplyBorder />
              <ReplyContent>
                <ReplyLabel>回复</ReplyLabel>
                <ReplyText numberOfLines={2}>
                  {message.replyToContent || ""}
                </ReplyText>
              </ReplyContent>
            </ReplyIndicator>
          )}
          <Bubble isMe={isMe}>
            {!isMe && showSenderName && message.type !== MessageType.System && (
              <SenderName>{message.senderName}</SenderName>
            )}
            {renderMessageContent()}
            <MessageInfo>
              <TimeText isMe={isMe} isDark={isDark}>
                {formatTime(message.timestamp)}
              </TimeText>
              {isMe && renderMessageStatusIcon()}
            </MessageInfo>
          </Bubble>
        </MessageWrapper>
      </Row>
    </TouchableOpacity>
  );
};
