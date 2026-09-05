"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "@/src/presentation/providers/auth-provider";
import { useTheme } from "@/src/presentation/providers/theme-provider";
import { theme } from "@/src/shared/theme";
import { setStoredLocale, type AppLocale } from "@/src/shared/i18n";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import BsForm from "react-bootstrap/Form";

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.bg};
`;

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 0.2rem;
`;

const Subtitle = styled.p`
  color: ${theme.textSecondary};
  font-size: 0.8125rem;
  margin-bottom: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorText = styled.p`
  color: ${theme.danger};
  font-size: 0.875rem;
`;

const TopRight = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DEFAULT_EMAIL = "admin@whatschat.com";
const DEFAULT_PASSWORD = "123456";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err ? String((err as Error).message) : t("login.fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <TopRight>
        <button
          type="button"
          className="btn btn-link p-2 text-body-secondary"
          onClick={toggle}
          title={mode === "light" ? t("common.themeDark") : t("common.themeLight")}
        >
          {mode === "light" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
        <BsForm.Select
          id="login-lang"
          aria-label={t("common.language")}
          className="admin-lang-select rounded-pill"
          value={i18n.language.startsWith("zh") ? "zh" : "en"}
          onChange={(e) => {
            const next = e.target.value as AppLocale;
            setStoredLocale(next);
            i18n.changeLanguage(next);
          }}
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </BsForm.Select>
      </TopRight>
      <Card className="w-100 rounded-3" style={{ maxWidth: 350 }}>
        <Card.Body className="p-4">
          <Title>Instagram Admin</Title>
          <Subtitle>{t("login.subtitle")}</Subtitle>
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <BsForm.Control
              size="sm"
              type="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-pill"
            />
            <BsForm.Control
              size="sm"
              type="password"
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-pill"
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
            <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn" disabled={loading}>
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Page>
  );
}
