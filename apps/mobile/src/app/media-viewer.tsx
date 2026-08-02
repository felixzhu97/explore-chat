import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import { getFeedApi } from "@/core/composition-root";
import { useGetFeedFirstQuery } from "@/feed/feedApi";
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

const IconButton = styled.TouchableOpacity`
  padding: 6px;
`;

const DotRow = styled.View`
  position: absolute;
  bottom: 18px;
  width: 100%;
  flex-direction: row;
  justify-content: center;
`;

const Dot = styled.View<{ active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin: 0 3px;
  opacity: ${(p) => (p.active ? 1 : 0.4)};
  background-color: #fff;
`;

const MediaPage = styled.View`
  justify-content: center;
  align-items: center;
`;

const MediaImage = styled.Image`
  width: 100%;
  height: 100%;
`;

function isVideoUrl(url: string) {
  return (
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.startsWith("data:video/")
  );
}

const MediaVideo: React.FC<{
  uri: string;
  width: number;
  height: number;
  isActive: boolean;
}> = ({ uri, width, height, isActive }) => {
  const isDataVideo = uri.startsWith("data:video/");
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  if (isDataVideo) {
    const webRef = useRef<WebView>(null);
    const setWebState = (active: boolean, p: boolean, m: boolean) => {
      const js = `(() => { const v = document.querySelector('video'); if (!v) return true;
        v.muted = ${m ? "true" : "false"}; if (!${m ? "true" : "false"}) { v.volume = 1; }
        if (${active && !p ? "true" : "false"}) { v.play && v.play(); } else { v.pause && v.pause(); }
        return true; })();`;
      webRef.current?.injectJavaScript(js);
    };

    useEffect(() => {
      setWebState(isActive, paused, muted);
    }, [isActive, paused, muted]);

    return (
      <View style={{ width, height, backgroundColor: "black" }}>
        <WebView
          ref={webRef}
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
                  <style>
                    body,html{margin:0;padding:0;background:black;}
                    video{width:100%;height:100%;object-fit:contain;}
                  </style>
                </head>
                <body>
                  <video id="v" src="${uri}" autoplay playsinline webkit-playsinline loop></video>
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
          onLoadEnd={() => setWebState(isActive, paused, muted)}
        />
        <Pressable
          onPress={() => setPaused((v) => !v)}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View style={{ position: "absolute", top: 12, right: 12, zIndex: 20 }}>
          <Pressable
            onPress={() => setMuted((v) => !v)}
            hitSlop={10}
            style={{ padding: 8 }}
          >
            <Ionicons
              name={muted ? "volume-mute" : "volume-high"}
              size={22}
              color="#fff"
            />
          </Pressable>
        </View>
        {paused ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.35)",
                padding: 14,
                borderRadius: 40,
              }}
            >
              <Ionicons name="play" size={28} color="#fff" />
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.muted = false;
    p.pause();
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }
    if (paused) player.pause();
    else player.play();
  }, [isActive, paused, player]);

  return (
    <View style={{ width, height, backgroundColor: "black" }}>
      <VideoView
        style={{ width, height }}
        player={player}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="contain"
        pointerEvents="none"
      />
      <Pressable
        onPress={() => setPaused((v) => !v)}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View style={{ position: "absolute", top: 12, right: 12, zIndex: 20 }}>
        <Pressable
          onPress={() => setMuted((v) => !v)}
          hitSlop={10}
          style={{ padding: 8 }}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={22}
            color="#fff"
          />
        </Pressable>
      </View>
      {paused ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
              padding: 14,
              borderRadius: 40,
            }}
          >
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default function MediaViewerScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{
    postId?: string;
    index?: string;
  }>();
  const startIndex = 0;
  const { data } = useGetFeedFirstQuery({ limit: 8 });
  const postFromFeed = useMemo(
    () => data?.posts?.find((p) => p.id === postId),
    [data?.posts, postId],
  );
  const [fetchedPost, setFetchedPost] = useState<MobileFeedPost | null>(null);

  useEffect(() => {
    if (postFromFeed) {
      setFetchedPost(null);
      return;
    }
    if (!postId) return;
    let cancelled = false;
    void getFeedApi()
      .getPostById(postId)
      .then((p) => {
        if (!cancelled && p) setFetchedPost(p);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, postFromFeed]);

  const post = postFromFeed ?? fetchedPost;
  const mediaUrls =
    Array.isArray(post?.mediaUrls) && post?.mediaUrls?.length
      ? post?.mediaUrls
      : post?.imageUrl
        ? [post.imageUrl]
        : [];
  const screen = Dimensions.get("window");
  const [active, setActive] = useState(
    Math.min(startIndex, Math.max(0, mediaUrls.length - 1)),
  );
  const scrollRef = useRef<ScrollView | null>(null);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement?.width || screen.width;
    const x = e.nativeEvent.contentOffset?.x ?? 0;
    const i = Math.round(x / w);
    if (i !== active) setActive(i);
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const x = active * screen.width;
    scrollRef.current.scrollTo({ x, y: 0, animated: false });
  }, [screen.width, active]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <TopBar>
          <IconButton onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </IconButton>
          <IconButton>
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </IconButton>
        </TopBar>
        <ScrollView
          ref={(r) => {
            scrollRef.current = r;
          }}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          contentOffset={{ x: active * screen.width, y: 0 }}
        >
          {mediaUrls.map((url, i) => (
            <MediaPage
              key={`${url}-${i}`}
              style={{ width: screen.width, height: screen.height }}
            >
              {isVideoUrl(url) ? (
                <MediaVideo
                  uri={url}
                  width={screen.width}
                  height={screen.height}
                  isActive={i === active}
                />
              ) : (
                <MediaImage source={{ uri: url }} resizeMode="contain" />
              )}
            </MediaPage>
          ))}
        </ScrollView>
        {mediaUrls.length > 1 ? (
          <DotRow>
            {mediaUrls.map((_, i) => (
              <Dot key={i} active={i === active} />
            ))}
          </DotRow>
        ) : null}
      </Page>
    </SafeAreaView>
  );
}
