"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  User,
  Lock,
  Settings,
  Pencil,
  Bell,
  Star,
  Ban,
  Zap,
  Send,
  AtSign,
  MessageCircle,
  Share2,
  MinusCircle,
  Type,
  Eye,
  Infinity,
  Globe,
  Archive,
  Accessibility,
  FileQuestion,
  Shield,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "@/auth/use-auth";
import {
  useTranslation,
  setStoredLocale,
  type AppLocale,
} from "@/src/shared/i18n";
import { getApiClient } from "@/core/api-client";
import { FileApi } from "@/ai/apis/file.api";
import { useToast } from "@/shared/ui/use-toast";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BLUE = "rgb(0 149 246)";
const BG_SELECTED = "rgb(239 239 239)";

const PageRoot = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background-color: rgb(255 255 255);
`;

const Sidebar = styled.aside`
  width: 280px;
  min-width: 280px;
  border-right: ${BORDER};
  overflow-y: auto;
  padding: 24px 0 24px 16px;
`;

const SettingsTitle = styled.h1`
  margin: 0 12px 16px;
  font-size: 22px;
  font-weight: 600;
  color: ${TEXT};
`;

const SearchInput = styled.input`
  width: 100%;
  margin: 0 12px 16px;
  padding: 10px 12px;
  font-size: 14px;
  border: ${BORDER};
  border-radius: 8px;
  background: rgb(239 239 239);
  color: ${TEXT};
  box-sizing: border-box;

  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT};
`;

const SectionDesc = styled.p`
  margin: 0 12px 12px;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  line-height: 1.4;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.$active ? BG_SELECTED : "transparent")};
  color: ${TEXT};
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgb(239 239 239);
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavLink = styled.a`
  margin: 8px 12px 0;
  font-size: 12px;
  color: ${BLUE};
  cursor: pointer;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 44px 48px;
`;

const PanelTitle = styled.h2`
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: ${TEXT};
`;

const EditProfilePhotoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 32px;
`;

const AvatarLarge = styled(Avatar)`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const AvatarFallbackText = styled(AvatarFallback)`
  font-size: 28px;
`;

const PhotoInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UsernameLine = styled.p`
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 400;
  color: ${TEXT};
`;

const FullNameLine = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  color: ${TEXT_SECONDARY};
`;

const ChangePhotoBtn = styled(Button)`
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${BLUE};
  background: transparent;
  border: none;

  &:hover {
    background: transparent;
    color: rgb(0 119 199);
  }
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const FieldLabel = styled(Label)`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${TEXT};
`;

const FieldInput = styled(Input)`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: ${BORDER};
  border-radius: 8px;
  box-sizing: border-box;
`;

const FieldNote = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  line-height: 1.4;
`;

const BioWrap = styled.div`
  position: relative;
`;

const BioInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px 12px 28px;
  font-size: 14px;
  font-family: inherit;
  border: ${BORDER};
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
`;

const BioCount = styled.span`
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ToggleLabel = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 16px;
`;

const ToggleTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${TEXT};
`;

const ToggleDesc = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  line-height: 1.4;
`;

const ProfileInfoNote = styled.p`
  margin: 24px 0;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  line-height: 1.5;
`;

const ProfileInfoLink = styled.a`
  color: ${BLUE};
  cursor: pointer;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitBtn = styled(Button)`
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: ${BLUE};
  color: white;
  border: none;

  &:hover {
    background-color: rgb(0 119 199);
  }
`;

const MessagesBtn = styled(Button)`
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  color: ${BLUE};
  border: ${BORDER};

  &:hover {
    background: rgb(249 250 251);
  }
`;

const SendIcon = styled(Send)`
  height: 18px;
  width: 18px;
  margin-right: 6px;
`;

const BackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: ${TEXT};
  cursor: pointer;

  &:hover {
    color: ${TEXT_SECONDARY};
  }
`;

const LanguageSearch = styled.input`
  width: 100%;
  margin-bottom: 16px;
  padding: 10px 12px;
  font-size: 14px;
  border: ${BORDER};
  border-radius: 8px;
  background: rgb(239 239 239);
  color: ${TEXT};
  box-sizing: border-box;

  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const LanguageList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LanguageItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: ${BORDER};
  background: none;
  color: ${TEXT};
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgb(249 250 251);
  }
`;

const RadioOuter = styled.span<{ $selected?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${(p: { $selected?: boolean }) => (p.$selected ? TEXT : TEXT_SECONDARY)};
  background: ${(p: { $selected?: boolean }) =>
    p.$selected ? TEXT : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RadioInner = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
`;

type SettingsSection =
  | "editProfile"
  | "notifications"
  | "accountPrivacy"
  | "closeFriends"
  | "blocked"
  | "storyAndLocation"
  | "messagesAndStoryReplies"
  | "tagsAndMentions"
  | "comments"
  | "sharingAndReuse"
  | "restrictedAccounts"
  | "hiddenWords"
  | "mutedAccounts"
  | "contentPreferences"
  | "likeAndShareCounts"
  | "subscriptions"
  | "archivingAndDownloading"
  | "accessibility"
  | "language"
  | "websitePermissions"
  | "supervisionForTeenAccounts"
  | "accountTypeAndTools"
  | "metaVerified"
  | "help"
  | "privacyCenter"
  | "accountStatus";

interface SettingsPageProps {
  onBack: () => void;
  onProfileClick: () => void;
}

export function SettingsPage({ onBack, onProfileClick }: SettingsPageProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<SettingsSection>("editProfile");
  const [bio, setBio] = useState(user?.about ?? "");
  const [showThreadsBadge, setShowThreadsBadge] = useState(false);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  const [gender, setGender] = useState<string>("male");
  const [languageSearch, setLanguageSearch] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileApi = useRef(new FileApi(getApiClient()));
  const currentLocale: AppLocale = i18n.language.startsWith("zh") ? "zh" : "en";
  const currentAvatar = avatarPreview || user?.avatar || "/placeholder.svg";

  useEffect(() => {
    return () => {
      if (
        lastObjectUrlRef.current &&
        lastObjectUrlRef.current.startsWith("blob:")
      ) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const bioLength = bio.length;

  const handleLocaleChange = (locale: AppLocale) => {
    setStoredLocale(locale);
    i18n.changeLanguage(locale);
  };

  const handleSubmit = async () => {
    if (savingProfile) {
      return;
    }
    try {
      setSavingProfile(true);
      const result = await updateUser({ about: bio });
      if (!result.success) {
        throw new Error(result.error || "Update profile failed");
      }
      toast({
        title: "Saved",
        description: "Your profile changes have been saved.",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Failed to save profile changes. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }
    onProfileClick();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploadingAvatar) {
      return;
    }
    const previousAvatar = currentAvatar;
    if (
      lastObjectUrlRef.current &&
      lastObjectUrlRef.current.startsWith("blob:")
    ) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    const localPreviewUrl = URL.createObjectURL(file);
    lastObjectUrlRef.current = localPreviewUrl;
    setAvatarPreview(localPreviewUrl);
    try {
      setUploadingAvatar(true);
      const uploadResponse = await fileApi.current.uploadFile(file, "avatar");
      const avatarUrl = (uploadResponse.data as { url?: string } | undefined)
        ?.url;
      if (!avatarUrl) {
        throw new Error("Avatar upload failed");
      }
      const updateResult = await updateUser({ avatar: avatarUrl });
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Update avatar failed");
      }
      setAvatarPreview(avatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile photo has been updated successfully.",
      });
      if (
        lastObjectUrlRef.current &&
        lastObjectUrlRef.current.startsWith("blob:")
      ) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
      lastObjectUrlRef.current = null;
    } catch {
      toast({
        title: "Update failed",
        description: "Failed to update avatar. Please try again.",
      });
      setAvatarPreview(previousAvatar);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
    const icons: Record<string, React.ReactNode> = {
      user: <User size={size} />,
      lock: <Lock size={size} />,
      settings: <Settings size={size} />,
      pencil: <Pencil size={size} />,
      bell: <Bell size={size} />,
      star: <Star size={size} />,
      ban: <Ban size={size} />,
      zap: <Zap size={size} />,
      send: <Send size={size} />,
      at: <AtSign size={size} />,
      message: <MessageCircle size={size} />,
      share: <Share2 size={size} />,
      minus: <MinusCircle size={size} />,
      type: <Type size={size} />,
      eye: <Eye size={size} />,
      globe: <Globe size={size} />,
      archive: <Archive size={size} />,
      accessibility: <Accessibility size={size} />,
      help: <FileQuestion size={size} />,
      shield: <Shield size={size} />,
      clipboard: <ClipboardList size={size} />,
    };
    return <>{icons[name] ?? null}</>;
  };

  const languageOptions: { value: AppLocale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "zh", label: "中文" },
  ];
  const filteredLanguages = languageOptions.filter((opt) =>
    opt.label.toLowerCase().includes(languageSearch.trim().toLowerCase()),
  );

  return (
    <PageRoot>
      <Sidebar>
        <SettingsTitle>{t("settings.title")}</SettingsTitle>
        <SearchInput
          type="text"
          placeholder={t("settings.searchPlaceholder")}
        />

        <Section>
          <SectionTitle>
            <Infinity size={18} />
            {t("settings.metaAccountsCenter")}
          </SectionTitle>
          <SectionDesc>{t("settings.metaAccountsDesc")}</SectionDesc>
          <NavItem onClick={() => setSection("editProfile")}>
            <NavIcon>
              <Icon name="user" />
            </NavIcon>
            {t("settings.personalDetails")}
          </NavItem>
          <NavItem>
            <NavIcon>
              <Icon name="lock" />
            </NavIcon>
            {t("settings.passwordAndSecurity")}
          </NavItem>
          <NavItem>
            <NavIcon>
              <Icon name="settings" />
            </NavIcon>
            {t("settings.adPreferences")}
          </NavItem>
          <NavLink>{t("settings.seeMoreInAccountsCenter")}</NavLink>
        </Section>

        <Section>
          <SectionTitle>{t("settings.howYouUse")}</SectionTitle>
          <NavItem
            $active={section === "editProfile"}
            onClick={() => setSection("editProfile")}
          >
            <NavIcon>
              <Icon name="pencil" />
            </NavIcon>
            {t("settings.editProfile")}
          </NavItem>
          <NavItem
            $active={section === "notifications"}
            onClick={() => setSection("notifications")}
          >
            <NavIcon>
              <Icon name="bell" />
            </NavIcon>
            {t("settings.notifications")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.whoCanSee")}</SectionTitle>
          <NavItem onClick={() => setSection("accountPrivacy")}>
            <NavIcon>
              <Icon name="lock" />
            </NavIcon>
            {t("settings.accountPrivacy")}
          </NavItem>
          <NavItem onClick={() => setSection("closeFriends")}>
            <NavIcon>
              <Icon name="star" />
            </NavIcon>
            {t("settings.closeFriends")}
          </NavItem>
          <NavItem onClick={() => setSection("blocked")}>
            <NavIcon>
              <Icon name="ban" />
            </NavIcon>
            {t("settings.blocked")}
          </NavItem>
          <NavItem onClick={() => setSection("storyAndLocation")}>
            <NavIcon>
              <Icon name="zap" />
            </NavIcon>
            {t("settings.storyAndLocation")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.howOthersInteract")}</SectionTitle>
          <NavItem onClick={() => setSection("messagesAndStoryReplies")}>
            <NavIcon>
              <Icon name="send" />
            </NavIcon>
            {t("settings.messagesAndStoryReplies")}
          </NavItem>
          <NavItem onClick={() => setSection("tagsAndMentions")}>
            <NavIcon>
              <Icon name="at" />
            </NavIcon>
            {t("settings.tagsAndMentions")}
          </NavItem>
          <NavItem onClick={() => setSection("comments")}>
            <NavIcon>
              <Icon name="message" />
            </NavIcon>
            {t("settings.comments")}
          </NavItem>
          <NavItem onClick={() => setSection("sharingAndReuse")}>
            <NavIcon>
              <Icon name="share" />
            </NavIcon>
            {t("settings.sharingAndReuse")}
          </NavItem>
          <NavItem onClick={() => setSection("restrictedAccounts")}>
            <NavIcon>
              <Icon name="minus" />
            </NavIcon>
            {t("settings.restrictedAccounts")}
          </NavItem>
          <NavItem onClick={() => setSection("hiddenWords")}>
            <NavIcon>
              <Icon name="type" />
            </NavIcon>
            {t("settings.hiddenWords")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.whatYouSee")}</SectionTitle>
          <NavItem onClick={() => setSection("mutedAccounts")}>
            <NavIcon>
              <Icon name="bell" />
            </NavIcon>
            {t("settings.mutedAccounts")}
          </NavItem>
          <NavItem onClick={() => setSection("contentPreferences")}>
            <NavIcon>
              <Icon name="eye" />
            </NavIcon>
            {t("settings.contentPreferences")}
          </NavItem>
          <NavItem onClick={() => setSection("likeAndShareCounts")}>
            <NavIcon>
              <Icon name="share" />
            </NavIcon>
            {t("settings.likeAndShareCounts")}
          </NavItem>
          <NavItem onClick={() => setSection("subscriptions")}>
            <NavIcon>
              <Icon name="star" />
            </NavIcon>
            {t("settings.subscriptions")}
          </NavItem>
          <NavItem>
            <NavIcon>
              <Icon name="eye" />
            </NavIcon>
            {t("settings.appearance")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.yourAppAndMedia")}</SectionTitle>
          <NavItem onClick={() => setSection("archivingAndDownloading")}>
            <NavIcon>
              <Icon name="archive" />
            </NavIcon>
            {t("settings.archivingAndDownloading")}
          </NavItem>
          <NavItem onClick={() => setSection("accessibility")}>
            <NavIcon>
              <Icon name="accessibility" />
            </NavIcon>
            {t("settings.accessibility")}
          </NavItem>
          <NavItem
            $active={section === "language"}
            onClick={() => setSection("language")}
          >
            <NavIcon>
              <Icon name="globe" />
            </NavIcon>
            {t("settings.language")}
          </NavItem>
          <NavItem onClick={() => setSection("websitePermissions")}>
            <NavIcon>
              <Icon name="lock" />
            </NavIcon>
            {t("settings.websitePermissions")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.familyCenter")}</SectionTitle>
          <NavItem onClick={() => setSection("supervisionForTeenAccounts")}>
            <NavIcon>
              <Icon name="shield" />
            </NavIcon>
            {t("settings.supervisionForTeenAccounts")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.forProfessionals")}</SectionTitle>
          <NavItem onClick={() => setSection("accountTypeAndTools")}>
            <NavIcon>
              <Icon name="settings" />
            </NavIcon>
            {t("settings.accountTypeAndTools")}
          </NavItem>
          <NavItem onClick={() => setSection("metaVerified")}>
            <NavIcon>
              <Icon name="star" />
            </NavIcon>
            {t("settings.metaVerified")}
          </NavItem>
        </Section>

        <Section>
          <SectionTitle>{t("settings.moreInfoAndSupport")}</SectionTitle>
          <NavItem onClick={() => setSection("help")}>
            <NavIcon>
              <Icon name="help" />
            </NavIcon>
            {t("settings.help")}
          </NavItem>
          <NavItem onClick={() => setSection("privacyCenter")}>
            <NavIcon>
              <Icon name="shield" />
            </NavIcon>
            {t("settings.privacyCenter")}
          </NavItem>
          <NavItem onClick={() => setSection("accountStatus")}>
            <NavIcon>
              <Icon name="clipboard" />
            </NavIcon>
            {t("settings.accountStatus")}
          </NavItem>
        </Section>

        <Section>
          <NavItem
            onClick={handleLogout}
            style={{ color: "rgb(237 73 86)", fontWeight: 600 }}
          >
            {t("settings.logout")}
          </NavItem>
        </Section>
      </Sidebar>

      <Main>
        {section === "editProfile" && (
          <>
            <PanelTitle>{t("settings.editProfile")}</PanelTitle>
            <EditProfilePhotoRow>
              <AvatarLarge>
                <AvatarImage src={currentAvatar} />
                <AvatarFallbackText>
                  {(user?.name || user?.username || "?")[0]}
                </AvatarFallbackText>
              </AvatarLarge>
              <PhotoInfo>
                <UsernameLine>{user?.username ?? ""}</UsernameLine>
                <FullNameLine>
                  {user?.name || t("settings.profileDefaultName")}
                </FullNameLine>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <ChangePhotoBtn
                  variant="ghost"
                  onClick={handlePickAvatar}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar
                    ? `${t("common.loading")}...`
                    : t("settings.changePhoto")}
                </ChangePhotoBtn>
              </PhotoInfo>
            </EditProfilePhotoRow>

            <Field>
              <FieldLabel>{t("settings.website")}</FieldLabel>
              <FieldInput
                type="text"
                placeholder={t("settings.websitePlaceholder")}
                disabled
              />
              <FieldNote>{t("settings.websiteMobileNote")}</FieldNote>
            </Field>

            <Field>
              <FieldLabel>{t("settings.bio")}</FieldLabel>
              <BioWrap>
                <BioInput
                  placeholder={t("settings.bioPlaceholder")}
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 150))}
                  maxLength={150}
                />
                <BioCount>
                  {t("settings.bioCharCount", {
                    current: String(bioLength),
                  } as Record<string, string>)}
                </BioCount>
              </BioWrap>
            </Field>

            <ToggleRow>
              <ToggleLabel>
                <ToggleTitle>{t("settings.showThreadsBadge")}</ToggleTitle>
              </ToggleLabel>
              <Switch
                checked={showThreadsBadge}
                onCheckedChange={setShowThreadsBadge}
              />
            </ToggleRow>

            <Field>
              <FieldLabel>{t("settings.gender")}</FieldLabel>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger style={{ maxWidth: 200 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("settings.male")}</SelectItem>
                  <SelectItem value="female">{t("settings.female")}</SelectItem>
                  <SelectItem value="preferNotToSay">
                    {t("settings.preferNotToSay")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldNote>{t("settings.genderNotPublic")}</FieldNote>
            </Field>

            <ToggleRow>
              <ToggleLabel>
                <ToggleTitle>
                  {t("settings.showAccountSuggestions")}
                </ToggleTitle>
                <ToggleDesc>
                  {t("settings.showAccountSuggestionsDesc")}
                </ToggleDesc>
              </ToggleLabel>
              <Switch
                checked={showAccountSuggestions}
                onCheckedChange={setShowAccountSuggestions}
              />
            </ToggleRow>

            <ProfileInfoNote>
              {t("settings.profileInfoVisible")}{" "}
              <ProfileInfoLink>
                {t("settings.seeWhatProfileInfoVisible")}
              </ProfileInfoLink>
            </ProfileInfoNote>

            <ActionRow>
              <SubmitBtn onClick={handleSubmit} disabled={savingProfile}>
                {savingProfile
                  ? `${t("common.loading")}...`
                  : t("settings.submit")}
              </SubmitBtn>
              <MessagesBtn variant="outline" onClick={onBack}>
                <SendIcon />
                Messages
              </MessagesBtn>
            </ActionRow>
          </>
        )}

        {section === "notifications" && (
          <>
            <PanelTitle>{t("settings.notifications")}</PanelTitle>
            <FieldNote>{t("settings.notificationsDesc")}</FieldNote>
          </>
        )}

        {section === "language" && (
          <>
            <BackRow>
              <BackBtn
                type="button"
                onClick={() => setSection("editProfile")}
                aria-label="Back"
              >
                <ArrowLeft size={24} />
              </BackBtn>
              <PanelTitle style={{ marginBottom: 0 }}>
                {t("settings.languagePreferences")}.
              </PanelTitle>
            </BackRow>
            <FieldLabel style={{ marginBottom: 4 }}>
              {t("settings.appLanguage")}
            </FieldLabel>
            <FieldNote style={{ marginTop: 0, marginBottom: 16 }}>
              {t("settings.appLanguageSubtitle")}
            </FieldNote>
            <LanguageSearch
              type="text"
              placeholder={t("settings.searchPlaceholder")}
              value={languageSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLanguageSearch(e.target.value)
              }
            />
            <LanguageList>
              {filteredLanguages.map((opt) => (
                <LanguageItem
                  key={opt.value}
                  type="button"
                  $selected={currentLocale === opt.value}
                  onClick={() => handleLocaleChange(opt.value)}
                >
                  <span>{opt.label}</span>
                  <RadioOuter $selected={currentLocale === opt.value}>
                    {currentLocale === opt.value ? <RadioInner /> : null}
                  </RadioOuter>
                </LanguageItem>
              ))}
            </LanguageList>
          </>
        )}

        {section !== "editProfile" &&
          section !== "notifications" &&
          section !== "language" && (
            <>
              <PanelTitle>{t(`settings.${section}`)}</PanelTitle>
              <FieldNote>{t("settings.privacyDesc")}</FieldNote>
            </>
          )}
      </Main>
    </PageRoot>
  );
}
