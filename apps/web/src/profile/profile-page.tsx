"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutGrid, Bookmark, UserCheck, Plus, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { styled } from "@/src/shared/utils/emotion";
import {
  useTranslation,
  setStoredLocale,
  getLocale,
  type AppLocale,
} from "@/src/shared/i18n";
import type { FeedPost } from "@/shared/types";

const FOOTER_LANG_OPTIONS: { value: AppLocale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BORDER = "1px solid rgb(219 219 219)";
const BG_BUTTON = "rgb(239 239 239)";

const VIDEO_COVER_PLACEHOLDER =
  "/placeholder.svg?height=400&width=400&text=Video";

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:")) {
    return /^data:video\//i.test(url);
  }
  return /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(url) || url.includes("/video/");
}

function videoPosterUrl(post: FeedPost): string | null {
  if (post.type !== "VIDEO") return null;
  const candidates = [post.coverUrl, post.coverImageUrl, post.imageUrl];
  for (const raw of candidates) {
    if (raw && !isVideoUrl(raw)) return raw;
  }
  return null;
}

function getVideoUrl(post: FeedPost): string | null {
  if (post.type !== "VIDEO") return null;
  const u = post.videoUrl ?? post.imageUrl ?? "";
  return u && isVideoUrl(u) ? u : null;
}

const VideoFirstFrameWrap = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgb(239 239 239);
`;

const VideoFirstFrameImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoFirstFrameVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

function VideoFirstFrameCover({
  videoUrl,
  placeholderSrc,
}: {
  videoUrl: string;
  placeholderSrc: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFrame, setShowFrame] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl || failed) return;
    el.currentTime = 0;
    const onLoaded = () => {
      el.currentTime = 0;
      setShowFrame(true);
    };
    const onErr = () => setFailed(true);
    el.addEventListener("loadeddata", onLoaded);
    el.addEventListener("error", onErr);
    if (el.readyState >= 2) {
      el.currentTime = 0;
      setShowFrame(true);
    }
    return () => {
      el.removeEventListener("loadeddata", onLoaded);
      el.removeEventListener("error", onErr);
    };
  }, [videoUrl, failed]);

  useEffect(() => {
    setShowFrame(false);
    setFailed(false);
  }, [videoUrl]);

  if (failed) {
    return <VideoFirstFrameImg src={placeholderSrc} alt="" />;
  }

  return (
    <VideoFirstFrameWrap>
      <VideoFirstFrameImg
        src={placeholderSrc}
        alt=""
        style={{ opacity: showFrame ? 0 : 1 }}
      />
      <VideoFirstFrameVideo
        ref={videoRef}
        src={videoUrl}
        preload="auto"
        muted
        playsInline
        style={{ opacity: showFrame ? 1 : 0, position: "absolute", inset: 0 }}
        onLoadedData={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setShowFrame(true);
          }
        }}
        onError={() => setFailed(true)}
      />
    </VideoFirstFrameWrap>
  );
}

const PageRoot = styled.div`
  flex: 1;
  min-width: 0;
  overflow: auto;
  background-color: rgb(255 255 255);
`;

const ContentWrap = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px 0;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 44px;
  gap: 80px;
  padding-bottom: 44px;
  border-bottom: ${BORDER};
`;

const AvatarWrap = styled.div`
  flex-shrink: 0;
`;

const AvatarLarge = styled(Avatar)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
`;

const FallbackLarge = styled(AvatarFallback)`
  font-size: 48px;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366);
  color: white;
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Username = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 300;
  color: ${TEXT_PRIMARY};
  line-height: 1.2;
`;

const VerifiedDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${TEXT_PRIMARY};
`;

const FullName = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 16px;
  color: ${TEXT_PRIMARY};
`;

const Stat = styled.span`
  font-weight: 400;
`;

const StatButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  font-weight: 400;
  &:hover {
    text-decoration: underline;
  }
`;

const Handle = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${TEXT_SECONDARY};
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionBtn = styled(Button)`
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  background-color: ${BG_BUTTON};
  color: ${TEXT_PRIMARY};
  border: none;

  &:hover {
    background-color: rgb(219 219 219);
  }
`;

const NewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 44px;
`;

const NewBtn = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid ${TEXT_PRIMARY};
  background: transparent;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgb(239 239 239);
  }
`;

const NewLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border-top: ${BORDER};
  margin-bottom: 0;
`;

const Tab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  margin-top: -1px;
  border: none;
  border-top: 1px solid ${(p) => (p.$active ? TEXT_PRIMARY : "transparent")};
  background: none;
  cursor: pointer;
  color: ${(p) => (p.$active ? TEXT_PRIMARY : TEXT_SECONDARY)};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 80px;
  justify-content: center;

  &:hover {
    color: ${TEXT_PRIMARY};
  }
`;

const TabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const GridCell = styled.button`
  aspect-ratio: 1;
  padding: 0;
  border: none;
  background: rgb(239 239 239);
  cursor: pointer;
  overflow: hidden;
  display: block;
  position: relative;
`;

const GridImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: rgb(239 239 239);
`;

const VideoCoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const PlayIcon = styled(Play)`
  width: 28px;
  height: 28px;
  color: rgb(255 255 255);
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.5));
`;

const Footer = styled.footer`
  margin-top: 48px;
  padding: 24px 0 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const FooterLinks = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  text-align: center;
  line-height: 1.6;
`;

const FooterLangWrap = styled.div`
  position: relative;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const FooterLangTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    color: ${TEXT_PRIMARY};
    background: rgb(239 239 239);
  }
`;

const FooterLangDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  min-width: 160px;
  padding: 8px 0;
  background: rgb(255 255 255);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgb(0 0 0 / 0.12);
  border: 1px solid rgb(219 219 219);
  z-index: 10;
  max-height: 280px;
  overflow-y: auto;
`;

const FooterLangOption = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  text-align: left;
  &:hover {
    background: rgb(250 250 250);
  }
  ${(p) => p.$selected && "font-weight: 600;"}
`;

const FooterCopy = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

export interface ProfilePageProps {
  user:
    | {
        id: string;
        username?: string;
        name?: string;
        avatar?: string;
      }
    | null
    | undefined;
  posts: FeedPost[];
  followersCount?: number;
  followingCount?: number;
  onEditProfile?: () => void;
  onViewArchive?: () => void;
  onNewPost?: () => void;
  onPostClick?: (post: FeedPost) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

type ProfileTab = "grid" | "saved" | "tagged";

export function ProfilePage({
  user,
  posts,
  followersCount = 0,
  followingCount = 0,
  onEditProfile,
  onViewArchive,
  onNewPost,
  onPostClick,
  onFollowersClick,
  onFollowingClick,
}: ProfilePageProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("grid");
  const [langOpen, setLangOpen] = useState(false);
  const currentLocale = getLocale();

  const handleLocaleChange = (locale: AppLocale) => {
    setStoredLocale(locale);
    i18n.changeLanguage(locale);
    setLangOpen(false);
  };

  const myPosts = posts.filter((p) => p.userId === user?.id);
  const postCount = myPosts.length;
  const username = user?.username ?? "";
  const fullName = user?.name ?? "";
  const handleStr = username ? `@${username}` : "";

  const gridCoverUrl = (post: FeedPost): string => {
    if (post.type === "VIDEO") {
      const poster = videoPosterUrl(post);
      return poster ?? VIDEO_COVER_PLACEHOLDER;
    }
    return post.imageUrl ?? "";
  };

  return (
    <PageRoot>
      <ContentWrap>
        <ProfileHeader>
          <AvatarWrap>
            <AvatarLarge>
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <FallbackLarge>{(fullName || username || "?")[0]}</FallbackLarge>
            </AvatarLarge>
          </AvatarWrap>
          <InfoBlock>
            <UsernameRow>
              <Username>{username || fullName || "—"}</Username>
              <VerifiedDot />
            </UsernameRow>
            {fullName && <FullName>{fullName}</FullName>}
            <StatsRow>
              <Stat>
                {t("profile.postsCount", { count: String(postCount) } as Record<
                  string,
                  string
                >)}
              </Stat>
              {onFollowersClick ? (
                <StatButton type="button" onClick={onFollowersClick}>
                  {t("profile.followersCount", {
                    count: String(followersCount),
                  } as Record<string, string>)}
                </StatButton>
              ) : (
                <Stat>
                  {t("profile.followersCount", {
                    count: String(followersCount),
                  } as Record<string, string>)}
                </Stat>
              )}
              {onFollowingClick ? (
                <StatButton type="button" onClick={onFollowingClick}>
                  {t("profile.followingCount", {
                    count: String(followingCount),
                  } as Record<string, string>)}
                </StatButton>
              ) : (
                <Stat>
                  {t("profile.followingCount", {
                    count: String(followingCount),
                  } as Record<string, string>)}
                </Stat>
              )}
            </StatsRow>
            {handleStr && <Handle>{handleStr}</Handle>}
            {(onEditProfile || onViewArchive) && (
              <ActionsRow>
                {onEditProfile && (
                  <ActionBtn onClick={onEditProfile}>
                    {t("profile.editProfile")}
                  </ActionBtn>
                )}
                {onViewArchive && (
                  <ActionBtn onClick={onViewArchive}>
                    {t("profile.viewArchive")}
                  </ActionBtn>
                )}
              </ActionsRow>
            )}
          </InfoBlock>
        </ProfileHeader>

        {onNewPost && (
          <NewSection>
            <NewBtn
              type="button"
              onClick={onNewPost}
              aria-label={t("profile.new")}
            >
              <Plus size={24} strokeWidth={2} />
            </NewBtn>
            <NewLabel>{t("profile.new")}</NewLabel>
          </NewSection>
        )}

        <TabsRow>
          <Tab
            $active={activeTab === "grid"}
            onClick={() => setActiveTab("grid")}
          >
            <TabIcon>
              <LayoutGrid size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabGrid")}
          </Tab>
          <Tab
            $active={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
          >
            <TabIcon>
              <Bookmark size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabSaved")}
          </Tab>
          <Tab
            $active={activeTab === "tagged"}
            onClick={() => setActiveTab("tagged")}
          >
            <TabIcon>
              <UserCheck size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabTagged")}
          </Tab>
        </TabsRow>

        {activeTab === "grid" && (
          <GridWrap>
            {myPosts.map((post) => {
              const videoUrl = getVideoUrl(post);
              const isVideo = post.type === "VIDEO";
              const poster = isVideo ? videoPosterUrl(post) : null;
              return (
                <GridCell
                  key={post.id}
                  type="button"
                  onClick={() => onPostClick?.(post)}
                >
                  {isVideo && videoUrl && !poster ? (
                    <VideoFirstFrameCover
                      videoUrl={videoUrl}
                      placeholderSrc={VIDEO_COVER_PLACEHOLDER}
                    />
                  ) : (
                    <GridImg
                      src={gridCoverUrl(post) || VIDEO_COVER_PLACEHOLDER}
                      alt=""
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (el.src !== VIDEO_COVER_PLACEHOLDER)
                          el.src = VIDEO_COVER_PLACEHOLDER;
                      }}
                    />
                  )}
                  {isVideo && (
                    <VideoCoverOverlay>
                      <PlayIcon size={28} fill="currentColor" />
                    </VideoCoverOverlay>
                  )}
                </GridCell>
              );
            })}
          </GridWrap>
        )}
        {activeTab === "saved" && <GridWrap />}
        {activeTab === "tagged" && <GridWrap />}

        <Footer>
          <FooterLinks>{t("profile.footerLinks")}</FooterLinks>
          <FooterLangWrap>
            <FooterLangTrigger
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={t("profile.language")}
            >
              {currentLocale === "zh" ? "中文" : "English"} ▼
            </FooterLangTrigger>
            {langOpen && (
              <>
                <div
                  role="presentation"
                  style={{ position: "fixed", inset: 0, zIndex: 9 }}
                  onClick={() => setLangOpen(false)}
                />
                <FooterLangDropdown role="listbox">
                  {FOOTER_LANG_OPTIONS.map((opt) => (
                    <FooterLangOption
                      key={opt.value}
                      type="button"
                      role="option"
                      $selected={currentLocale === opt.value}
                      aria-selected={currentLocale === opt.value}
                      onClick={() => handleLocaleChange(opt.value)}
                    >
                      {opt.value === currentLocale ? "✓ " : ""}
                      {opt.label}
                    </FooterLangOption>
                  ))}
                </FooterLangDropdown>
              </>
            )}
          </FooterLangWrap>
          <FooterCopy>{t("profile.copyright")}</FooterCopy>
        </Footer>
      </ContentWrap>
    </PageRoot>
  );
}
