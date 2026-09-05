import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Chat } from "@/chat/chat.model";
import { ChatAvatar } from "./ChatAvatar";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
  onCameraPress?: () => void;
  onAvatarPress?: () => void;
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const AvatarButton = styled.TouchableOpacity`
  padding: 0;
`;

const ContentButton = styled.Pressable`
  flex: 1;
  margin-left: 12px;
  justify-content: center;
  min-width: 0;
`;

const Name = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
`;

const SubtitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  min-width: 0;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  flex: 1;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Badge = styled.View`
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  justify-content: center;
  align-items: center;
  margin-left: 6px;
  padding-horizontal: 5px;
  background-color: ${(p) => p.theme.colors.buttonPrimary};
`;

const BadgeText = styled.Text`
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
`;

const CameraButton = styled.TouchableOpacity`
  padding: 8px 0 8px 12px;
  justify-content: center;
  align-items: center;
`;

function resolveLastTime(chat: Chat): Date | undefined {
  const raw = chat.lastMessageTime;
  if (!raw) return undefined;
  return raw instanceof Date ? raw : new Date(raw);
}

function buildSubtitle(
  chat: Chat,
  t: (k: string, o?: Record<string, unknown>) => string,
): string {
  const preview = chat.lastMessageContent?.trim();
  if (preview) return preview;
  const ts = resolveLastTime(chat);
  if (!ts) return "";
  const now = new Date();
  const diff = now.getTime() - ts.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "";
  if (days === 0) {
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 2) return t("chats.activeNow");
    const hour = ts.getHours();
    const minute = ts.getMinutes();
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }
  if (days === 1) return t("chats.yesterday");
  if (days < 7) return t("chats.sentDaysAgo", { count: days });
  if (days < 14) return t("chats.sentLastWeek");
  if (days < 30) return t("chats.sentLastMonth");
  return `${ts.getMonth() + 1}/${ts.getDate()}`;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onPress,
  onCameraPress,
  onAvatarPress,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unread = chat.unreadCount > 0;
  const subtitle = useMemo(() => buildSubtitle(chat, t), [chat, t]);

  return (
    <Container>
      {onAvatarPress ? (
        <AvatarButton onPress={onAvatarPress} activeOpacity={0.7}>
          <ChatAvatar name={chat.name} size={56} showBorder={false} />
        </AvatarButton>
      ) : (
        <ChatAvatar name={chat.name} size={56} showBorder={false} />
      )}
      <ContentButton onPress={onPress}>
        <Name numberOfLines={1}>{chat.name}</Name>
        <SubtitleRow>
          <Subtitle numberOfLines={1}>{subtitle || " "}</Subtitle>
          {unread && (
            <Badge>
              <BadgeText>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </BadgeText>
            </Badge>
          )}
        </SubtitleRow>
      </ContentButton>
      <CameraButton
        onPress={onCameraPress ?? (() => {})}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="camera-outline" size={26} color={colors.primaryText} />
      </CameraButton>
    </Container>
  );
};
