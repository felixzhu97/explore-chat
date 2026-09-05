"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import sumBy from "lodash/sumBy";

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
`;

const MetricValue = styled.div`
  margin-top: 0.3rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.text};
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const FilterBtn = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background: ${(p) => (p.active ? theme.primary : theme.surface)};
  color: ${(p) => (p.active ? "#fff" : theme.text)};
  font-size: 0.75rem;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.textSecondary};
  font-weight: 500;
`;

const Td = styled.td`
  padding: 0.7rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};
`;

const Status = styled.span<{ kind: "pending" | "approved" | "rejected" }>`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(p) => (p.kind === "approved" ? "#166534" : p.kind === "pending" ? "#92400e" : "#991b1b")};
  background: ${(p) =>
    p.kind === "approved"
      ? "rgba(22, 101, 52, 0.08)"
      : p.kind === "pending"
      ? "rgba(146, 64, 14, 0.08)"
      : "rgba(153, 27, 27, 0.08)"};
`;

const Empty = styled.div`
  padding: 1rem 0.25rem;
  color: ${theme.textSecondary};
  font-size: 0.875rem;
`;

type MerchantStatus = "pending" | "approved" | "rejected";

type Merchant = {
  id: string;
  name: string;
  industry: string;
  gmV30d: number;
  status: MerchantStatus;
};

const MOCK_MERCHANTS: Merchant[] = [
  { id: "m_101", name: "Pixel Market", industry: "E-commerce", gmV30d: 368000, status: "pending" },
  { id: "m_102", name: "Nova Travel", industry: "Travel", gmV30d: 221000, status: "approved" },
  { id: "m_103", name: "FitPulse", industry: "Health", gmV30d: 154000, status: "approved" },
  { id: "m_104", name: "Taste Lab", industry: "Food", gmV30d: 97000, status: "rejected" },
];

function formatMoney(value: number) {
  return `￥${value.toLocaleString("en-US")}`;
}

export default function BusinessPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<"all" | MerchantStatus>("all");

  const merchants = useMemo(
    () =>
      statusFilter === "all"
        ? MOCK_MERCHANTS
        : MOCK_MERCHANTS.filter((m) => m.status === statusFilter),
    [statusFilter],
  );

  const metrics = useMemo(() => {
    const approved = MOCK_MERCHANTS.filter((m) => m.status === "approved");
    return {
      merchantCount: MOCK_MERCHANTS.length,
      pendingCount: MOCK_MERCHANTS.filter((m) => m.status === "pending").length,
      approvedCount: approved.length,
      gmv30d: sumBy(approved, (m) => m.gmV30d),
    };
  }, []);

  const statusText = (status: MerchantStatus) => {
    if (status === "approved") return t("business.statusApproved");
    if (status === "pending") return t("business.statusPending");
    return t("business.statusRejected");
  };

  return (
    <PageRoot>
      <MetricsGrid>
        <Card>
          <MetricLabel>{t("business.metricMerchants")}</MetricLabel>
          <MetricValue>{metrics.merchantCount}</MetricValue>
        </Card>
        <Card>
          <MetricLabel>{t("business.metricPending")}</MetricLabel>
          <MetricValue>{metrics.pendingCount}</MetricValue>
        </Card>
        <Card>
          <MetricLabel>{t("business.metricApproved")}</MetricLabel>
          <MetricValue>{metrics.approvedCount}</MetricValue>
        </Card>
        <Card>
          <MetricLabel>{t("business.metricGmv30d")}</MetricLabel>
          <MetricValue>{formatMoney(metrics.gmv30d)}</MetricValue>
        </Card>
      </MetricsGrid>
      <Grid>
        <Card>
          <CardTitle>{t("business.reviewQueueTitle")}</CardTitle>
          <Toolbar>
            <FilterBtn active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              {t("common.all")}
            </FilterBtn>
            <FilterBtn active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")}>
              {t("business.statusPending")}
            </FilterBtn>
            <FilterBtn active={statusFilter === "approved"} onClick={() => setStatusFilter("approved")}>
              {t("business.statusApproved")}
            </FilterBtn>
            <FilterBtn active={statusFilter === "rejected"} onClick={() => setStatusFilter("rejected")}>
              {t("business.statusRejected")}
            </FilterBtn>
          </Toolbar>
          {merchants.length === 0 ? (
            <Empty>{t("business.empty")}</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>{t("business.tableMerchant")}</Th>
                  <Th>{t("business.tableIndustry")}</Th>
                  <Th>{t("business.tableGmv30d")}</Th>
                  <Th>{t("business.tableStatus")}</Th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id}>
                    <Td>{m.name}</Td>
                    <Td>{m.industry}</Td>
                    <Td>{formatMoney(m.gmV30d)}</Td>
                    <Td>
                      <Status kind={m.status}>{statusText(m.status)}</Status>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <Card>
          <CardTitle>{t("business.pipelineTitle")}</CardTitle>
          <Table>
            <tbody>
              <tr>
                <Td>{t("business.pipelineLead")}</Td>
                <Td>{t("business.pipelineLeadValue")}</Td>
              </tr>
              <tr>
                <Td>{t("business.pipelineQualified")}</Td>
                <Td>{t("business.pipelineQualifiedValue")}</Td>
              </tr>
              <tr>
                <Td>{t("business.pipelineContracting")}</Td>
                <Td>{t("business.pipelineContractingValue")}</Td>
              </tr>
              <tr>
                <Td>{t("business.pipelineLive")}</Td>
                <Td>{t("business.pipelineLiveValue")}</Td>
              </tr>
            </tbody>
          </Table>
        </Card>
      </Grid>
    </PageRoot>
  );
}
