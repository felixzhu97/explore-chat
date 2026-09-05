import React from "react";
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  Pressable,
  Text,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Chat } from "@/chat/chat.model";
import { ChatListItem, ChatAvatar } from "@/shared/components";
import type { AuthUser } from "@/auth/auth.model";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import { getChatApi } from "@/core/composition-root";
import { useAuthStore } from "@/core/store/hooks";

const PAGE_BG = "#FFFFFF";
const SEARCH_BG = "#F2F2F2";

const Page = styled.View`
  flex: 1;
  background-color: ${PAGE_BG};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-top: 4px;
  padding-bottom: 8px;
  padding-horizontal: 8px;
`;

const HeaderSide = styled.View`
  flex: 1;
`;

const HeaderCenter = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 8px;
  padding-horizontal: 12px;
`;

const HeaderUsername = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primaryText};
`;

const ComposeButton = styled.Pressable`
  align-self: flex-end;
  padding: 10px 12px;
`;

const SearchRow = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 14px;
`;

const SearchBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${SEARCH_BG};
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 12px;
  gap: 8px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 0;
  color: ${(p) => p.theme.colors.primaryText};
`;

const NotesScroll = styled.ScrollView`
  margin-bottom: 8px;
`;

const NotesInner = styled.View`
  flex-direction: row;
  padding-horizontal: 12px;
  gap: 16px;
  padding-bottom: 4px;
`;

const NoteColumn = styled.View`
  align-items: center;
  width: 76px;
`;

const NoteBubble = styled.View`
  position: absolute;
  top: -2px;
  align-self: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-width: 0.5px;
  border-color: rgba(0, 0, 0, 0.08);
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.06;
  shadow-radius: 2px;
  elevation: 2;
`;

const NoteBubbleText = styled.Text`
  font-size: 11px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const NoteAvatarWrap = styled.View`
  margin-top: 22px;
  margin-bottom: 8px;
`;

const NoteTitle = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
  text-align: center;
`;

const NoteMeta = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 2px;
`;

const NoteMetaText = styled.Text`
  font-size: 11px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const MapCircle = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #e8f4ff;
  margin-top: 22px;
  margin-bottom: 8px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const MapLabel = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-vertical: 10px;
`;

const SectionTitleWrap = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const SectionTitle = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primaryText};
`;

const RequestsLink = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const SuggestionsBlock = styled.View`
  padding-top: 8px;
  padding-bottom: 24px;
`;

const SuggestionTitle = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primaryText};
  padding-horizontal: 16px;
  padding-bottom: 8px;
`;

const SuggestionRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
  padding-horizontal: 16px;
`;

const SuggestionBody = styled.View`
  flex: 1;
  margin-left: 12px;
  min-width: 0;
`;

const SuggestionNameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const SuggestionName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
`;

const SuggestionHint = styled.Text`
  font-size: 14px;
  color: ${(p) => p.theme.colors.secondaryText};
  margin-top: 2px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 48px;
  padding-bottom: 48px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  margin-top: 16px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const LoadingWrap = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
`;

const PushBannerWrap = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 20;
`;

const PushBanner = styled.View`
  margin-horizontal: 12px;
  flex-direction: row;
  align-items: center;
  background-color: #ebebeb;
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 12px;
  gap: 8px;
`;

const PushBannerText = styled.Text`
  flex: 1;
  font-size: 13px;
  color: ${(p) => p.theme.colors.primaryText};
`;

const SUGGESTIONS = [
  { username: "sundarpichai", verified: true },
  { username: "zuck", verified: true },
  { username: "louisvuitton", verified: true },
  { username: "evejobs", verified: false },
  { username: "oliviarodrigo", verified: true },
];

function ChatsListHeader({ user }: { user: AuthUser | null }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const username = user?.username ?? "…";

  return (
    <>
      <HeaderRow>
        <HeaderSide />
        <HeaderCenter>
          <HeaderUsername numberOfLines={1}>{username}</HeaderUsername>
          <Ionicons
            name="chevron-down"
            size={18}
            color={colors.primaryText}
            style={{ marginLeft: 4 }}
          />
        </HeaderCenter>
        <HeaderSide style={{ alignItems: "flex-end" }}>
          <ComposeButton onPress={() => {}}>
            <Ionicons
              name="create-outline"
              size={26}
              color={colors.primaryText}
            />
          </ComposeButton>
        </HeaderSide>
      </HeaderRow>
      <SearchRow>
        <SearchBox>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <SearchInput
            placeholder={t("chats.searchPlaceholder")}
            placeholderTextColor="#8E8E93"
            returnKeyType="search"
          />
        </SearchBox>
      </SearchRow>
      <NotesScroll horizontal showsHorizontalScrollIndicator={false}>
        <NotesInner>
          <NoteColumn>
            <View style={{ position: "relative" }}>
              <NoteBubble>
                <NoteBubbleText>{t("chats.notePreview")}</NoteBubbleText>
              </NoteBubble>
              <NoteAvatarWrap>
                <ChatAvatar
                  name={username}
                  imageUrl={user?.avatar}
                  size={64}
                  showBorder={false}
                />
              </NoteAvatarWrap>
            </View>
            <NoteTitle>{t("chats.yourNote")}</NoteTitle>
            <NoteMeta>
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.secondaryText}
              />
              <NoteMetaText>{t("chats.locationOff")}</NoteMetaText>
            </NoteMeta>
          </NoteColumn>
          <NoteColumn>
            <MapCircle>
              <Ionicons name="map-outline" size={28} color="#6BA3C4" />
            </MapCircle>
            <MapLabel>{t("chats.map")}</MapLabel>
          </NoteColumn>
        </NotesInner>
      </NotesScroll>
      <SectionHeaderRow>
        <SectionTitleWrap>
          <SectionTitle>{t("chats.messages")}</SectionTitle>
          <Ionicons
            name="notifications-off-outline"
            size={20}
            color={colors.primaryText}
          />
        </SectionTitleWrap>
        <Pressable onPress={() => {}}>
          <RequestsLink>{t("chats.requests")}</RequestsLink>
        </Pressable>
      </SectionHeaderRow>
    </>
  );
}

function ChatsSuggestionsFooter() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SuggestionsBlock>
      <SuggestionTitle>{t("chats.suggestions")}</SuggestionTitle>
      {SUGGESTIONS.map((s) => (
        <SuggestionRow key={s.username} onPress={() => {}}>
          <ChatAvatar name={s.username} size={56} showBorder={false} />
          <SuggestionBody>
            <SuggestionNameRow>
              <SuggestionName numberOfLines={1}>{s.username}</SuggestionName>
              {s.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.accentBlue}
                />
              )}
            </SuggestionNameRow>
            <SuggestionHint>{t("chats.tapToChat")}</SuggestionHint>
          </SuggestionBody>
          <Ionicons
            name="camera-outline"
            size={26}
            color={colors.primaryText}
          />
        </SuggestionRow>
      ))}
    </SuggestionsBlock>
  );
}

export default function ChatsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pushBannerVisible, setPushBannerVisible] = React.useState(true);

  const loadChats = React.useCallback(async () => {
    try {
      const list = await getChatApi().getChats();
      setChats(list);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadChats();
    }, [loadChats]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadChats();
  }, [loadChats]);

  const listHeader = React.useMemo(
    () => <ChatsListHeader user={user} />,
    [user],
  );

  const listFooter = React.useMemo(() => <ChatsSuggestionsFooter />, []);

  const bannerBottom = insets.bottom - 20;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Page>
        {loading ? (
          <>
            <ChatsListHeader user={user} />
            <LoadingWrap>
              <ActivityIndicator size="large" color={colors.primaryText} />
              <EmptyText>{t("common.loading")}</EmptyText>
            </LoadingWrap>
          </>
        ) : (
          <FlatList
            data={chats}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => {
              const otherUserId =
                item.type === "individual"
                  ? item.participantIds?.find((id) => id !== user?.id)
                  : undefined;

              return (
                <ChatListItem
                  chat={item}
                  onPress={() => router.push(`/chat-detail?chatId=${item.id}`)}
                  onAvatarPress={
                    otherUserId
                      ? () => router.push(`/user-profile/${otherUserId}`)
                      : undefined
                  }
                />
              );
            }}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primaryText}
              />
            }
            ListEmptyComponent={
              <EmptyContainer>
                <Ionicons
                  name="paper-plane-outline"
                  size={72}
                  color={colors.secondaryText}
                />
                <EmptyText>{t("chats.noChats")}</EmptyText>
              </EmptyContainer>
            }
          />
        )}
        {pushBannerVisible && (
          <PushBannerWrap style={{ bottom: bannerBottom }}>
            <PushBanner>
              <Ionicons
                name="notifications-off-outline"
                size={20}
                color={colors.primaryText}
              />
              <PushBannerText>{t("chats.pushBanner")}</PushBannerText>
              <Pressable onPress={() => {}}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.primaryGreen,
                  }}
                >
                  {t("chats.turnOn")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPushBannerVisible(false)}
                hitSlop={12}
              >
                <Ionicons name="close" size={22} color={colors.secondaryText} />
              </Pressable>
            </PushBanner>
          </PushBannerWrap>
        )}
      </Page>
    </SafeAreaView>
  );
}
