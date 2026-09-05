import * as React from "react";
import { Text, type TextProps } from "react-native";
import { useTheme } from "@/shared/theme";

export function ThemedText({ style, ...rest }: TextProps) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.primaryText }, style]} {...rest} />;
}
