"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search } from "lucide-react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { AdminPagination } from "@/src/presentation/components/admin-pagination";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const GroupCard = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  border: 1px solid ${theme.border};
  padding: 1rem;
  box-shadow: none;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const GroupName = styled.div`
  font-weight: 600;
  color: ${theme.text};
  font-size: 1rem;
`;

const GroupMeta = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  margin-top: 0.25rem;
`;

const Members = styled.div`
  font-size: 0.875rem;
  color: ${theme.textSecondary};
  margin-top: 0.5rem;
`;

const DescriptionText = styled.div`
  font-size: 0.875rem;
  color: ${theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const MemberPill = styled.span`
  display: inline-block;
  margin-left: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: ${theme.surfaceAlt};
  border-radius: 999px;
  font-size: 0.75rem;
`;

const MoreCount = styled.span`
  margin-left: 0.25rem;
  color: ${theme.textSecondary};
`;

const EmptyState = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 10px;
  box-shadow: none;
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

const LoadingText = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${theme.textSecondary};
`;

const Pager = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  creator: { id: string; username: string; email: string };
  participants: Array<{ username: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function GroupsPage() {
  const { t, i18n } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = getApiClient();

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: "20",
      ...(search && { search }),
    });
    api
      .get<{ data: Group[]; pagination: { totalPages: number } }>(
        `admin/groups?${params}`
      )
      .then((res) => {
        if (res.success) {
          const r = res as { data?: Group[]; pagination?: { totalPages: number } };
          setGroups(r.data || []);
          setTotalPages(r.pagination?.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <InputGroup className="admin-input-group-pill" style={{ width: 320 }}>
            <InputGroup.Text>
              <Search size={18} aria-hidden />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("groups.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button type="submit" variant="primary" className="rounded-pill admin-primary-btn">
            {t("groups.search")}
          </Button>
        </Toolbar>
      </form>
      {loading ? (
        <LoadingText>{t("common.loading")}</LoadingText>
      ) : (
        <>
          {groups.length === 0 ? (
            <EmptyState>{t("groups.empty")}</EmptyState>
          ) : (
            <GroupGrid>
              {groups.map((g) => (
                <GroupCard key={g.id}>
                  <GroupHeader>
                    <Avatar>{g.name?.charAt(0)?.toUpperCase() || "?"}</Avatar>
                    <div>
                      <GroupName>{g.name}</GroupName>
                      <GroupMeta>
                        {t("groups.creator")}: {g.creator?.username} ·{" "}
                        {format(new Date(g.createdAt), "yyyy-MM-dd", {
                          locale: dateLocale,
                        })}
                      </GroupMeta>
                    </div>
                  </GroupHeader>
                  {g.description && (
                    <DescriptionText>{g.description}</DescriptionText>
                  )}
                  <Members>
                    {t("groups.membersCount", { count: g.participants?.length || 0 })}
                    {g.participants?.slice(0, 5).map((p) => (
                      <MemberPill key={p.username}>
                        {p.username}
                      </MemberPill>
                    ))}
                    {(g.participants?.length || 0) > 5 && (
                      <MoreCount>+{g.participants!.length - 5}</MoreCount>
                    )}
                  </Members>
                </GroupCard>
              ))}
            </GroupGrid>
          )}
          {totalPages > 1 && (
            <Pager>
              <AdminPagination
                page={page}
                count={totalPages}
                onChange={(p) => setPage(p)}
              />
            </Pager>
          )}
        </>
      )}
    </div>
  );
}
