import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import { VideoView, useVideoPlayer } from "expo-video";
import { WebView } from "react-native-webview";

const Card = styled.View`
  background-color: #fff;
  margin-bottom: 18px;
`;

const Header = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px 12px;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AvatarWrap = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 8px;
  background-color: ${(p) =>
    (p as { theme: { colors: { tertiaryBackground: string } } }).theme.colors
      .tertiaryBackground};
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const HeaderText = styled.View`
  justify-content: center;
`;

const Username = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const MetaText = styled.Text`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FollowButton = styled.TouchableOpacity`
  padding-vertical: 5px;
  padding-horizontal: 12px;
  border-radius: 14px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.85);
  margin-right: 8px;
`;

const FollowText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`;

const Media = styled.View`
  width: 100%;
  aspect-ratio: 4 / 5;
  background-color: #000;
`;

const MediaPage = styled.View`
  width: 100%;
  height: 100%;
`;

const MediaImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const PlayIconWrap = styled.View`
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

const VideoWrapper = styled.View`
  width: 100%;
  height: 100%;
`;

const PostVideo: React.FC<{ uri: string; isActive: boolean }> = ({
  uri,
  isActive,
}) => {
  const [muted, setMuted] = useState(true);
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.muted = true;
    p.pause();
  });

  React.useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }
    player.play();
  }, [isActive, player]);

  React.useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <VideoWrapper>
      <TouchableOpacity
        activeOpacity={0.85}
        style={{ width: "100%", height: "100%" }}
        onPress={() => setMuted((m) => !m)}
      >
        <VideoView
          style={{ width: "100%", height: "100%" }}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
        <PlayIconWrap>
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={22}
            color="#FFFFFF"
          />
        </PlayIconWrap>
      </TouchableOpacity>
    </VideoWrapper>
  );
};

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 4px 10px;
`;

const ActionsLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding-vertical: 3px;
  padding-horizontal: 3px;
  margin-right: 8px;
`;

const ActionValue = styled.Text`
  margin-left: 3px;
  font-size: 13px;
  font-weight: 500;
  color: ${(p) =>
    (p as { theme: { colors: { primaryText: string } } }).theme.colors
      .primaryText};
`;

const Footer = styled.View`
  padding: 0 12px 12px 12px;
`;

const StatText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) =>
    (p as { theme: { colors: { primaryText: string } } }).theme.colors
      .primaryText};
  margin-bottom: 2px;
`;

const CaptionText = styled.Text`
  font-size: 13px;
  color: ${(p) =>
    (p as { theme: { colors: { primaryText: string } } }).theme.colors
      .primaryText};
  margin-bottom: 2px;
`;

const TimeText = styled.Text`
  font-size: 11px;
  color: ${(p) =>
    (p as { theme: { colors: { secondaryText: string } } }).theme.colors
      .secondaryText};
`;

interface FeedPostCardProps {
  post: MobileFeedPost;
  onPressLike?: (id: string) => void;
  onPressComment?: (id: string) => void;
  onPressShare?: (id: string) => void;
  onPressSave?: (id: string) => void;
  onPressFollow?: (userId: string) => void;
  onPressUser?: (userId: string) => void;
  currentUserId?: string;
  isFollowing?: boolean;
  onPressMedia?: (postId: string, index: number) => void;
  isActive?: boolean;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onPressLike,
  onPressComment,
  onPressShare,
  onPressSave,
  onPressFollow,
  onPressUser,
  currentUserId,
  isFollowing,
  onPressMedia,
  isActive = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isSelf = currentUserId != null && post.userId === currentUserId;
  const following = Boolean(isFollowing);
  const screenWidth = Dimensions.get("window").width;
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const lastTap = useRef<number>(0);
  const handleMediaTap = (mediaIndex: number) => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      onPressLike?.(post.id);
    } else {
      onPressMedia?.(post.id, mediaIndex);
    }
    lastTap.current = now;
  };
  const likeIcon = post.isLiked ? "heart" : "heart-outline";
  const likeColor = post.isLiked ? colors.iosRed : colors.primaryText;
  const saveIcon = post.isSaved ? "bookmark" : "bookmark-outline";
  const isVideo = post.type === "VIDEO" && !!post.videoUrl;
  const isHttpVideo = isVideo && /^https?:\/\//i.test(post.videoUrl as string);
  const isDataVideo = isVideo && post.videoUrl?.startsWith("data:video/");
  const mediaUrls =
    Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
      ? post.mediaUrls
      : [];
  const hasCarousel = mediaUrls.length > 1;
  const safeLikeCount =
    typeof post.likeCount === "number" && !Number.isNaN(post.likeCount)
      ? post.likeCount
      : 0;
  const likeText = useMemo(
    () => `${safeLikeCount} ${t("feed.likeLabel")}`,
    [safeLikeCount, t],
  );

  const isMediaVideoUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith("data:video/")) return true;
    if (url.startsWith("data:")) return false;
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  };

  const formatCount = (value?: number) => {
    const n =
      typeof value === "number" && Number.isFinite(value)
        ? Math.max(0, value)
        : 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const getRelativeTime = (value: string) => {
    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return value;
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

  const shareCount =
    (post as MobileFeedPost & { shareCount?: number }).shareCount ?? 0;
  const repostCount =
    (post as MobileFeedPost & { repostCount?: number }).repostCount ?? 0;

  const handleHorizontalMomentumEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    if (!layoutMeasurement?.width) return;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    if (index !== activeMediaIndex) {
      setActiveMediaIndex(index);
    }
  };

  const onPressMore = () => {
    const canUnfollow = !isSelf && following;
    const unfollowLabel = t("feed.unfollow");
    const options = canUnfollow
      ? [
          unfollowLabel,
          t("feed.copyLink"),
          t("feed.report"),
          t("common.cancel"),
        ]
      : [t("feed.copyLink"), t("feed.report"), t("common.cancel")];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = canUnfollow ? 0 : 1;
    const handleIndex = (buttonIndex: number) => {
      if (buttonIndex < 0 || buttonIndex === cancelButtonIndex) return;
      if (canUnfollow && buttonIndex === 0) {
        onPressFollow?.(post.userId);
      }
    };
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        handleIndex,
      );
      return;
    }
    Alert.alert(post.username, undefined, [
      ...(canUnfollow
        ? [
            {
              text: unfollowLabel,
              style: "destructive" as const,
              onPress: () => onPressFollow?.(post.userId),
            },
          ]
        : []),
      { text: t("feed.copyLink") },
      { text: t("feed.report") },
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  return (
    <Card>
      <Media>
        <Header>
          <HeaderLeft>
            <AvatarWrap
              activeOpacity={0.85}
              onPress={() => onPressUser?.(post.userId)}
            >
              <AvatarImage
                source={{ uri: post.avatar || undefined }}
                resizeMode="cover"
              />
            </AvatarWrap>
            <HeaderText>
              <Username numberOfLines={1}>{post.username}</Username>
            </HeaderText>
          </HeaderLeft>
          <HeaderRight>
            {isSelf || following ? null : (
              <FollowButton onPress={() => onPressFollow?.(post.userId)}>
                <FollowText>{t("feed.follow")}</FollowText>
              </FollowButton>
            )}
            <IconButton onPress={onPressMore}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            </IconButton>
          </HeaderRight>
        </Header>
        {hasCarousel ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: "100%", height: "100%" }}
            onMomentumScrollEnd={handleHorizontalMomentumEnd}
          >
            {mediaUrls.map((url, index) => {
              const isMediaVideo = isMediaVideoUrl(url);
              const isDataMediaVideo = url?.startsWith("data:video/");
              return (
                <MediaPage
                  key={`${url}-${index}`}
                  style={{ width: screenWidth }}
                >
                  <TouchableOpacity
                    activeOpacity={0.96}
                    onPress={() => handleMediaTap(index)}
                    style={{ width: "100%", height: "100%" }}
                  >
                    {isMediaVideo ? (
                      isDataMediaVideo ? (
                        <WebView
                          source={{
                            html: `
                              <html>
                                <head>
                                  <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
                                  <style>
                                    body,html{margin:0;padding:0;background:black;}
                                    video{width:100%;height:100%;object-fit:cover;}
                                  </style>
                                </head>
                                <body>
                                  <video src="${url}" autoplay muted playsinline loop></video>
                                </body>
                              </html>
                            `,
                          }}
                          style={{ width: "100%", height: "100%" }}
                          javaScriptEnabled
                          scrollEnabled={false}
                          allowsInlineMediaPlayback
                          mediaPlaybackRequiresUserAction={false}
                        />
                      ) : (
                        <PostVideo
                          uri={url}
                          isActive={isActive && index === activeMediaIndex}
                        />
                      )
                    ) : (
                      <MediaImage source={{ uri: url }} resizeMode="cover" />
                    )}
                  </TouchableOpacity>
                </MediaPage>
              );
            })}
          </ScrollView>
        ) : isVideo && isHttpVideo && post.videoUrl ? (
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={() => handleMediaTap(0)}
            style={{ width: "100%", height: "100%" }}
          >
            <PostVideo uri={post.videoUrl} isActive={isActive} />
          </TouchableOpacity>
        ) : isVideo && isDataVideo && post.videoUrl ? (
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={() => handleMediaTap(0)}
            style={{ width: "100%", height: "100%" }}
          >
            <WebView
              source={{
                html: `
                  <html>
                    <head>
                      <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
                      <style>
                        body,html{margin:0;padding:0;background:black;}
                        video{width:100%;height:100%;object-fit:cover;}
                      </style>
                    </head>
                    <body>
                      <video id="v" src="${post.videoUrl}" autoplay muted playsinline loop></video>
                      <script>
                        (function() {
                          var currentActive = false;
                          function setActive(active) {
                            currentActive = !!active;
                            var v = document.getElementById('v');
                            if (!v) return;
                            if (currentActive) {
                              v.play();
                            } else {
                              v.pause();
                            }
                          }
                          window.setActive = setActive;
                        })();
                      </script>
                    </body>
                  </html>
                `,
              }}
              style={{ width: "100%", height: "100%" }}
              javaScriptEnabled
              scrollEnabled={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={() => handleMediaTap(0)}
            style={{ width: "100%", height: "100%" }}
          >
            <MediaImage
              source={{ uri: post.imageUrl || undefined }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      </Media>
      <Actions>
        <ActionsLeft>
          <IconButton onPress={() => onPressLike?.(post.id)}>
            <Ionicons name={likeIcon} size={27} color={likeColor} />
            <ActionValue>{formatCount(post.likeCount)}</ActionValue>
          </IconButton>
          <IconButton onPress={() => onPressComment?.(post.id)}>
            <Feather
              name="message-circle"
              size={25}
              color={colors.primaryText}
            />
            <ActionValue>{formatCount(post.commentCount)}</ActionValue>
          </IconButton>
          <IconButton>
            <Ionicons
              name="repeat-outline"
              size={24}
              color={colors.primaryText}
            />
            <ActionValue>{formatCount(repostCount)}</ActionValue>
          </IconButton>
          <IconButton onPress={() => onPressShare?.(post.id)}>
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={colors.primaryText}
            />
            <ActionValue>{formatCount(shareCount)}</ActionValue>
          </IconButton>
        </ActionsLeft>
        <IconButton onPress={() => onPressSave?.(post.id)}>
          <Ionicons name={saveIcon} size={26} color={colors.primaryText} />
        </IconButton>
      </Actions>
      <Footer>
        <StatText numberOfLines={1}>{likeText}</StatText>
        {post.caption ? (
          <CaptionText numberOfLines={2}>{post.caption}</CaptionText>
        ) : null}
        <TimeText numberOfLines={1}>{getRelativeTime(post.timestamp)}</TimeText>
      </Footer>
    </Card>
  );
};
