import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import { useAppDispatch, setAuth } from "@/core/store/hooks";
import { getAuthApi } from "@/core/composition-root";

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.primaryGreenDark};
`;

const Keyboard = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const Header = styled.View`
  padding: 48px 24px 24px;
  background-color: ${(p) => p.theme.colors.primaryGreenDark};
`;

const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
`;

const HeaderSubtitle = styled.Text`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8px;
`;

const FormScroll = styled(ScrollView)`
  flex: 1;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const FormContent = styled.View`
  padding: 32px 24px 48px;
`;

const Label = styled.Text`
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Input = styled.TextInput`
  height: 48px;
  border-radius: 10px;
  border-width: 1px;
  padding: 0 16px;
  font-size: 17px;
  margin-bottom: 20px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  color: ${(p) => p.theme.colors.primaryText};
  border-color: ${(p) => p.theme.colors.separator};
`;

const PrimaryButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 25px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const PrimaryButtonText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
`;

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const FooterText = styled.Text`
  font-size: 15px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const LinkText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryGreen};
`;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUsername || !trimmedEmail || !password) {
      Alert.alert(t("register.alertTitle"), t("register.fillAll"));
      return;
    }
    if (trimmedUsername.length < 2) {
      Alert.alert(t("register.alertTitle"), t("register.usernameMin"));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t("register.alertTitle"), t("register.passwordMin"));
      return;
    }
    setLoading(true);
    try {
      const data = await getAuthApi().register({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });
      await dispatch(
        setAuth({
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      ).unwrap();
      router.replace("/(tabs)/status");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
            ? err.message
            : t("register.fail");
      Alert.alert(t("register.fail"), String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <Keyboard behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Header>
            <HeaderTitle>WhatsChat</HeaderTitle>
            <HeaderSubtitle>{t("register.subtitle")}</HeaderSubtitle>
          </Header>
          <FormScroll
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <FormContent>
              <Label>{t("register.username")}</Label>
              <Input
                placeholder={t("register.usernamePlaceholder")}
                placeholderTextColor={colors.tertiaryText}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
              <Label>{t("register.email")}</Label>
              <Input
                placeholder={t("register.emailPlaceholder")}
                placeholderTextColor={colors.tertiaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Label>{t("register.password")}</Label>
              <Input
                placeholder={t("register.passwordPlaceholder")}
                placeholderTextColor={colors.tertiaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
              <PrimaryButton onPress={handleRegister} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <PrimaryButtonText>{t("register.submit")}</PrimaryButtonText>
                )}
              </PrimaryButton>
              <Footer>
                <FooterText>{t("register.hasAccount")}</FooterText>
                <Link href="/login" asChild>
                  <TouchableOpacity disabled={loading}>
                    <LinkText>{t("register.login")}</LinkText>
                  </TouchableOpacity>
                </Link>
              </Footer>
            </FormContent>
          </FormScroll>
        </Keyboard>
      </Page>
    </SafeAreaView>
  );
}
