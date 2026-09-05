"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { subDays, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1rem;
`;

const Card = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

const ChartCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
  margin: 0 0 1rem;
`;

const ChartContainer = styled.div`
  height: 280px;
`;

const DateRangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 0.55rem 0.8rem;
  border: 1px solid ${theme.border};
  border-radius: 999px;
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 14px;
`;

const Button = styled.button`
  padding: 0.55rem 1rem;
  background: ${theme.primary};
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: ${theme.primaryHover};
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TotalBadge = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1rem;
`;

const LoadError = styled.div`
  color: ${theme.danger};
  padding: 2rem;
  text-align: center;
`;

const LoadingText = styled.div`
  color: ${theme.textSecondary};
  padding: 2rem;
  text-align: center;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.textSecondary};
  font-weight: 500;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};
`;

interface OverviewData {
  byEvent: { eventName: string; count: number }[];
  byDay: { date: string; count: number }[];
  total: number;
}

interface EventRow {
  id: string;
  eventName: string;
  userId: string | null;
  createdAt: string;
  properties: unknown;
}

const defaultEnd = new Date();
const defaultStart = subDays(defaultEnd, 7);

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [start, setStart] = useState(format(defaultStart, "yyyy-MM-dd"));
  const [end, setEnd] = useState(format(defaultEnd, "yyyy-MM-dd"));
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [events, setEvents] = useState<{ data: EventRow[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = getApiClient();

  const fetchData = () => {
    setLoading(true);
    setError(null);
    const startDate = `${start}T00:00:00.000Z`;
    const endDate = `${end}T23:59:59.999Z`;
    Promise.all([
      api.get<OverviewData>(
        `admin/analytics/overview?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`
      ),
      api.get<EventRow[]>(
        `admin/analytics/events?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&page=1&limit=20`
      ),
    ])
      .then(([overviewRes, eventsRes]) => {
        if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
        const evRes = eventsRes as { success: boolean; data?: EventRow[]; total?: number };
        if (evRes.success && evRes.data) setEvents({ data: evRes.data, total: evRes.total ?? evRes.data.length });
      })
      .catch(() => setError(t("error.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !overview) {
    return <LoadingText>{t("common.loading")}</LoadingText>;
  }
  if (error && !overview) {
    return <LoadError>{error}</LoadError>;
  }

  const byEventData = overview?.byEvent ?? [];
  const byDayData = overview?.byDay ?? [];
  const total = overview?.total ?? 0;
  const eventList = events?.data ?? [];

  return (
    <div>
      <PageTitle>{t("analytics.title")}</PageTitle>
      <DateRangeRow>
        <DateInput type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <DateInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <Button onClick={fetchData}>{t("common.apply")}</Button>
      </DateRangeRow>
      <TotalBadge>{t("analytics.total")}: {total}</TotalBadge>
      <ChartsRow>
        <ChartCard>
          <ChartTitle>{t("analytics.byEvent")}</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byEventData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                <XAxis dataKey="eventName" tick={{ fill: theme.textSecondary, fontSize: 12 }} />
                <YAxis tick={{ fill: theme.textSecondary, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}` }} />
                <Bar dataKey="count" fill={theme.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
        <ChartCard>
          <ChartTitle>{t("analytics.byDay")}</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDayData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                <XAxis dataKey="date" tick={{ fill: theme.textSecondary, fontSize: 12 }} />
                <YAxis tick={{ fill: theme.textSecondary, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}` }} />
                <Line type="monotone" dataKey="count" stroke={theme.primary} strokeWidth={2} dot={{ fill: theme.primary }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </ChartsRow>
      <ChartCard>
        <ChartTitle>{t("analytics.recentEvents")}</ChartTitle>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>User ID</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {eventList.map((row) => (
                <tr key={row.id}>
                  <Td>{row.eventName}</Td>
                  <Td>{row.userId ?? "—"}</Td>
                  <Td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </ChartCard>
    </div>
  );
}
