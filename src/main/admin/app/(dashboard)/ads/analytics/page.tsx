"use client";

import { useTranslation } from "react-i18next";
import { useAdsData } from "../_use-ads-data";
import {
  PageRoot,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  TableWrap,
  Table,
  Th,
  Td,
  EmptyState,
  ErrorText,
  formatBudget,
  percentage,
  numberText,
} from "../_shared";

export default function AdsAnalyticsPage() {
  const { t } = useTranslation();
  const { analyticsView, loading, error } = useAdsData(t);

  return (
    <PageRoot>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t("ads.moduleAnalytics")}</CardTitle>
            <CardSubtitle>{t("ads.analyticsSubtitle")}</CardSubtitle>
          </div>
        </CardHeader>
        <MetricsGrid>
          <MetricCard>
            <MetricLabel>{t("ads.kpiSpend")}</MetricLabel>
            <MetricValue>{formatBudget(analyticsView.spendCents)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>{t("ads.kpiCtr")}</MetricLabel>
            <MetricValue>{percentage(analyticsView.ctr)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>{t("ads.kpiCvr")}</MetricLabel>
            <MetricValue>{percentage(analyticsView.cvr)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>{t("ads.kpiClicks")}</MetricLabel>
            <MetricValue>{numberText(analyticsView.clicks)}</MetricValue>
          </MetricCard>
        </MetricsGrid>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{t("ads.tableName")}</Th>
                <Th>{t("ads.kpiImpressions")}</Th>
                <Th>{t("ads.kpiClicks")}</Th>
                <Th>{t("ads.kpiConversions")}</Th>
                <Th>{t("ads.kpiCtr")}</Th>
                <Th>{t("ads.kpiCvr")}</Th>
                <Th>{t("ads.tableSpend")}</Th>
              </tr>
            </thead>
            <tbody>
              {loading && analyticsView.campaigns.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <EmptyState>{t("common.loading")}</EmptyState>
                  </Td>
                </tr>
              ) : analyticsView.campaigns.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <EmptyState>{t("ads.emptyCampaigns")}</EmptyState>
                  </Td>
                </tr>
              ) : (
                analyticsView.campaigns.map((item) => (
                  <tr key={item.campaignId}>
                    <Td>{item.campaignName}</Td>
                    <Td>{numberText(item.impressions)}</Td>
                    <Td>{numberText(item.clicks)}</Td>
                    <Td>{numberText(item.conversions)}</Td>
                    <Td>{percentage(item.ctr)}</Td>
                    <Td>{percentage(item.cvr)}</Td>
                    <Td>{formatBudget(item.spendCents)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Card>
    </PageRoot>
  );
}
