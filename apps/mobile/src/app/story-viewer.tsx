import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetStatusesQuery,
  useTrackEventsMutation,
  useViewStatusMutation,
} from "@/feed/feedApi";
import { VideoView, useVideoPlayer } from "expo-video";
import { WebView } from "react-native-webview";

const Page = styled.View`
  flex: 1;
  background-color: #000;
`;

const TopBar = styled.View`
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProgressRow = styled.View`
  flex-direction: row;
  padding: 8px 10px 0 10px;
`;

const ProgressTrack = styled.View`
  flex: 1;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 2px;
`;

const ProgressFill = styled.View<{ active: boolean }>`
  width: ${(p) => (p.active ? "100%" : "0%")};
  height: 2px;
  background-color: rgba(255, 255, 255, 0.9);
`;

const Left = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  margin-left: 8px;
  margin-right: 8px;
`;

const Username = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const IconButton = styled.TouchableOpacity`
  padding: 6px;
`;

const Media = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const StoryImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const TextWrap = styled.View`
  padding: 24px;
`;

const StoryText = styled.Text`
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  text-align: left;
`;

function isVideo(url?: string) {
  if (!url) return false;
  return (
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.startsWith("data:video/")
  );
}

const StoryVideo: React.FC<{ uri: string; width: number; height: number }> = ({
  uri,
  width,
  height,
}) => {
  if (uri.startsWith("data:video/")) {
    const webRef = useRef<WebView>(null);
    const [muted, setMuted] = useState(false);
    const setWebMuted = (m: boolean) => {
      const js = `(() => { const v = document.querySelector('video'); if (!v) return true; v.muted = ${m ? "true" : "false"}; if (!${m ? "true" : "false"}) { v.volume = 1; } return true; })();`;
      webRef.current?.injectJavaScript(js);
    };
    return (
      <>
        <WebView
          ref={webRef}
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
                  <video id="v" src="${uri}" autoplay playsinline webkit-playsinline></video>
                </body>
              </html>
            `,
          }}
          style={{ width, height, backgroundColor: "black" }}
          javaScriptEnabled
          scrollEnabled={false}
          allowsInlineMediaPlayback
          allowsFullscreenVideo={false}
          mediaPlaybackRequiresUserAction={false}
          onLoadEnd={() => setWebMuted(muted)}
        />
        <Pressable
          onPress={() => {
            const next = !muted;
            setMuted(next);
            setWebMuted(next);
          }}
          hitSlop={10}
          style={{ position: "absolute", top: 12, right: 12, padding: 8 }}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={22}
            color="#fff"
          />
        </Pressable>
      </>
    );
  }
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
    p.muted = false;
    p.pause();
  });

  useEffect(() => {
    player.play();
    return () => {
      player.pause();
    };
  }, [player]);

  return (
    <VideoView
      style={{ width, height }}
      player={player}
      allowsPictureInPicture={false}
      nativeControls={false}
      contentFit="cover"
    />
  );
};

export default function StoryViewerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { data: statuses } = useGetStatusesQuery();
  const [viewStatus] = useViewStatusMutation();
  const [trackEvents] = useTrackEventsMutation();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const list = useMemo(() => {
    const raw = Array.isArray(statuses) ? statuses : [];
    if (!userId) return raw;
    return raw.filter((s) => (s.userId ?? s.user?.id) === userId);
  }, [statuses, userId]);

  const item = list[index];
  const screen = Dimensions.get("window");
  const videoUri =
    item?.mediaUrl && isVideo(item.mediaUrl) ? item.mediaUrl : undefined;

  useEffect(() => {
    if (!item?.id) return;
    viewStatus({ statusId: item.id });
    const key = `status_view:${item.id}:${Math.floor(Date.now() / 60000)}`;
    trackEvents({
      events: [
        {
          eventName: "status_view",
          idempotencyKey: key,
          properties: { statusId: item.id },
        },
      ],
    });
  }, [item?.id, trackEvents, viewStatus]);

  useEffect(() => {
    if (!item) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const durationMs = Math.max(
      2500,
      Math.min(8000, (item.duration ?? 5) * 1000),
    );
    timerRef.current = setTimeout(() => {
      if (index + 1 < list.length) setIndex((v) => v + 1);
      else router.back();
    }, durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, item, list.length, router]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Page>
          <TopBar>
            <IconButton onPress={() => router.back()}>
              <Ionicons name="close" size={22} color={colors.primaryText} />
            </IconButton>
          </TopBar>
        </Page>
      </SafeAreaView>
    );
  }

  const onPrev = () => {
    if (index > 0) setIndex((v) => v - 1);
    else router.back();
  };

  const onNext = () => {
    if (index + 1 < list.length) setIndex((v) => v + 1);
    else router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <ProgressRow>
          {list.map((_, i) => (
            <ProgressTrack key={i}>
              <ProgressFill active={i <= index} />
            </ProgressTrack>
          ))}
        </ProgressRow>
        <TopBar>
          <Left>
            <IconButton onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </IconButton>
            <Avatar source={{ uri: item.user?.avatar || undefined }} />
            <Username numberOfLines={1}>{item.user?.username ?? ""}</Username>
          </Left>
          <IconButton onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </IconButton>
        </TopBar>
        <Pressable
          onPress={(e) => {
            const x = e.nativeEvent.locationX;
            if (x < screen.width / 2) onPrev();
            else onNext();
          }}
          style={{ flex: 1 }}
        >
          <Media>
            {item.type === "TEXT" ? (
              <TextWrap>
                <StoryText>{item.content ?? ""}</StoryText>
              </TextWrap>
            ) : videoUri ? (
              <StoryVideo
                uri={videoUri}
                width={screen.width}
                height={screen.height}
              />
            ) : (
              <StoryImage
                source={{ uri: item.mediaUrl || undefined }}
                resizeMode="cover"
              />
            )}
          </Media>
        </Pressable>
      </Page>
    </SafeAreaView>
  );
}
