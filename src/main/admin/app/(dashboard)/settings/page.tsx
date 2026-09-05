"use client";

import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1rem;
`;

const Card = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${theme.border};
  max-width: 500px;
  box-shadow: ${theme.shadow};
`;

const Text = styled.p`
  color: ${theme.textSecondary};
  font-size: 0.9375rem;
`;

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageTitle>{t("settings.title")}</PageTitle>
      <Card>
        <Text>{t("settings.developing")}</Text>
      </Card>
    </div>
  );
}
