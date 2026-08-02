import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useRouter } from "expo-router";
import { useTranslation } from "@/shared/i18n";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "@/core/api-client";
import { useCreatePostMutation, useUploadMediaMutation } from "@/feed/feedApi";

const Page = styled.View`
  flex: 1;
  background-color: (p: {theme: {colors: {background: string}}}) =>
    p.theme.colors.background;
`;

const Header = styled.View`
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

const IconButton = styled.TouchableOpacity`
  padding: 6px;
`;

const Body = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const Hint = styled.Text`
  font-size: 14px;
  color: (p: {theme: {colors: {secondaryText: string}}}) =>
    p.theme.colors.secondaryText;
`;

const MediaWrap = styled.View`
  gap: 10px;
`;

const Cover = styled.View`
  width: 100%;
  height: 360px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #111;
  justify-content: center;
  align-items: center;
`;

const Dots = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
`;

const Dot = styled.View<{ active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${(p) => (p.active ? "#0095f6" : "#9a9a9a")};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ActionBtn = styled.TouchableOpacity`
  padding: 10px 12px;
  border-radius: 8px;
  background-color: #0095f6;
`;

const ActionText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const GhostBtn = styled.TouchableOpacity`
  padding: 10px 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #dbdbdb;
`;

const GhostText = styled.Text`
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
  font-size: 14px;
  font-weight: 500;
`;

const CaptionInput = styled(TextInput)`
  min-height: 120px;
  border-width: 1px;
  border-color: #dbdbdb;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

const Section = styled.View`
  margin-top: 18px;
  gap: 8px;
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

const TagWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagBtn = styled.TouchableOpacity`
  padding: 6px 10px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #dbdbdb;
`;

const TagText = styled.Text`
  font-size: 13px;
  color: (p: {theme: {colors: {primaryText: string}}}) =>
    p.theme.colors.primaryText;
`;

type Step = "select" | "caption" | "cover" | "sharing" | "success";
type Asset = {
  uri: string;
  mimeType: string;
  fileName: string;
  isVideo: boolean;
};

const MAX_CAPTION = 2200;

export default function CreatePostScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("select");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [coverAsset, setCoverAsset] = useState<Asset | null>(null);
  const [location, setLocation] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();

  const hasVideo = useMemo(() => assets.some((item) => item.isVideo), [assets]);
  const current = assets[activeIndex] ?? null;

  const selectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });
    if (result.canceled) return;
    const selected = result.assets
      .filter((item) => Boolean(item.uri))
      .map<Asset>((item) => ({
        uri: item.uri,
        mimeType:
          item.mimeType || (item.type === "video" ? "video/mp4" : "image/jpeg"),
        fileName:
          item.fileName ||
          `${item.type === "video" ? "video" : "image"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isVideo: item.type === "video",
      }));
    if (selected.length === 0) return;
    setAssets((prev) => [...prev, ...selected]);
    setStep("caption");
  };

  const selectVideoCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (result.canceled) return;
    const picked = result.assets[0];
    if (!picked?.uri) return;
    setCoverAsset({
      uri: picked.uri,
      mimeType: picked.mimeType || "image/jpeg",
      fileName: picked.fileName || `cover-${Date.now()}`,
      isVideo: false,
    });
  };

  const removeCurrent = () => {
    if (!current) return;
    const next = assets.filter((_, idx) => idx !== activeIndex);
    setAssets(next);
    setActiveIndex((idx) => Math.max(0, Math.min(idx, next.length - 1)));
    if (next.length === 0) setStep("select");
  };

  const loadSuggestedTags = async () => {
    const firstImage = assets.find((item) => !item.isVideo);
    if (!firstImage) return;
    setLoadingTags(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: firstImage.uri,
        name: firstImage.fileName,
        type: firstImage.mimeType,
      } as any);
      const response = await apiClient.post<{ labels?: string[] }>(
        "/vision/suggest-tags",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setSuggestedTags(
        Array.isArray(response.data?.labels)
          ? response.data.labels.slice(0, 10)
          : [],
      );
    } catch {
      setSuggestedTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const doShare = async () => {
    if (caption.length > MAX_CAPTION) return;
    if (assets.length === 0 && caption.trim().length === 0) {
      Alert.alert(t("createPost.errorTitle"), t("createPost.errorGeneric"));
      return;
    }
    setStep("sharing");
    try {
      const uploadedUrls: string[] = [];
      for (const item of assets) {
        const uploadResult = await uploadMedia({
          uri: item.uri,
          mimeType: item.mimeType,
          fileName: item.fileName,
          folder: "posts",
        }).unwrap();
        uploadedUrls.push(uploadResult.url);
      }
      let coverUrl: string | undefined;
      if (hasVideo && coverAsset) {
        const coverResult = await uploadMedia({
          uri: coverAsset.uri,
          mimeType: coverAsset.mimeType,
          fileName: coverAsset.fileName,
          folder: "covers",
        }).unwrap();
        coverUrl = coverResult.url;
      }
      const type = hasVideo
        ? "VIDEO"
        : uploadedUrls.length > 0
          ? "IMAGE"
          : "TEXT";
      await createPost({
        caption: caption.trim(),
        type,
        mediaUrls: uploadedUrls,
        coverUrl,
        location: location.trim() || undefined,
      }).unwrap();
      setStep("success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("createPost.errorGeneric");
      Alert.alert(t("createPost.errorTitle"), msg);
      setStep(hasVideo ? "cover" : "caption");
    }
  };

  const onSubmit = async () => {
    if (hasVideo) {
      setStep("cover");
      return;
    }
    await doShare();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <Header>
          <IconButton onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.primaryText}
            />
          </IconButton>
          <Title>{t("createPost.title")}</Title>
          <IconButton
            onPress={() => {
              if (step === "caption") void onSubmit();
              if (step === "cover") void doShare();
              if (step === "success") router.back();
            }}
          >
            <Ionicons
              name="checkmark"
              size={22}
              color={
                step === "sharing" ? colors.secondaryText : colors.primaryText
              }
            />
          </IconButton>
        </Header>
        <Body contentContainerStyle={{ paddingBottom: 30 }}>
          {step === "select" && (
            <Section>
              <Hint>{t("createPost.dragHint")}</Hint>
              <ActionBtn onPress={selectMedia}>
                <ActionText>{t("createPost.selectFromComputer")}</ActionText>
              </ActionBtn>
            </Section>
          )}
          {(step === "caption" ||
            step === "cover" ||
            step === "sharing" ||
            step === "success") && (
            <>
              {current && (
                <MediaWrap>
                  <Cover>
                    <Image
                      source={{ uri: current.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </Cover>
                  {assets.length > 1 && (
                    <Dots>
                      {assets.map((_, idx) => (
                        <Dot
                          key={assets[idx]?.uri || idx}
                          active={idx === activeIndex}
                        />
                      ))}
                    </Dots>
                  )}
                  <Row>
                    <GhostBtn
                      onPress={() =>
                        setActiveIndex((idx) => Math.max(0, idx - 1))
                      }
                    >
                      <GhostText>{t("createPost.back")}</GhostText>
                    </GhostBtn>
                    <GhostBtn
                      onPress={() =>
                        setActiveIndex((idx) =>
                          Math.min(assets.length - 1, idx + 1),
                        )
                      }
                    >
                      <GhostText>{t("createPost.next")}</GhostText>
                    </GhostBtn>
                    <GhostBtn onPress={removeCurrent}>
                      <GhostText>{t("createPost.deleteMedia")}</GhostText>
                    </GhostBtn>
                  </Row>
                </MediaWrap>
              )}

              {step === "caption" && (
                <>
                  <Section>
                    <SectionTitle>
                      {t("createPost.captionPlaceholder")}
                    </SectionTitle>
                    <CaptionInput
                      multiline
                      maxLength={MAX_CAPTION}
                      value={caption}
                      onChangeText={setCaption}
                      placeholder={t("createPost.captionPlaceholder")}
                      placeholderTextColor={colors.secondaryText}
                    />
                    <Hint>
                      {t("createPost.charCount", {
                        current: String(caption.length),
                      })}
                    </Hint>
                  </Section>
                  <Section>
                    <SectionTitle>{t("createPost.addLocation")}</SectionTitle>
                    <CaptionInput
                      multiline={false}
                      value={location}
                      onChangeText={setLocation}
                      placeholder={t("createPost.addLocation")}
                      placeholderTextColor={colors.secondaryText}
                    />
                  </Section>
                  <Section>
                    <Row>
                      <SectionTitle>
                        {t("createPost.recommendedTags")}
                      </SectionTitle>
                      <GhostBtn onPress={loadSuggestedTags}>
                        <GhostText>
                          {loadingTags
                            ? t("createPost.sharing")
                            : t("createPost.addTag")}
                        </GhostText>
                      </GhostBtn>
                    </Row>
                    {suggestedTags.length > 0 && (
                      <TagWrap>
                        {suggestedTags.map((tag) => {
                          const normalized = `#${tag.replace(/\s+/g, "_")}`;
                          return (
                            <TagBtn
                              key={normalized}
                              onPress={() =>
                                setCaption((prev) =>
                                  prev.trimEnd()
                                    ? `${prev.trimEnd()} ${normalized}`
                                    : normalized,
                                )
                              }
                            >
                              <TagText>{normalized}</TagText>
                            </TagBtn>
                          );
                        })}
                      </TagWrap>
                    )}
                  </Section>
                  <Section>
                    <ActionBtn onPress={() => void onSubmit()}>
                      <ActionText>{t("createPost.share")}</ActionText>
                    </ActionBtn>
                  </Section>
                </>
              )}

              {step === "cover" && (
                <>
                  <Section>
                    <SectionTitle>{t("createPost.coverPhoto")}</SectionTitle>
                    <Hint>{t("createPost.selectFrameHint")}</Hint>
                    {coverAsset?.uri ? (
                      <Cover>
                        <Image
                          source={{ uri: coverAsset.uri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      </Cover>
                    ) : null}
                    <Row>
                      <GhostBtn onPress={selectVideoCover}>
                        <GhostText>
                          {t("createPost.selectFromComputer")}
                        </GhostText>
                      </GhostBtn>
                      <ActionBtn onPress={() => void doShare()}>
                        <ActionText>{t("createPost.share")}</ActionText>
                      </ActionBtn>
                    </Row>
                  </Section>
                </>
              )}

              {step === "sharing" && (
                <Section>
                  <Hint>{t("createPost.sharing")}</Hint>
                  <Hint>
                    {isUploading || isCreating
                      ? t("common.loading")
                      : t("createPost.sharing")}
                  </Hint>
                </Section>
              )}

              {step === "success" && (
                <Section>
                  <SectionTitle>{t("createPost.postShared")}</SectionTitle>
                  <Hint>{t("createPost.postSharedMessage")}</Hint>
                  <Row>
                    <GhostBtn onPress={() => router.back()}>
                      <GhostText>{t("createPost.viewPost")}</GhostText>
                    </GhostBtn>
                    <GhostBtn
                      onPress={() => {
                        setStep("select");
                        setAssets([]);
                        setCaption("");
                        setLocation("");
                        setSuggestedTags([]);
                        setCoverAsset(null);
                      }}
                    >
                      <GhostText>{t("createPost.createAnother")}</GhostText>
                    </GhostBtn>
                    <ActionBtn onPress={() => router.back()}>
                      <ActionText>{t("createPost.done")}</ActionText>
                    </ActionBtn>
                  </Row>
                </Section>
              )}
            </>
          )}
        </Body>
      </Page>
    </SafeAreaView>
  );
}
