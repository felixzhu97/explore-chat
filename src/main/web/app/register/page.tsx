"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(219 219 219);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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

const MetaLogo = styled.a`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #262626;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const MetaSymbol = styled.span`
  font-size: 1.25rem;
  font-weight: 300;
`;

const Main = styled.main`
  flex: 1;
  padding: 1.5rem 1rem 2rem;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #262626;
  margin: 0 0 0.25rem;
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: #8e8e8e;
  margin: 0 0 1.5rem;
  line-height: 1.4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #262626;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const InfoLink = styled.a`
  font-size: 0.75rem;
  color: #0095f6;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const NoteText = styled.p`
  font-size: 0.75rem;
  color: #8e8e8e;
  margin: 0;
  line-height: 1.4;
`;

const StyledInput = styled(Input)`
  height: 38px;
  border-radius: 6px;
  border: 1px solid rgb(219 219 219);
  background: #fff;
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

const BirthdayRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
`;

const StyledSelectTrigger = styled(SelectTrigger)`
  height: 38px;
  border-radius: 6px;
  border: 1px solid rgb(219 219 219);
  background: #fff;
  font-size: 0.875rem;
  &[data-placeholder] {
    color: rgb(142 142 142);
  }
`;

const LegalBlock = styled.div`
  font-size: 0.75rem;
  color: #8e8e8e;
  line-height: 1.5;
  margin: 0.5rem 0 0;
`;

const InlineLink = styled.a`
  color: #0095f6;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  height: 36px;
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

const SecondaryButton = styled.button`
  width: 100%;
  height: 36px;
  margin-top: 0.75rem;
  border: 1px solid rgb(219 219 219);
  border-radius: 8px;
  background: #fff;
  color: #0095f6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: rgb(250 250 250);
  }
`;

const ErrorMessage = styled.div`
  font-size: 0.8125rem;
  color: #ed4956;
  margin-top: 0.25rem;
`;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(month: number, year: number): number {
  if (month === 0) return 31;
  return new Date(year, month, 0).getDate();
}

export default function RegisterPage() {
  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, isAuthenticated, isLoading, error } = useAuth();
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

  const monthNum = birthMonth ? MONTHS.indexOf(birthMonth) + 1 : 0;
  const yearNum = birthYear
    ? parseInt(birthYear, 10)
    : new Date().getFullYear();
  const daysInMonth =
    monthNum && yearNum ? getDaysInMonth(monthNum, yearNum) : 31;
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1),
  );
  const yearOptions = Array.from({ length: 100 }, (_, i) =>
    String(new Date().getFullYear() - 18 - i),
  );

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(mobileOrEmail.trim());
    if (!isEmail) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (!username.trim() || username.trim().length < 2) {
      setLocalError("Username must be at least 2 characters.");
      return;
    }
    const result = await register({
      email: mobileOrEmail.trim(),
      password,
      username: username.trim(),
    });
    if (result.success) {
      router.push("/");
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  if (!mounted) return null;
  if (isAuthenticated) return null;

  return (
    <PageShell>
      <Header>
        <BackButton
          type="button"
          onClick={() => router.back()}
          aria-label={t("common.cancel")}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </BackButton>
        <MetaLogo href="#">
          <MetaSymbol>∞</MetaSymbol>
          {t("register.meta")}
        </MetaLogo>
      </Header>

      <Main>
        <Title>{t("register.title")}</Title>
        <Subtitle>{t("register.subtitle")}</Subtitle>

        <Form onSubmit={validateAndSubmit}>
          {(error || localError) && (
            <ErrorMessage>{localError || error}</ErrorMessage>
          )}

          <FieldGroup>
            <Label htmlFor="mobileOrEmail">{t("register.mobileOrEmail")}</Label>
            <StyledInput
              id="mobileOrEmail"
              type="text"
              placeholder={t("register.mobileOrEmailPlaceholder")}
              value={mobileOrEmail}
              onChange={(e) => setMobileOrEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <NoteText>
              {t("register.contactInfoNotePrefix")}
              <InfoLink href="#">{t("register.learnWhyContact")}</InfoLink>
            </NoteText>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">{t("register.password")}</Label>
            <StyledInput
              id="password"
              type="password"
              placeholder={t("register.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FieldGroup>

          <FieldGroup>
            <LabelRow>
              <Label htmlFor="birthday">{t("register.birthday")}</Label>
              <button type="button" aria-label="Birthday help">
                <HelpCircle size={14} color="#8e8e8e" />
              </button>
            </LabelRow>
            <BirthdayRow>
              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <StyledSelectTrigger id="birthday">
                  <SelectValue placeholder={t("register.month")} />
                </StyledSelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthDay} onValueChange={setBirthDay}>
                <StyledSelectTrigger>
                  <SelectValue placeholder={t("register.day")} />
                </StyledSelectTrigger>
                <SelectContent>
                  {dayOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthYear} onValueChange={setBirthYear}>
                <StyledSelectTrigger>
                  <SelectValue placeholder={t("register.year")} />
                </StyledSelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </BirthdayRow>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="fullName">{t("register.name")}</Label>
            <StyledInput
              id="fullName"
              type="text"
              placeholder={t("register.fullNamePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="username">{t("register.username")}</Label>
            <StyledInput
              id="username"
              type="text"
              placeholder={t("register.usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              autoComplete="username"
            />
          </FieldGroup>

          <LegalBlock>
            {t("register.contactUploadPrefix")}
            <InlineLink href="#">{t("register.learnMore")}</InlineLink>
          </LegalBlock>

          <LegalBlock>
            {t("register.agreeTermsPrefix")}
            <InlineLink href="#">{t("register.terms")}</InlineLink>
            {", "}
            <InlineLink href="#">{t("register.privacyPolicy")}</InlineLink>
            {" and "}
            <InlineLink href="#">{t("register.cookiesPolicy")}</InlineLink>
            {t("register.agreeTermsSuffix")}
          </LegalBlock>

          <LegalBlock>{t("register.privacyNote")}</LegalBlock>

          <SubmitButton
            type="submit"
            disabled={isLoading}
            $disabled={isLoading}
          >
            {isLoading ? t("register.submitting") : t("register.submit")}
          </SubmitButton>

          <SecondaryButton type="button" onClick={() => router.push("/login")}>
            {t("register.alreadyHaveAccount")}
          </SecondaryButton>
        </Form>
      </Main>
    </PageShell>
  );
}
