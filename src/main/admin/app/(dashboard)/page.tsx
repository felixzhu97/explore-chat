"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import {
  Users,
  MessageSquare,
  UsersRound,
  Megaphone,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.875rem;
  margin-bottom: 1rem;
`;

const MetricCard = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const MetricIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(0, 149, 246, 0.12);
  color: ${theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricChange = styled.span<{ positive?: boolean }>`
  font-size: 0.8125rem;
  color: ${(p) => (p.positive ? theme.primary : theme.danger)};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${theme.text};
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${theme.textSecondary};
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ChartCard = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
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

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ActivityCard = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

const ActivityTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
  margin: 0 0 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${theme.border};
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.div`
  font-size: 0.9375rem;
  color: ${theme.text};
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
  margin-top: 0.25rem;
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

const EmptyActivityText = styled.div`
  color: ${theme.textSecondary};
  font-size: 0.875rem;
  padding: 1rem 0;
`;

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalGroups: number;
  totalMessages: number;
  onlineUsers: number;
  todayMessages: number;
  messagesByType?: Record<string, number>;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    createdAt: string;
  }>;
}

function formatCompact(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const api = getApiClient();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;

  useEffect(() => {
    api
      .get<Stats>("admin/stats")
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <LoadingText>{t("common.loading")}</LoadingText>
    );
  }
  if (!stats) {
    return <LoadError>{t("error.loadFailed")}</LoadError>;
  }

  const messageVolumeData = [
    { month: "1月", sent: Math.round(stats.totalMessages * 0.22), received: Math.round(stats.totalMessages * 0.18) },
    { month: "2月", sent: Math.round(stats.totalMessages * 0.18), received: Math.round(stats.totalMessages * 0.2) },
    { month: "3月", sent: Math.round(stats.totalMessages * 0.2), received: Math.round(stats.totalMessages * 0.19) },
    { month: "4月", sent: Math.round(stats.totalMessages * 0.15), received: Math.round(stats.totalMessages * 0.16) },
    { month: "5月", sent: Math.round(stats.totalMessages * 0.14), received: Math.round(stats.totalMessages * 0.15) },
    { month: "6月", sent: Math.round(stats.totalMessages * 0.11), received: Math.round(stats.totalMessages * 0.12) },
  ];

  const userGrowthData = [
    { month: "1月", users: Math.round(stats.totalUsers * 0.25) },
    { month: "2月", users: Math.round(stats.totalUsers * 0.4) },
    { month: "3月", users: Math.round(stats.totalUsers * 0.55) },
    { month: "4月", users: Math.round(stats.totalUsers * 0.7) },
    { month: "5月", users: Math.round(stats.totalUsers * 0.85) },
    { month: "6月", users: stats.totalUsers },
  ];

  const platformData = [
    { name: "Android", value: 62, color: "#0095f6" },
    { name: "iOS", value: 31, color: "#5851db" },
    { name: "Web", value: 7, color: "#8e8e8e" },
  ];

  const recentActivity = stats.recentUsers?.slice(0, 5).map((u) => ({
    id: u.id,
    initials: (u.username || "U").slice(0, 2).toUpperCase(),
    text: t("dashboard.registered", { name: u.username }),
    time: formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: dateLocale }),
  })) || [];

  return (
    <div>
      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <Users size={24} />
            </MetricIcon>
            <MetricChange positive>
              <TrendingUp size={14} />
              +12.5% {t("dashboard.vsLastMonth")}
            </MetricChange>
          </MetricHeader>
          <MetricValue>{formatCompact(stats.totalUsers)}</MetricValue>
          <MetricLabel>{t("dashboard.activeUsers")}</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <MessageSquare size={24} />
            </MetricIcon>
            <MetricChange positive>
              <TrendingUp size={14} />
              +8.2% {t("dashboard.vsLastMonth")}
            </MetricChange>
          </MetricHeader>
          <MetricValue>{formatCompact(stats.totalMessages)}</MetricValue>
          <MetricLabel>{t("dashboard.messagesSent")}</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <UsersRound size={24} />
            </MetricIcon>
            <MetricChange positive>
              <TrendingUp size={14} />
              +3.1% {t("dashboard.vsLastMonth")}
            </MetricChange>
          </MetricHeader>
          <MetricValue>{formatCompact(stats.totalGroups)}</MetricValue>
          <MetricLabel>{t("dashboard.activeGroups")}</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <Megaphone size={24} />
            </MetricIcon>
            <MetricChange positive={false}>
              <TrendingDown size={14} />
              -2.4% {t("dashboard.vsLastMonth")}
            </MetricChange>
          </MetricHeader>
          <MetricValue>{formatCompact(stats.todayMessages)}</MetricValue>
          <MetricLabel>{t("dashboard.todayBroadcast")}</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <ChartsRow>
        <ChartCard>
          <ChartTitle>{t("dashboard.messageVolume")}</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                <XAxis dataKey="month" stroke={theme.textSecondary} fontSize={12} />
                <YAxis stroke={theme.textSecondary} fontSize={12} tickFormatter={(v) => (v >= 1000 ? v / 1000 + "K" : v)} />
                <Tooltip
                  contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8 }}
                  labelStyle={{ color: theme.text }}
                />
                <Legend />
                <Bar dataKey="sent" fill="#0095f6" name={t("chart.sent")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill="#5851db" name={t("chart.received")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
        <ChartCard>
          <ChartTitle>{t("dashboard.userGrowth")}</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                <XAxis dataKey="month" stroke={theme.textSecondary} fontSize={12} />
                <YAxis stroke={theme.textSecondary} fontSize={12} allowDecimals={false} tickFormatter={(v) => formatCompact(Number(v))} />
                <Tooltip
                  contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="users" stroke="#0095f6" strokeWidth={2} dot={{ fill: "#0095f6" }} name={t("chart.users")} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </ChartsRow>

      <BottomRow>
        <ChartCard>
          <ChartTitle>{t("dashboard.platformDistribution")}</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8 }}
                  formatter={(v: number) => [`${v}%`, t("chart.share")]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
        <ActivityCard>
          <ActivityTitle>{t("dashboard.recentActivity")}</ActivityTitle>
          {recentActivity.length ? (
            recentActivity.map((a) => (
              <ActivityItem key={a.id}>
                <ActivityAvatar>{a.initials}</ActivityAvatar>
                <ActivityContent>
                  <ActivityText>{a.text}</ActivityText>
                  <ActivityTime>{a.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))
          ) : (
            <EmptyActivityText>{t("dashboard.noActivity")}</EmptyActivityText>
          )}
        </ActivityCard>
      </BottomRow>
    </div>
  );
}
