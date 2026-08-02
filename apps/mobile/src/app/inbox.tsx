import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useRouter } from "expo-router";
import { useTranslation } from "@/shared/i18n";

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

const Body = styled.View`
  flex: 1;
  padding: 16px;
`;

const Hint = styled.Text`
  font-size: 14px;
  color: (p: {theme: {colors: {secondaryText: string}}}) =>
    p.theme.colors.secondaryText;
`;

export default function InboxScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

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
          <Title>{t("inbox.title")}</Title>
          <IconButton />
        </Header>
        <Body>
          <Hint>{t("inbox.comingSoon")}</Hint>
        </Body>
      </Page>
    </SafeAreaView>
  );
}
