"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.primary};
  text-decoration: none;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

const Card = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  border: 1px solid ${theme.border};
  padding: 1rem;
  max-width: 500px;
  box-shadow: none;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const UserName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 0.5rem;
`;

const Row = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${theme.border};
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  color: ${theme.text};
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: ${theme.textSecondary};
`;

const Actions = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
`;

const Btn = styled.button<{ $danger?: boolean }>`
  padding: 0.55rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$danger ? theme.danger : theme.border)};
  background: ${(p) => (p.$danger ? theme.danger : theme.surfaceAlt)};
  color: ${(p) => (p.$danger ? "#fff" : theme.text)};
  &:hover {
    opacity: 0.9;
  }
`;

const StateText = styled.div`
  color: ${theme.textSecondary};
  font-size: 0.875rem;
`;

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const api = getApiClient();

  useEffect(() => {
    if (!params.id) return;
    api
      .get<User>(`admin/users/${params.id}`)
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          setNotFound(false);
          return;
        }
        setUser(null);
        setNotFound(true);
      })
      .catch(() => {
        setUser(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = () => {
    if (!user || !confirm(t("users.deleteConfirm"))) return;
    setDeleting(true);
    api
      .delete(`admin/users/${user.id}`)
      .then(() => {
        router.push("/users");
      })
      .finally(() => setDeleting(false));
  };

  if (loading) {
    return (
      <div>
        <BackLink href="/users">
          <ArrowLeft size={18} /> {t("users.backToUserList")}
        </BackLink>
        <StateText>{t("common.loading")}</StateText>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div>
        <BackLink href="/users">
          <ArrowLeft size={18} /> {t("users.backToUserList")}
        </BackLink>
        <StateText>{t("users.notFound")}</StateText>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/users">
        <ArrowLeft size={18} /> {t("users.backToUserList")}
      </BackLink>
      <Card>
        <Avatar>{user.username?.charAt(0)?.toUpperCase() || "?"}</Avatar>
        <UserName>{user.username}</UserName>
        <Row>
          <Label>{t("users.email")}</Label>
          <span>{user.email}</span>
        </Row>
        <Row>
          <Label>{t("users.phone")}</Label>
          <span>{user.phone || "-"}</span>
        </Row>
        <Row>
          <Label>{t("users.status")}</Label>
          <span>{user.isOnline ? t("users.online") : t("users.offline")}</span>
        </Row>
        <Row>
          <Label>{t("users.registeredAt")}</Label>
          <span>{format(new Date(user.createdAt), "PPpp", { locale: dateLocale })}</span>
        </Row>
        <Row>
          <Label>{t("users.lastLogin")}</Label>
          <span>{format(new Date(user.lastSeen), "PPpp", { locale: dateLocale })}</span>
        </Row>
        <Actions>
          <Btn $danger onClick={handleDelete} disabled={deleting}>
            {deleting ? t("users.deleting") : t("users.deleteUser")}
          </Btn>
        </Actions>
      </Card>
    </div>
  );
}
