"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Settings } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/auth/use-auth";
import { useTranslation } from "@/src/shared/i18n";
import { styled } from "@/src/shared/utils/emotion";

const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0 6rem;
  gap: 4rem;
  max-width: 935px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 876px) {
    flex-direction: column;
    padding-top: 2rem;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: 876px) {
    display: none;
  }
`;

const InstagramLogo = styled.div`
  width: 220px;
  height: 80px;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    45deg,
    #f09433,
    #e6683c,
    #dc2743,
    #cc2366,
    #bc1888
  );
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 174 60'%3E%3Cpath fill='black' d='M115 30c0-8.3 6.7-15 15-15s15 6.7 15 15-6.7 15-15 15-15-6.7-15-15zm-58 0c0-8.3 6.7-15 15-15s15 6.7 15 15-6.7 15-15 15-15-6.7-15-15zm29 0c0-16.6 13.4-30 30-30s30 13.4 30 30-13.4 30-30 30-30-13.4-30-30z'/%3E%3C/svg%3E")
    center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 174 60'%3E%3Cpath fill='black' d='M115 30c0-8.3 6.7-15 15-15s15 6.7 15 15-6.7 15-15 15-15-6.7-15-15zm-58 0c0-8.3 6.7-15 15-15s15 6.7 15 15-6.7 15-15 15-15-6.7-15-15zm29 0c0-16.6 13.4-30 30-30s30 13.4 30 30-13.4 30-30 30-30-13.4-30-30z'/%3E%3C/svg%3E")
    center/contain no-repeat;
`;

const Tagline = styled.p`
  font-size: 1.25rem;
  line-height: 1.4;
  color: #262626;
  margin: 0 0 1.5rem;
  font-weight: 400;
`;

const TaglineHighlight = styled.span`
  color: #c13584;
  font-weight: 600;
`;

const PhoneGraphic = styled.div`
  width: 100%;
  max-width: 380px;
  aspect-ratio: 381 / 581;
  background: linear-gradient(180deg, #fae0e8 0%, #e8d5f0 50%, #d5e8f0 100%);
  border-radius: 40px;
  position: relative;
  box-shadow:
    0 0 0 8px #262626,
    0 0 0 10px #eee;
  &::before {
    content: "";
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 24px;
    background: #262626;
    border-radius: 12px;
  }
`;

const RightColumn = styled.div`
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 876px) {
    flex: 1;
    width: 100%;
    max-width: 350px;
    padding: 0 1rem;
  }
`;

const FormCard = styled.div`
  width: 100%;
  border: 1px solid rgb(219 219 219);
  border-radius: 8px;
  padding: 2rem 2.5rem;
  background: #fff;
  box-sizing: border-box;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #262626;
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    background: rgb(239 239 239);
  }
`;

const FormTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #262626;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StyledInput = styled(Input)`
  height: 38px;
  border-radius: 6px;
  border: 1px solid rgb(219 219 219);
  background: rgb(250 250 250);
  font-size: 0.875rem;
  padding: 0 0.5rem;
  &::placeholder {
    color: rgb(142 142 142);
  }
  &:focus {
    border-color: rgb(168 168 168);
    outline: none;
    box-shadow: none;
  }
`;

const LogInButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  height: 32px;
  margin-top: 0.5rem;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.$disabled ? "rgba(0, 149, 246, 0.3)" : "#0095f6")};
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  &:hover:not(:disabled) {
    background: #1877f2;
  }
  &:disabled {
    opacity: 1;
  }
`;

const ForgotLink = styled.a`
  font-size: 0.75rem;
  color: #00376b;
  text-decoration: none;
  margin-top: 0.75rem;
  align-self: center;
  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0 0.75rem;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgb(219 219 219);
`;

const DividerText = styled.span`
  font-size: 0.8125rem;
  color: rgb(142 142 142);
  font-weight: 600;
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 32px;
  border: 1px solid rgb(219 219 219);
  border-radius: 8px;
  background: #fff;
  color: #385185;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  &:hover {
    background: rgb(250 250 250);
  }
`;

const MetaLink = styled.a`
  font-size: 0.75rem;
  color: #8e8e8e;
  text-decoration: none;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  &:hover {
    text-decoration: underline;
  }
`;

const MetaLogo = styled.span`
  font-size: 1rem;
  font-weight: 300;
`;

const ErrorMessage = styled.div`
  font-size: 0.8125rem;
  color: #ed4956;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Footer = styled.footer`
  padding: 1rem 1.5rem 3rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.75rem;
  color: rgb(142 142 142);
`;

const FooterLink = styled.a`
  color: rgb(142 142 142);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const LanguageRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const LanguageSelect = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  color: rgb(142 142 142);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  &:hover {
    text-decoration: underline;
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  @media (min-width: 877px) {
    right: calc(50% - 467px + 1rem);
  }
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  color: #262626;
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    background: rgb(239 239 239);
  }
`;

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#385185" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("123456");
  const [mounted, setMounted] = useState(false);

  const { login, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.push("/");
      }
    }
  };

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <PageShell>
      <TopBar>
        <SettingsButton type="button" aria-label={t("login.settings")}>
          <Settings size={24} strokeWidth={1.5} />
        </SettingsButton>
      </TopBar>

      <Main>
        <LeftColumn>
          <InstagramLogo aria-hidden />
          <Tagline>
            {t("login.taglinePart1")}{" "}
            <TaglineHighlight>{t("login.taglinePart2")}</TaglineHighlight>
          </Tagline>
          <PhoneGraphic aria-hidden />
        </LeftColumn>

        <RightColumn>
          <FormCard>
            <FormHeader>
              <BackButton
                type="button"
                onClick={() => router.back()}
                aria-label={t("common.cancel")}
              >
                <ChevronLeft size={24} strokeWidth={2} />
              </BackButton>
              <FormTitle>{t("login.logIntoInstagram")}</FormTitle>
            </FormHeader>

            <Form onSubmit={handleSubmit}>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <StyledInput
                type="text"
                placeholder={t("login.usernamePlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                aria-label={t("login.usernamePlaceholder")}
              />
              <StyledInput
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label={t("login.passwordPlaceholder")}
              />
              <LogInButton
                type="submit"
                disabled={isLoading}
                $disabled={isLoading}
              >
                {isLoading ? t("login.loggingIn") : t("login.logIn")}
              </LogInButton>
              <ForgotLink href="#">{t("login.forgotPassword")}</ForgotLink>
              <Divider>
                <DividerLine />
                <DividerText>OR</DividerText>
                <DividerLine />
              </Divider>
              <SecondaryButton type="button">
                <FacebookIcon />
                {t("login.logInWithFacebook")}
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => router.push("/register")}
              >
                {t("login.createNewAccount")}
              </SecondaryButton>
              <MetaLink href="#">
                <MetaLogo>∞</MetaLogo>
                {t("login.meta")}
              </MetaLink>
            </Form>
          </FormCard>
        </RightColumn>
      </Main>

      <Footer>
        {t("login.footerLinks")
          .split(" ")
          .map((word, index) => (
            <FooterLink key={`${word}-${index}`} href="#">
              {word}
            </FooterLink>
          ))}
        <LanguageRow>
          <LanguageSelect type="button">{t("login.language")} ▼</LanguageSelect>
          <span>{t("login.copyright")}</span>
        </LanguageRow>
      </Footer>
    </PageShell>
  );
}
