import React from "react";
import { BlurView } from "expo-blur";
import { useTheme } from "@/shared/theme";
import { styled } from "@/shared/emotion";

const VIBRANCY_LIGHT = "rgba(255, 255, 255, 0.4)";
const VIBRANCY_DARK = "rgba(0, 0, 0, 0.12)";

const Outer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 8;
`;

const Overlay = styled.View<{ bg: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(p) => p.bg};
`;

export function LiquidGlassBar() {
  const { isDark } = useTheme();
  const vibrancy = isDark ? VIBRANCY_DARK : VIBRANCY_LIGHT;

  return (
    <Outer style={{ shadowOffset: { width: 0, height: -2 } }}>
      <BlurView
        intensity={78}
        tint={isDark ? "dark" : "light"}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Overlay bg={vibrancy} />
    </Outer>
  );
}
