import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "@/shared/emotion";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "@/shared/i18n";
import { useAuthStore } from "@/core/store/hooks";
import {
  useCreatePostCommentMutation,
  useGetPostCommentsQuery,
} from "@/feed/feedApi";

const Page = styled.View`
  flex: 1;
  background-color: transparent;
`;

const Sheet = styled.View`
  flex: 1;
  background-color: #fff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  overflow: hidden;
`;

const HandleTouch = styled.View`
  padding-top: 10px;
  padding-bottom: 8px;
`;

const Handle = styled.View`
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background-color: #c9c9c9;
  align-self: center;
  margin-top: 10px;
`;

const Header = styled.View`
  padding: 8px 16px 10px 16px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #efefef;
`;

const Title = styled.Text`
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #111;
`;

const ListWrap = styled.View`
  flex: 1;
`;

const Row = styled.View`
  flex-direction: row;
  padding: 12px 14px;
`;

const Avatar = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #ececec;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const AvatarText = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: #4b4b4b;
`;

const Content = styled.View`
  flex: 1;
`;

const NameLine = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`;

const Name = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #111;
`;

const Time = styled.Text`
  margin-left: 6px;
  font-size: 12px;
  color: #8e8e93;
`;

const CommentText = styled.Text`
  font-size: 15px;
  color: #111;
`;

const EmptyWrap = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: #8e8e93;
`;

const EmptyHint = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  color: #b0b0b5;
`;

const InputBar = styled.View`
  border-top-width: 1px;
  border-top-color: #efefef;
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
`;

const InputWrap = styled.View`
  flex: 1;
  margin-left: 10px;
  background-color: #f4f4f5;
  border-radius: 20px;
  padding-horizontal: 12px;
  min-height: 38px;
  justify-content: center;
`;

const SendButton = styled.Pressable<{ $disabled: boolean }>`
  margin-left: 10px;
  padding-vertical: 8px;
  padding-horizontal: 10px;
  opacity: ${(p) => (p.$disabled ? 0.45 : 1)};
`;

const SendText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #0095f6;
`;

export default function PostCommentsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const me = useAuthStore((s) => s.user);
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const postId = Array.isArray(params.postId)
    ? params.postId[0]
    : params.postId;
  const [input, setInput] = useState("");
  const expandedTop = Math.max(insets.top + 8, 8);
  const defaultTop = Math.max(expandedTop, Math.round(windowHeight / 3));
  const closeTop = windowHeight;
  const sheetTop = useRef(new Animated.Value(defaultTop)).current;
  const dragStartTopRef = useRef(defaultTop);
  const [createPostComment, createResult] = useCreatePostCommentMutation();
  const { data, isFetching, isError, refetch } = useGetPostCommentsQuery(
    { postId: postId ?? "", page: 1, limit: 50 },
    { skip: !postId },
  );

  const comments = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const canSend =
    !!postId && input.trim().length > 0 && !createResult.isLoading;

  React.useEffect(() => {
    sheetTop.setValue(defaultTop);
  }, [defaultTop, sheetTop]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetTop, {
      toValue: closeTop,
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      router.back();
    });
  }, [closeTop, router, sheetTop]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          dragStartTopRef.current =
            (sheetTop as any).__getValue?.() ?? defaultTop;
        },
        onMoveShouldSetPanResponder: (_evt, gestureState) =>
          Math.abs(gestureState.dy) > 4 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_evt, gestureState) => {
          const nextTop = Math.max(
            expandedTop,
            Math.min(closeTop, dragStartTopRef.current + gestureState.dy),
          );
          sheetTop.setValue(nextTop);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          const currentTop = (sheetTop as any).__getValue?.() ?? defaultTop;
          const shouldClose =
            currentTop > defaultTop + 140 || gestureState.vy > 1.1;
          if (shouldClose) {
            closeSheet();
            return;
          }
          const shouldExpand =
            gestureState.vy < -0.9 ||
            currentTop < (expandedTop + defaultTop) / 2;
          Animated.spring(sheetTop, {
            toValue: shouldExpand ? expandedTop : defaultTop,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        },
      }),
    [closeSheet, closeTop, defaultTop, expandedTop, sheetTop],
  );

  const formatAgo = (value: string) => {
    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return "";
    const diff = Math.max(0, Date.now() - ts);
    const min = Math.floor(diff / 60000);
    if (min < 1) return "now";
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    const w = Math.floor(d / 7);
    return `${w}w`;
  };

  const getInitial = (value: string) => {
    const s = value.trim();
    if (!s) return "?";
    return s.charAt(0).toUpperCase();
  };

  const onSend = async () => {
    const content = input.trim();
    if (!postId || !content) return;
    try {
      await createPostComment({ postId, content }).unwrap();
      setInput("");
    } catch (e) {
      const message = e instanceof Error ? e.message : t("comments.sendFailed");
      Alert.alert(
        t("comments.title"),
        String(message || t("comments.sendFailed")),
      );
      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Page>
          <Pressable style={{ flex: 1 }} onPress={closeSheet} />
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              top: sheetTop,
            }}
          >
            <Sheet>
              <HandleTouch {...panResponder.panHandlers}>
                <Handle />
              </HandleTouch>
              <Header>
                <Title>{t("comments.title")}</Title>
              </Header>
              <ListWrap>
                {isFetching ? (
                  <EmptyWrap>
                    <ActivityIndicator size="small" color="#999" />
                  </EmptyWrap>
                ) : isError ? (
                  <EmptyWrap>
                    <Pressable onPress={() => refetch()}>
                      <EmptyText>{t("common.retry")}</EmptyText>
                    </Pressable>
                  </EmptyWrap>
                ) : comments.length === 0 ? (
                  <EmptyWrap>
                    <EmptyText>{t("comments.empty")}</EmptyText>
                    <EmptyHint>{t("comments.emptyHint")}</EmptyHint>
                  </EmptyWrap>
                ) : (
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Row>
                        <Avatar>
                          <AvatarText>{getInitial(item.userId)}</AvatarText>
                        </Avatar>
                        <Content>
                          <NameLine>
                            <Name numberOfLines={1}>{item.userId}</Name>
                            <Time>{formatAgo(item.createdAt)}</Time>
                          </NameLine>
                          <CommentText>{item.content}</CommentText>
                        </Content>
                      </Row>
                    )}
                  />
                )}
              </ListWrap>
              <InputBar style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
                <Avatar>
                  <AvatarText>
                    {getInitial(me?.username ?? me?.id ?? "")}
                  </AvatarText>
                </Avatar>
                <InputWrap>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder={t("comments.placeholder")}
                    placeholderTextColor="#8e8e93"
                    returnKeyType="send"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      if (canSend) void onSend();
                    }}
                    style={{ fontSize: 15, color: "#111" }}
                  />
                </InputWrap>
                <SendButton
                  $disabled={!canSend}
                  onPress={onSend}
                  disabled={!canSend}
                >
                  <SendText>
                    {createResult.isLoading
                      ? t("common.loading")
                      : t("common.send")}
                  </SendText>
                </SendButton>
              </InputBar>
            </Sheet>
          </Animated.View>
        </Page>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
