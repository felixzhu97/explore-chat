import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";
import { useAuthStore, useAppDispatch, setAuth } from "@/core/store/hooks";
import { getAuthApi } from "@/core/composition-root";

const DEFAULT_DEV_USER = {
  email: "alice@example.com",
  password: "123456",
};

const Page = styled.View`
  flex: 1;
  background-color: (p: {theme: {colors: {secondaryBackground: string}}}) =>
    p.theme.colors.secondaryBackground;
`;

const Keyboard = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
  padding-horizontal: 24px;
  padding-top: 56px;
  padding-bottom: 32px;
  justify-content: space-between;
`;

const LogoContainer = styled.View`
  align-items: center;
  margin-bottom: 28px;
`;

const LogoCircle = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: transparent;
  justify-content: center;
  align-items: center;
`;

const LogoInner = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  border-width: 3px;
  border-color: #e1306c;
  justify-content: center;
  align-items: center;
`;

const LogoDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #e1306c;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const LogoRing = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #e1306c;
`;

const FormCard = styled.View`
  border-radius: 16px;
  padding: 0;
  background-color: transparent;
`;

const Input = styled.TextInput`
  height: 52px;
  border-radius: 14px;
  border-width: 1px;
  padding-horizontal: 18px;
  padding-vertical: 8px;
  font-size: 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  color: ${(p) => p.theme.colors.primaryText};
  border-color: #dbdbdb;
  margin-bottom: 10px;
`;

const PrimaryButton = styled.TouchableOpacity`
  height: 44px;
  border-radius: 22px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  background-color: ${(p) => p.theme.colors.buttonPrimary};
`;

const PrimaryButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.buttonPrimaryText};
`;

const InlineLink = styled.TouchableOpacity`
  margin-top: 14px;
  align-items: center;
`;

const InlineLinkText = styled.Text`
  font-size: 13px;
  color: #262626;
`;

const BottomContainer = styled.View`
  align-items: center;
`;

const BottomButton = styled.TouchableOpacity`
  height: 44px;
  border-radius: 22px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.buttonOutline};
  justify-content: center;
  align-items: center;
  align-self: stretch;
  margin-bottom: 16px;
`;

const BottomButtonText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.buttonOutlineText};
`;

const MetaText = styled.Text`
  font-size: 12px;
  color: #8e8e93;
  margin-top: 4px;
`;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(DEFAULT_DEV_USER.email);
  const [password, setPassword] = useState(DEFAULT_DEV_USER.password);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert(t("login.alertTitle"), t("login.fillEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      const data = await getAuthApi().login(trimmedEmail, password);
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
            : t("login.fail");
      Alert.alert(t("login.fail"), String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Page>
        <Keyboard behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Content>
            <View>
              <LogoContainer>
                <LogoCircle>
                  <LogoInner>
                    <LogoRing />
                    <LogoDot />
                  </LogoInner>
                </LogoCircle>
              </LogoContainer>
              <FormCard>
                <Input
                  placeholder={t("login.subtitle")}
                  placeholderTextColor={colors.tertiaryText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Input
                  placeholder={t("login.passwordPlaceholder")}
                  placeholderTextColor={colors.tertiaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                <PrimaryButton onPress={handleLogin} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <PrimaryButtonText>{t("login.submit")}</PrimaryButtonText>
                  )}
                </PrimaryButton>
                <InlineLink disabled={loading}>
                  <InlineLinkText>{t("login.forgotPassword")}</InlineLinkText>
                </InlineLink>
              </FormCard>
            </View>
            <BottomContainer>
              <BottomButton disabled={loading}>
                <BottomButtonText>{t("login.createAccount")}</BottomButtonText>
              </BottomButton>
              <MetaText>Meta</MetaText>
            </BottomContainer>
          </Content>
        </Keyboard>
      </Page>
    </SafeAreaView>
  );
}
