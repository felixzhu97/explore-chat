import React, { useState, useEffect, useRef, useCallback } from "react";
import sortBy from "lodash/sortBy";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Message,
  MessageType,
  MessageStatus,
  MessageEntity,
} from "@/chat/message.model";
import { Chat, ChatEntity, ChatType } from "@/chat/chat.model";
import { MessageBubble, ChatInputField, ChatAvatar } from "@/shared/components";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import { useAuthStore } from "@/core/store/hooks";
import { useSocket } from "@/core/use-socket";
import { useCall } from "@/calls/use-call";
import { useAnalytics } from "@whatschat/analytics";
import { CHAT_OPEN, SEND_MESSAGE, CALL_START } from "@whatschat/analytics";
import { getChatApi, getMessageApi } from "@/core/composition-root";

const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.chatBackground};
`;

const Centered = styled(Container)`
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 8px;
  font-size: 15px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const KeyboardView = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const SafeWrap = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(p) =>
    (p.theme as { colors?: { chatBackground?: string } })?.colors
      ?.chatBackground};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  width: 100%;
  padding-horizontal: 4px;
`;

const BackButton = styled.TouchableOpacity`
  padding-vertical: 8px;
  padding-horizontal: 12px;
  border-radius: 20px;
  background-color: ${(p) =>
    (p.theme as { colors?: { secondaryBackground?: string } })?.colors
      ?.secondaryBackground};
`;

const HeaderCenter = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-horizontal: 12px;
  min-width: 0;
`;

const HeaderAvatarBlock = styled.View`
  margin-left: 12px;
  flex: 1;
  min-width: 0;
`;

const HeaderName = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(p) =>
    (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const HeaderSubtitle = styled.Text`
  font-size: 13px;
  font-weight: 400;
  color: ${(p) =>
    (p.theme as { colors?: { secondaryText?: string } })?.colors
      ?.secondaryText};
  margin-top: 2px;
`;

const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 6px;
  padding-horizontal: 8px;
  border-radius: 20px;
  background-color: ${(p) =>
    (p.theme as { colors?: { secondaryBackground?: string } })?.colors
      ?.secondaryBackground};
  gap: 4px;
`;

const HeaderIconButton = styled.TouchableOpacity`
  padding: 6px;
`;

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const onMessageReceived = useCallback(
    (message: Message) => {
      if (message.chatId !== params.chatId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return sortBy([...prev, message], (m) =>
          new Date(m.timestamp).getTime(),
        );
      });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    },
    [params.chatId],
  );

  const onMessageSent = useCallback(
    (message: Message) => {
      if (message.chatId !== params.chatId) return;
      setMessages((prev) => {
        const byClient =
          message.clientMsgId != null
            ? prev.find((m) => m.clientMsgId === message.clientMsgId)
            : undefined;
        if (byClient) {
          return prev.map((m) =>
            m.clientMsgId === message.clientMsgId
              ? new MessageEntity({
                  ...message,
                  status: MessageStatus.Sent,
                })
              : m,
          );
        }
        if (prev.some((m) => m.id === message.id)) return prev;
        return sortBy([...prev, message], (m) =>
          new Date(m.timestamp).getTime(),
        );
      });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    },
    [params.chatId],
  );

  const onMessageDelivered = useCallback(
    (payload: { messageId: string; chatId: string; clientMsgId?: string }) => {
      if (payload.chatId !== params.chatId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId ||
          (payload.clientMsgId != null && m.clientMsgId === payload.clientMsgId)
            ? new MessageEntity({ ...m, status: MessageStatus.Delivered })
            : m,
        ),
      );
    },
    [params.chatId],
  );

  const { sendMessage, joinChat, leaveChat, connected } = useSocket(
    onMessageReceived,
    onMessageSent,
    onMessageDelivered,
  );
  const { startCall } = useCall();
  const analytics = useAnalytics();

  useEffect(() => {
    if (userId) analytics.identify(userId);
  }, [userId, analytics]);

  useEffect(() => {
    const chatId = params.chatId;
    if (chatId) analytics.track(CHAT_OPEN, { chatId });
  }, [params.chatId, analytics]);

  useEffect(() => {
    const chatId = params.chatId;
    if (!chatId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getChatApi().getChatById(chatId),
      getMessageApi().getMessages(chatId),
    ])
      .then(([c, list]) => {
        if (cancelled) return;
        if (c) setChat(c);
        setMessages(list.reverse());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.chatId]);

  useEffect(() => {
    const chatId = params.chatId;
    if (!chatId || !connected) return;
    joinChat(chatId);
    return () => leaveChat(chatId);
  }, [params.chatId, connected, joinChat, leaveChat]);

  const handleSend = useCallback(
    (text: string) => {
      const chatId = params.chatId;
      if (!chatId || !text.trim()) return;
      const clientMsgId = `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimistic = new MessageEntity({
        id: clientMsgId,
        clientMsgId,
        chatId,
        senderId: userId ?? "",
        senderName: "我",
        content: text.trim(),
        type: MessageType.Text,
        status: MessageStatus.Sending,
        timestamp: new Date(),
        isForwarded: false,
        forwardedFrom: [],
      });
      setMessages((prev) =>
        sortBy([...prev, optimistic], (m) => new Date(m.timestamp).getTime()),
      );
      setInputText("");
      analytics.track(SEND_MESSAGE, { chatId, type: "text" });

      if (connected) {
        sendMessage(chatId, text.trim(), "TEXT", clientMsgId);
      } else {
        getMessageApi()
          .sendMessage(chatId, text.trim(), "TEXT", clientMsgId)
          .then((msg) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMsgId === clientMsgId
                  ? new MessageEntity({
                      ...msg,
                      clientMsgId,
                      status: MessageStatus.Sent,
                    })
                  : m,
              ),
            );
          })
          .catch(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientMsgId === clientMsgId
                  ? new MessageEntity({ ...m, status: MessageStatus.Failed })
                  : m,
              ),
            );
          });
      }
    },
    [params.chatId, userId, connected, sendMessage, analytics],
  );

  if (loading && !chat) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Centered>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <LoadingText>{t("common.loading")}</LoadingText>
        </Centered>
      </SafeAreaView>
    );
  }

  const displayChat =
    chat ??
    new ChatEntity({
      id: params.chatId ?? "",
      name: "Chat",
      type: ChatType.Individual,
      participantIds: [],
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      adminIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const otherUserId =
    displayChat.participantIds?.find((id) => id !== userId) ?? null;
  const contactName =
    displayChat.name && displayChat.name !== "Chat"
      ? displayChat.name
      : (messages.find((m) => m.senderId !== userId)?.senderName ??
        displayChat.name);
  const handleVoiceCall = () => {
    if (otherUserId) {
      analytics.track(CALL_START, {
        chatId: params.chatId ?? undefined,
        callType: "voice",
      });
      startCall(otherUserId, contactName, "", "voice");
    }
  };
  const handleVideoCall = () => {
    if (otherUserId) {
      analytics.track(CALL_START, {
        chatId: params.chatId ?? undefined,
        callType: "video",
      });
      startCall(otherUserId, contactName, "", "video");
    }
  };
  const handleProfilePress = () => {
    if (!otherUserId) return;
    router.push(`/user-profile/${otherUserId}`);
  };

  const HeaderContent = () => (
    <HeaderRow>
      <BackButton onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
      </BackButton>
      <HeaderCenter>
        <Pressable
          onPress={handleProfilePress}
          hitSlop={8}
          disabled={!otherUserId}
        >
          <ChatAvatar name={contactName} size={40} />
        </Pressable>
        <HeaderAvatarBlock>
          <HeaderName numberOfLines={1}>{contactName}</HeaderName>
          <HeaderSubtitle>{t("chatDetail.online")}</HeaderSubtitle>
        </HeaderAvatarBlock>
      </HeaderCenter>
      <HeaderActions>
        <HeaderIconButton onPress={handleVideoCall} disabled={!otherUserId}>
          <Ionicons
            name="videocam-outline"
            size={22}
            color={colors.primaryText}
          />
        </HeaderIconButton>
        <HeaderIconButton onPress={handleVoiceCall} disabled={!otherUserId}>
          <Ionicons name="call-outline" size={22} color={colors.primaryText} />
        </HeaderIconButton>
        <HeaderIconButton>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.primaryText}
          />
        </HeaderIconButton>
      </HeaderActions>
    </HeaderRow>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: false,
          headerBackVisible: false,
          headerLeft: () => null,
          headerRight: () => null,
          headerTitle: HeaderContent,
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: colors.secondaryBackground,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
            shadowOpacity: 0,
            elevation: 0,
          } as ViewStyle as never,
          headerTintColor: colors.primaryText,
        }}
      />
      <SafeWrap edges={["bottom"]}>
        <Container>
          <KeyboardView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <MessageBubble message={item} isMe={item.senderId === userId} />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingTop: 8,
                paddingBottom: 8,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
            />
            <ChatInputField
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
            />
          </KeyboardView>
        </Container>
      </SafeWrap>
    </>
  );
}
