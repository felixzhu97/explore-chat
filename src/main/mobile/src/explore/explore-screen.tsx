import React, { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import { getFeedApi } from "@/core/composition-root";
import { ExploreGridTile } from "@/shared/components";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";

const SEARCH_BG = "#F2F2F2";
const PAGE_SIZE = 21;

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  padding-bottom: 88px;
`;

const SearchRow = styled.View`
  padding-horizontal: 16px;
  padding-top: 8px;
  padding-bottom: 12px;
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

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: ${(p) => p.theme.colors.secondaryText};
  text-align: center;
  margin-top: 8px;
`;

const FooterLoad = styled.View`
  padding-vertical: 16px;
  align-items: center;
`;

export const ExploreScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const width = Dimensions.get("window").width;
  const tile = Math.floor((width - 2) / 3);
  const marginBetween = 1;

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MobileFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exploreNextPageToken, setExploreNextPageToken] = useState<
    string | undefined
  >();
  const [exploreHasMore, setExploreHasMore] = useState(true);
  const [searchCursor, setSearchCursor] = useState<string | undefined>();
  const [searchHasMore, setSearchHasMore] = useState(false);
  const loadExplore = useCallback(
    async (pageToken: string | undefined, append: boolean) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const { posts, nextPageToken, fetchedEntryCount } =
          await getFeedApi().getExplore(PAGE_SIZE, pageToken);
        setExploreNextPageToken(nextPageToken);
        setExploreHasMore(Boolean(nextPageToken) && fetchedEntryCount > 0);
        setItems((prev) => (append ? [...prev, ...posts] : posts));
      } catch (e) {
        setError(e instanceof Error ? e.message : t("explore.loadFailed"));
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  const loadSearch = useCallback(
    async (q: string, cursor: string | undefined, append: boolean) => {
      if (!append) {
        setLoading(true);
        setSearchCursor(undefined);
      } else setLoadingMore(true);
      setError(null);
      try {
        const { posts, nextCursor } = await getFeedApi().searchPosts(
          q,
          PAGE_SIZE,
          cursor,
        );
        setSearchCursor(nextCursor);
        setSearchHasMore(Boolean(nextCursor));
        setItems((prev) => (append ? [...prev, ...posts] : posts));
      } catch (e) {
        setError(e instanceof Error ? e.message : t("explore.loadFailed"));
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void loadExplore(undefined, false);
  }, [loadExplore]);

  const scheduleQuery = useMemo(
    () =>
      debounce((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
          setSearchCursor(undefined);
          setSearchHasMore(false);
          setExploreNextPageToken(undefined);
          void loadExplore(undefined, false);
          return;
        }
        void loadSearch(trimmed, undefined, false);
      }, 350),
    [loadExplore, loadSearch],
  );

  useEffect(() => () => scheduleQuery.cancel(), [scheduleQuery]);

  const onChangeQuery = (text: string) => {
    setQuery(text);
    scheduleQuery(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (query.trim()) {
      void loadSearch(query.trim(), undefined, false);
    } else {
      setExploreNextPageToken(undefined);
      void loadExplore(undefined, false);
    }
  };

  const onEndReached = () => {
    if (loading || loadingMore) return;
    if (query.trim()) {
      if (!searchHasMore || !searchCursor) return;
      void loadSearch(query.trim(), searchCursor, true);
      return;
    }
    if (!exploreHasMore) return;
    void loadExplore(exploreNextPageToken, true);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: MobileFeedPost; index: number }) => {
      const col = index % 3;
      const marginRight = col < 2 ? marginBetween : 0;
      return (
        <ExploreGridTile
          post={item}
          tileSize={tile}
          marginRight={marginRight}
          marginBottom={marginBetween}
          onPress={() =>
            router.push({
              pathname: "/media-viewer",
              params: { postId: item.id, index: "0" },
            } as never)
          }
        />
      );
    },
    [marginBetween, router, tile],
  );

  const listHeader = (
    <SearchRow>
      <SearchBox>
        <Ionicons name="search-outline" size={18} color="#8E8E93" />
        <SearchInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder={t("explore.searchPlaceholder")}
          placeholderTextColor="#8E8E93"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </SearchBox>
    </SearchRow>
  );

  const listEmpty = () => {
    if (loading && items.length === 0) {
      return (
        <Centered>
          <ActivityIndicator size="large" color={colors.primaryText} />
        </Centered>
      );
    }
    if (items.length === 0) {
      return (
        <Centered>
          <Ionicons
            name="search-outline"
            size={56}
            color={colors.secondaryText}
          />
          <ErrorText>
            {error ??
              (query.trim()
                ? t("explore.searchEmpty")
                : t("explore.exploreEmpty"))}
          </ErrorText>
        </Centered>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={listHeader}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            loadingMore ? (
              <FooterLoad>
                <ActivityIndicator size="small" color={colors.primaryText} />
              </FooterLoad>
            ) : null
          }
          contentContainerStyle={
            items.length === 0 ? { flexGrow: 1 } : { paddingBottom: 24 }
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryText}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
        />
      </Page>
    </SafeAreaView>
  );
};
