import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme";
import { useAppDispatch, logout as logoutThunk } from "@/core/store/hooks";
import { styled } from "@/shared/emotion";
import { useTranslation } from "@/shared/i18n";
import { setStoredLanguage, type AppLanguage } from "@/shared/i18n";
import type { ThemeMode } from "@/shared/theme";

const APP_NAME = "WhatsFeed";
const META_BLUE = "#0668E1";

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 4px;
  padding-vertical: 8px;
  min-height: 44px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${(p) =>
    (p.theme as { colors?: { separator?: string } })?.colors?.separator ??
    "#C6C6C8"};
`;

const TopTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: ${(p) =>
    (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-top: 20px;
  padding-bottom: 8px;
`;

const SectionHeaderText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${(p) =>
    (p.theme as { colors?: { secondaryText?: string } })?.colors
      ?.secondaryText};
`;

const SectionGap = styled.View`
  height: 10px;
`;

const Group = styled.View`
  background-color: ${(p) =>
    (p.theme as { colors?: { secondaryBackground?: string } })?.colors
      ?.secondaryBackground};
`;

const THEME_OPTIONS: {
  mode: ThemeMode;
  key: "themeLight" | "themeDark" | "themeSystem";
}[] = [
  { mode: "light", key: "themeLight" },
  { mode: "dark", key: "themeDark" },
  { mode: "system", key: "themeSystem" },
];

const LANGUAGE_OPTIONS: {
  lng: AppLanguage;
  key: "languageEnglish" | "languageChinese";
}[] = [
  { lng: "en", key: "languageEnglish" },
  { lng: "zh", key: "languageChinese" },
];

type IonName = React.ComponentProps<typeof Ionicons>["name"];

function LinkRow({
  icon,
  title,
  value,
  onPress,
  colors,
  isDark,
  showSeparator,
}: {
  icon: IonName;
  title: string;
  value?: string;
  onPress: () => void;
  colors: { primaryText: string; secondaryText: string; separator: string };
  isDark: boolean;
  showSeparator: boolean;
}) {
  const pressedBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            minHeight: 50,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: pressed ? pressedBg : "transparent",
          },
        ]}
      >
        <View style={{ width: 28, alignItems: "center" }}>
          <Ionicons name={icon} size={24} color={colors.primaryText} />
        </View>
        <Text
          style={{
            flex: 1,
            marginLeft: 14,
            fontSize: 16,
            fontWeight: "400",
            color: colors.primaryText,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        {value ? (
          <Text
            style={{
              fontSize: 15,
              color: colors.secondaryText,
              marginRight: 6,
            }}
          >
            {value}
          </Text>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.secondaryText}
        />
      </Pressable>
      {showSeparator ? (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            marginLeft: 60,
            backgroundColor: colors.separator,
          }}
        />
      ) : null}
    </>
  );
}

function AccountsCenterRow({
  onPress,
  title,
  subtitle,
  colors,
  isDark,
}: {
  onPress: () => void;
  title: string;
  subtitle: string;
  colors: { primaryText: string; secondaryText: string };
  isDark: boolean;
}) {
  const pressedBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed ? pressedBg : "transparent",
      })}
    >
      <View style={{ width: 28, alignItems: "center" }}>
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={colors.primaryText}
        />
      </View>
      <View style={{ flex: 1, marginLeft: 14, marginRight: 8 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: colors.primaryText }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            marginTop: 4,
            color: colors.secondaryText,
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </Pressable>
  );
}

export const SettingsMenuScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const [search, setSearch] = useState("");

  const languageLabel =
    i18n.language === "zh"
      ? t("settings.languageChinese")
      : t("settings.languageEnglish");
  const themeLabel =
    themeMode === "system"
      ? t("settings.themeSystem")
      : themeMode === "dark"
        ? t("settings.themeDark")
        : t("settings.themeLight");

  const comingSoon = useCallback(() => {
    Alert.alert(t("notifications.title"), t("notifications.comingSoon"));
  }, [t]);

  const handleThemePress = () => {
    Alert.alert(t("settings.theme"), undefined, [
      ...THEME_OPTIONS.map(({ mode, key }) => ({
        text: t(`settings.${key}`),
        onPress: () => setThemeMode(mode),
      })),
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleLanguagePress = () => {
    Alert.alert(t("settings.language"), undefined, [
      ...LANGUAGE_OPTIONS.map(({ lng, key }) => ({
        text: t(`settings.${key}`),
        onPress: async () => {
          await setStoredLanguage(lng);
          await i18n.changeLanguage(lng);
        },
      })),
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      t("settings.logoutConfirmTitle"),
      t("settings.logoutConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.logout"),
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutThunk());
            router.replace("/login");
          },
        },
      ],
    );
  };

  const howYouUseTitle = t("settings.howYouUse", { app: APP_NAME });

  const rowColors = {
    primaryText: colors.primaryText,
    secondaryText: colors.secondaryText,
    separator: colors.separator,
  };

  const searchBg = isDark ? "rgba(118,118,128,0.24)" : "rgba(118,118,128,0.12)";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.secondaryBackground }}
      edges={["top"]}
    >
      <View style={{ flex: 1, backgroundColor: colors.tertiaryBackground }}>
        <TopBar style={{ backgroundColor: colors.secondaryBackground }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ width: 44, height: 44, justifyContent: "center" }}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.primaryText}
            />
          </Pressable>
          <TopTitle>{t("settings.activityTitle")}</TopTitle>
          <View style={{ width: 44 }} />
        </TopBar>

        <ScrollView
          style={{ flex: 1, backgroundColor: colors.tertiaryBackground }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: colors.secondaryBackground,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 38,
                borderRadius: 10,
                paddingHorizontal: 12,
                backgroundColor: searchBg,
              }}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.secondaryText}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("settings.searchPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 16,
                  color: colors.primaryText,
                  paddingVertical: 0,
                }}
                returnKeyType="search"
              />
            </View>
          </View>

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{t("settings.yourAccount")}</SectionHeaderText>
            <Text style={{ fontSize: 14, fontWeight: "600", color: META_BLUE }}>
              {t("settings.metaBrand")}
            </Text>
          </SectionHeaderRow>
          <Group>
            <AccountsCenterRow
              title={t("settings.accountsCenter")}
              subtitle={t("settings.accountsCenterSubtitle")}
              onPress={comingSoon}
              colors={{
                primaryText: colors.primaryText,
                secondaryText: colors.secondaryText,
              }}
              isDark={isDark}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{howYouUseTitle}</SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="bookmark-outline"
              title={t("settings.saved")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="archive-outline"
              title={t("settings.archive")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="pulse-outline"
              title={t("settings.yourActivity")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="notifications-outline"
              title={t("settings.notifications")}
              onPress={() => router.push("/notifications")}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="time-outline"
              title={t("settings.timeManagement")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{t("settings.whoCanSee")}</SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="lock-closed-outline"
              title={t("settings.accountPrivacy")}
              value={t("settings.publicStatus")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="star-outline"
              title={t("settings.closeFriends")}
              value={t("settings.countZero")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="grid-outline"
              title={t("settings.crossposting")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="close-circle-outline"
              title={t("settings.blocked")}
              value={t("settings.countZero")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="eye-off-outline"
              title={t("settings.storyLiveLocation")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="person-outline"
              title={t("settings.activityFriendsTab")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>
              {t("settings.howOthersInteract")}
            </SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="chatbubble-ellipses-outline"
              title={t("settings.messagesStoryReplies")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="at-outline"
              title={t("settings.tagsAndMentions")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="chatbox-ellipses-outline"
              title={t("settings.comments")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="repeat-outline"
              title={t("settings.sharingReuse")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="eye-off-outline"
              title={t("settings.restricted")}
              value={t("settings.countZero")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="alert-circle-outline"
              title={t("settings.limitInteractions")}
              value={t("settings.statusOff")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="reader-outline"
              title={t("settings.hiddenWords")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="person-add-outline"
              title={t("settings.followInviteFriends")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{t("settings.whatYouSee")}</SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="star-outline"
              title={t("settings.favorites")}
              value={t("settings.countZero")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="notifications-off-outline"
              title={t("settings.mutedAccounts")}
              value={t("settings.countZero")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="albums-outline"
              title={t("settings.contentPreferences")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="heart-half-outline"
              title={t("settings.likeShareCounts")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="diamond-outline"
              title={t("settings.subscriptions")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{t("settings.yourAppMedia")}</SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="phone-portrait-outline"
              title={t("settings.devicePermissions")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="download-outline"
              title={t("settings.archivingDownloading")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="accessibility-outline"
              title={t("settings.accessibility")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="language-outline"
              title={t("settings.languageTranslations")}
              value={languageLabel}
              onPress={handleLanguagePress}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="bar-chart-outline"
              title={t("settings.mediaQuality")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="color-palette-outline"
              title={t("settings.theme")}
              value={themeLabel}
              onPress={handleThemePress}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="images-outline"
              title={t("settings.chatWallpaper")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="folder-outline"
              title={t("settings.storageUsage")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="notifications-outline"
              title={t("settings.messageNotifications")}
              onPress={() => router.push("/notifications")}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>
              {t("settings.moreInfoSupport")}
            </SectionHeaderText>
          </SectionHeaderRow>
          <Group>
            <LinkRow
              icon="help-circle-outline"
              title={t("settings.help")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="shield-checkmark-outline"
              title={t("settings.privacyCenter")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="person-outline"
              title={t("settings.accountStatus")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator
            />
            <LinkRow
              icon="information-circle-outline"
              title={t("settings.about")}
              onPress={comingSoon}
              colors={rowColors}
              isDark={isDark}
              showSeparator={false}
            />
          </Group>

          <SectionGap style={{ backgroundColor: colors.tertiaryBackground }} />

          <SectionHeaderRow
            style={{ backgroundColor: colors.tertiaryBackground }}
          >
            <SectionHeaderText>{t("settings.loginSection")}</SectionHeaderText>
          </SectionHeaderRow>
          <View style={{ backgroundColor: colors.secondaryBackground }}>
            <Pressable
              onPress={() => router.push("/register")}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: pressed
                  ? isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)"
                  : colors.secondaryBackground,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: colors.iosBlue,
                }}
              >
                {t("settings.addAccount")}
              </Text>
            </Pressable>
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.separator,
                marginLeft: 16,
              }}
            />
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: pressed
                  ? isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)"
                  : colors.secondaryBackground,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: colors.iosRed,
                }}
              >
                {t("settings.logout")}
              </Text>
            </Pressable>
          </View>

          <View
            style={{ height: 40, backgroundColor: colors.tertiaryBackground }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
