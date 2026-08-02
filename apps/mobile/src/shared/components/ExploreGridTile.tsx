import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";
import { styled } from "@/shared/emotion";

const Badge = styled.View`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  width: 22px;
  height: 22px;
  justify-content: center;
  align-items: center;
`;

interface ExploreGridTileProps {
  post: MobileFeedPost;
  tileSize: number;
  marginRight: number;
  marginBottom: number;
  onPress: () => void;
}

export function ExploreGridTile({
  post,
  tileSize,
  marginRight,
  marginBottom,
  onPress,
}: ExploreGridTileProps) {
  const thumb =
    post.coverImageUrl ||
    post.imageUrl ||
    (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
      ? post.mediaUrls[0]
      : "") ||
    "";
  const isVideo = Boolean(post.videoUrl) || post.type === "VIDEO";
  const multi = (post.mediaUrls?.length ?? 0) > 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        width: tileSize,
        height: tileSize,
        marginRight,
        marginBottom,
      }}
    >
      {thumb ? (
        <Image
          source={{ uri: thumb }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ width: "100%", height: "100%", backgroundColor: "#E8E8E8" }}
        />
      )}
      {isVideo ? (
        <Badge pointerEvents="none">
          <Ionicons name="play" size={13} color="#FFFFFF" />
        </Badge>
      ) : multi ? (
        <Badge pointerEvents="none">
          <Ionicons name="copy-outline" size={13} color="#FFFFFF" />
        </Badge>
      ) : null}
    </TouchableOpacity>
  );
}
