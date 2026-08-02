"use client";

import { useRef, useEffect } from "react";
import { Search, Hash, User, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  InstagramSpinnerRing,
  InstagramSpinnerWrap,
  InstagramSpinnerText,
} from "@/shared/ui/instagram-spinner";
import { SearchUiScopes, type SearchUiScope } from "@whatschat/shared-types";
import { useGlobalSearch } from "@/search/use-global-search";
import { useTranslation } from "@/src/shared/i18n";
import { styled } from "@/src/shared/utils/emotion";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";

const PageRoot = styled.div<{ $drawer?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgb(255 255 255);
  ${(p) =>
    p.$drawer
      ? `
    max-width: none;
    margin: 0;
  `
      : `
    max-width: 468px;
    margin: 0 auto;
  `}
`;

const Header = styled.div<{ $drawer?: boolean }>`
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: ${(p) => (p.$drawer ? "none" : BORDER)};
`;

const SearchWrap = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 18px;
  width: 18px;
  color: ${TEXT_SECONDARY};
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  border-radius: 8px;
  background: rgb(239 239 239);
  border: none;
  font-size: 14px;
`;

const SuggestionDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: ${BORDER};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 50;
  max-height: 200px;
  overflow: auto;
`;

const SuggestionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  &:hover {
    background: rgb(239 239 239);
  }
`;

const TabsRow = styled.div`
  display: flex;
  gap: 0;
  border-bottom: ${BORDER};
  padding: 0 16px;
  flex-shrink: 0;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  color: ${(p) => (p.$active ? TEXT_PRIMARY : TEXT_SECONDARY)};
  background: none;
  border: none;
  border-bottom: ${(p) =>
    p.$active ? "2px solid rgb(38 38 38)" : "2px solid transparent"};
  cursor: pointer;
  margin-bottom: -1px;
`;

const Content = styled(ScrollArea)`
  flex: 1;
  min-height: 0;
`;

const Section = styled.section`
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_SECONDARY};
  margin: 0 0 12px 0;
`;

const UserRow = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid rgb(239 239 239);
  &:last-child {
    border-bottom: none;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
  & em {
    font-style: normal;
    background: rgba(0 149 246 / 0.15);
    padding: 0 1px;
  }
`;

const Highlight = styled.span`
  font-weight: 600;
  background: rgba(0 149 246 / 0.15);
  padding: 0 1px;
`;

const HashtagChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin: 4px 8px 4px 0;
  background: rgb(239 239 239);
  border-radius: 20px;
  font-size: 14px;
  color: rgb(0 149 246);
  text-decoration: none;
  &:hover {
    background: rgb(229 229 229);
  }
`;

const PostRow = styled.a`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid rgb(239 239 239);
  &:last-child {
    border-bottom: none;
  }
`;

const PostThumb = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  background: rgb(239 239 239);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_SECONDARY};
`;

const PostBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const PostCaption = styled.p`
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  & em {
    font-style: normal;
    background: rgba(0 149 246 / 0.15);
    padding: 0 1px;
  }
`;

const LoadMoreBtn = styled(Button)`
  margin: 16px;
  width: calc(100% - 32px);
`;

const Empty = styled.p`
  font-size: 14px;
  color: ${TEXT_SECONDARY};
  text-align: center;
  padding: 32px 16px;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: rgb(237 73 86);
  text-align: center;
  padding: 16px;
  margin: 0;
`;

function HighlightFragment({
  text,
  highlight,
}: {
  text: string;
  highlight?: Record<string, string[]>;
}) {
  const key = Object.keys(highlight ?? {})[0];
  const fragments = key ? highlight?.[key] : undefined;
  if (fragments?.length) {
    return (
      <>
        {fragments.map((frag, i) => (
          <span key={i} dangerouslySetInnerHTML={{ __html: frag }} />
        ))}
      </>
    );
  }
  return <>{text}</>;
}

export interface GlobalSearchPageProps {
  onBack?: () => void;
  onPostClick?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  variant?: "page" | "drawer";
}

export function GlobalSearchPage({
  onBack,
  onPostClick,
  onUserClick,
  variant = "page",
}: GlobalSearchPageProps) {
  const { t } = useTranslation();
  const {
    query,
    setQuery,
    searchType,
    setSearchType,
    userHits,
    postHits,
    hashtagHits,
    postTotal,
    loading,
    loadingMore,
    error,
    nextCursor,
    loadMore,
    hashtagSuggestions,
  } = useGlobalSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const showSuggestions = query.length >= 1 && hashtagSuggestions.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const renderUser = (h: unknown) => {
    const row = h as {
      id?: string;
      username?: string;
      avatar?: string;
      highlight?: Record<string, string[]>;
    };
    const id = row.id ?? "";
    const username = row.username ?? "";
    return (
      <UserRow
        key={id}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onUserClick?.(id);
        }}
      >
        <Avatar style={{ width: 44, height: 44 }}>
          <AvatarImage src={row.avatar ?? undefined} />
          <AvatarFallback>
            {(username || id).slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <UserName>
          <HighlightFragment text={username} highlight={row.highlight} />
        </UserName>
      </UserRow>
    );
  };

  const renderHashtag = (h: unknown) => {
    const row = h as { tag?: string };
    const tag = row.tag ?? "";
    return (
      <HashtagChip
        key={tag}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setQuery(`#${tag}`);
        }}
      >
        <Hash size={14} />
        {tag}
      </HashtagChip>
    );
  };

  const renderPost = (h: unknown) => {
    const row = h as {
      id?: string;
      postId?: string;
      userId?: string;
      caption?: string;
      mediaUrls?: string[];
      highlight?: Record<string, string[]>;
    };
    const postId = row.postId ?? row.id ?? "";
    return (
      <PostRow
        key={postId}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onPostClick?.(postId);
        }}
      >
        <PostThumb>
          {row.mediaUrls?.[0] ? (
            <img
              src={row.mediaUrls[0]}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <ImageIcon size={24} />
          )}
        </PostThumb>
        <PostBody>
          <PostCaption>
            <HighlightFragment
              text={row.caption ?? ""}
              highlight={row.highlight}
            />
          </PostCaption>
        </PostBody>
      </PostRow>
    );
  };

  const renderContent = () => {
    if (error) return <ErrorText>{error}</ErrorText>;
    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <InstagramSpinnerWrap>
            <InstagramSpinnerRing />
            <InstagramSpinnerText>{t("common.loading")}</InstagramSpinnerText>
          </InstagramSpinnerWrap>
        </div>
      );
    }
    if (!query.trim()) {
      return <Empty>{t("search.placeholder")}</Empty>;
    }

    if (searchType === SearchUiScopes.All) {
      const hasAny =
        userHits.length > 0 || postHits.length > 0 || hashtagHits.length > 0;
      if (!hasAny) return <Empty>{t("search.noResults")}</Empty>;
      return (
        <Section>
          {userHits.length > 0 && (
            <>
              <SectionTitle>{t("search.tabUsers")}</SectionTitle>
              {userHits.map(renderUser)}
            </>
          )}
          {hashtagHits.length > 0 && (
            <>
              <SectionTitle>{t("search.tabTopics")}</SectionTitle>
              <div style={{ padding: "8px 0" }}>
                {hashtagHits.map(renderHashtag)}
              </div>
            </>
          )}
          {postHits.length > 0 && (
            <>
              <SectionTitle>{t("search.tabPosts")}</SectionTitle>
              {postHits.map(renderPost)}
            </>
          )}
        </Section>
      );
    }

    if (searchType === SearchUiScopes.Users) {
      if (userHits.length === 0) return <Empty>{t("search.noResults")}</Empty>;
      return (
        <Section>
          {userHits.map(renderUser)}
          {nextCursor && (
            <LoadMoreBtn
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? t("common.loading") : t("search.loadMore")}
            </LoadMoreBtn>
          )}
        </Section>
      );
    }

    if (searchType === SearchUiScopes.Hashtags) {
      if (hashtagHits.length === 0)
        return <Empty>{t("search.noResults")}</Empty>;
      return (
        <Section>
          <div style={{ padding: "8px 0" }}>
            {hashtagHits.map(renderHashtag)}
          </div>
          {nextCursor && (
            <LoadMoreBtn
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? t("common.loading") : t("search.loadMore")}
            </LoadMoreBtn>
          )}
        </Section>
      );
    }

    if (postHits.length === 0) return <Empty>{t("search.noResults")}</Empty>;
    return (
      <Section>
        {postTotal != null && (
          <SectionTitle>
            {t("search.resultsCount", { count: postTotal })}
          </SectionTitle>
        )}
        {postHits.map(renderPost)}
        {nextCursor && (
          <LoadMoreBtn
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? t("common.loading") : t("search.loadMore")}
          </LoadMoreBtn>
        )}
      </Section>
    );
  };

  const tabs: { key: SearchUiScope; label: string }[] = [
    { key: SearchUiScopes.All, label: t("search.tabAll") },
    { key: SearchUiScopes.Posts, label: t("search.tabPosts") },
    { key: SearchUiScopes.Users, label: t("search.tabUsers") },
    { key: SearchUiScopes.Hashtags, label: t("search.tabTopics") },
  ];

  return (
    <PageRoot $drawer={variant === "drawer"}>
      <Header $drawer={variant === "drawer"}>
        <SearchWrap>
          <SearchIcon />
          <SearchInput
            ref={inputRef}
            type="search"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("search.placeholder")}
          />
          {showSuggestions && (
            <SuggestionDropdown>
              {hashtagSuggestions.map((s) => {
                const tag = (s as { tag?: string }).tag ?? "";
                return (
                  <SuggestionItem
                    key={tag}
                    type="button"
                    onClick={() => setQuery(`#${tag}`)}
                  >
                    <Hash size={16} />#{tag}
                  </SuggestionItem>
                );
              })}
            </SuggestionDropdown>
          )}
        </SearchWrap>
      </Header>
      <TabsRow>
        {tabs.map(({ key, label }) => (
          <Tab
            key={key}
            $active={searchType === key}
            onClick={() => setSearchType(key)}
          >
            {label}
          </Tab>
        ))}
      </TabsRow>
      <Content>{renderContent()}</Content>
    </PageRoot>
  );
}
