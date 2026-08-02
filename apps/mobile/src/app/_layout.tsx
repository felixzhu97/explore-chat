import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/shared/theme";
import { StatusBar } from "expo-status-bar";
import { CallOverlay } from "@/shared/components";
import { StoreProvider } from "@/core/store/StoreProvider";
import { AnalyticsProvider } from "@/layout/providers/AnalyticsProvider";
import { useAppDispatch, hydrateAuth } from "@/core/store/hooks";
import { styled } from "@/shared/emotion";
import { applyStoredLanguage } from "@/shared/i18n";
import "@/shared/i18n/i18n";

function AuthHydration({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return <>{children}</>;
}

const OverlayWrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

function ThemeAwareLayout() {
  const { colors, isDark } = useTheme();
  React.useEffect(() => {
    applyStoredLanguage();
  }, []);
  return (
    <>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={colors.secondaryBackground}
      />
      <View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="settings-menu" />
          <Stack.Screen
            name="post-comments"
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="chat-detail"
            options={{
              headerShown: true,
              presentation: "card",
            }}
          />
        </Stack>
        <OverlayWrap pointerEvents="box-none">
          <CallOverlay />
        </OverlayWrap>
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <AuthHydration>
        <AnalyticsProvider>
          <ThemeProvider>
            <ThemeAwareLayout />
          </ThemeProvider>
        </AnalyticsProvider>
      </AuthHydration>
    </StoreProvider>
  );
}
