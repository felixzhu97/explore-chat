"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { DataGrid } from "@/src/presentation/components/data-grid";
import { Search, ChevronRight } from "lucide-react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { AdminPagination } from "@/src/presentation/components/admin-pagination";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const PageTitle = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.9rem;
`;

const UserCellWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.875rem;
`;

const UserMeta = styled.div`
  line-height: 1.4;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserTitle = styled.div`
  font-weight: 500;
  color: ${theme.text};
  font-size: 15px;
`;

const UserStatusText = styled.div`
  font-size: 13px;
  color: ${theme.textSecondary};
`;

const UserDetailLink = styled(Link)`
  color: ${theme.primary};
  text-decoration: none;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

interface User extends Record<string, unknown> {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

function UserCell(params: { value: string; data: User }) {
  const { data } = params;
  const { t } = useTranslation();
  return (
    <UserCellWrap>
      <UserAvatar>
        {(data?.username || "?").charAt(0).toUpperCase()}
      </UserAvatar>
      <UserMeta>
        <UserTitle>{data?.username}</UserTitle>
        <UserStatusText>{data?.isOnline ? t("users.online") : t("users.offline")}</UserStatusText>
      </UserMeta>
    </UserCellWrap>
  );
}

function ActionCell(params: { data: User }) {
  const { data } = params;
  const { t } = useTranslation();
  if (!data?.id) return null;
  return (
    <UserDetailLink href={`/users/${data.id}`}>
      {t("users.detail")}
      <ChevronRight size={18} strokeWidth={2} />
    </UserDetailLink>
  );
}

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const api = getApiClient();

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
      });
      api
        .get<User[]>(`admin/users?${params}`)
        .then((res) => {
          if (res.success) {
            const r = res as { data?: User[]; pagination?: typeof pagination };
            setUsers(r.data || []);
            if (r.pagination) setPagination(r.pagination);
          }
        })
        .finally(() => setLoading(false));
    },
    [api, search]
  );

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "username",
        headerName: t("users.userHeader"),
        flex: 1,
        minWidth: 220,
        cellClass: "user-cell",
        cellRenderer: UserCell,
      },
      {
        field: "email",
        headerName: t("users.email"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "phone",
        headerName: t("users.phone"),
        flex: 1,
        minWidth: 130,
        valueFormatter: (p: { value?: string }) => p.value || "-",
      },
      {
        field: "createdAt",
        headerName: t("users.registeredAt"),
        minWidth: 130,
        valueFormatter: (p: { value?: string }) =>
          p.value ? format(new Date(p.value as string), "yyyy-MM-dd", { locale: dateLocale }) : "",
      },
      {
        headerName: t("users.action"),
        minWidth: 90,
        sortable: false,
        filter: false,
        cellRenderer: ActionCell,
      },
    ],
    [t, dateLocale]
  );

  return (
    <div>
      <PageTitle>{t("users.title")}</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <InputGroup className="admin-input-group-pill" style={{ width: 320 }}>
            <InputGroup.Text>
              <Search size={18} aria-hidden />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("users.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn">
            {t("users.search")}
          </Button>
        </Toolbar>
      </form>
      <DataGrid<User>
        rowData={users}
        columnDefs={columnDefs}
        loading={loading}
        getRowId={(p) => p.data.id}
      />
      {pagination.totalPages > 1 && (
        <Pagination>
          <AdminPagination
            page={pagination.page}
            count={pagination.totalPages}
            onChange={(p) => load(p)}
          />
        </Pagination>
      )}
    </div>
  );
}
