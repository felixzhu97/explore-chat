import React from "react";
import { View, Image, Text } from "react-native";
import { useTheme } from "@/shared/theme";

interface ChatAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  showBorder?: boolean;
}

const AVATAR_COLORS = [
  "#7EC8C4",
  "#E5A88B",
  "#6BA3C4",
  "#98D8C8",
  "#D4A5A5",
  "#7BAFCC",
  "#C9B896",
  "#6EB5C2",
];

function getAvatarColor(name: string): string {
  if (!name || name.length === 0) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  name,
  imageUrl,
  size = 50,
  showBorder = false,
}) => {
  const { colors } = useTheme();
  const initial = name?.[0]?.toUpperCase() || "?";
  const radius = size / 2;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: "hidden" as const,
    borderWidth: showBorder ? 2 : 0,
    borderColor: colors.primaryGreen,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: radius,
  };

  const placeholderStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: getAvatarColor(name),
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  const initialStyle = {
    color: "#ffffff",
    fontWeight: "600" as const,
    fontSize: Math.round(size * 0.4),
  };

  return (
    <View style={containerStyle}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={imageStyle}
          resizeMode="cover"
        />
      ) : (
        <View style={placeholderStyle}>
          <Text style={initialStyle}>{initial}</Text>
        </View>
      )}
    </View>
  );
};
