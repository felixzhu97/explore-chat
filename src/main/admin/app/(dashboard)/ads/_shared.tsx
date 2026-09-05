"use client";

import { styled, css } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";

const pillNativeSelectCss = css`
  box-sizing: border-box;
  min-height: 2.5rem;
  padding: 0 2.375rem 0 0.875rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background-color: ${theme.surface};
  color: ${theme.text};
  font-size: 0.875rem;
  line-height: 1.2;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='%238e8e8e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m4.5 6.5 3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.875rem 0.875rem;

  [data-theme="dark"] & {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='%23a8a8a8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m4.5 6.5 3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  }
`;

export const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  border: 1px solid ${theme.border};
  box-shadow: none;
  padding: 0.875rem 1rem;
`;

export const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${theme.textSecondary};
`;

export const MetricValue = styled.div`
  margin-top: 0.3rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.text};
`;

export const Card = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem 1.1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  margin: 0.25rem 0 0;
`;

export const Button = styled.button`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 1.125rem;
  border-radius: 999px;
  border: none;
  background: ${theme.primary};
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

export const SecondaryButton = styled.button`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 1.125rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  &:hover {
    background: ${theme.surfaceAlt};
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

export const Th = styled.th`
  text-align: left;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.textSecondary};
  font-weight: 500;
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 0.72rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};
  white-space: nowrap;
`;

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(p) =>
    p.status === "ACTIVE" ? "#166534" : p.status === "PAUSED" ? "#92400e" : "#991b1b"};
  background: ${(p) =>
    p.status === "ACTIVE"
      ? "rgba(22, 101, 52, 0.08)"
      : p.status === "PAUSED"
        ? "rgba(146, 64, 14, 0.08)"
        : "rgba(153, 27, 27, 0.08)"};
`;

export const EmptyState = styled.div`
  padding: 1.25rem 0.5rem;
  color: ${theme.textSecondary};
  font-size: 0.875rem;
`;

export const ErrorText = styled.div`
  color: ${theme.danger};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

export const Select = styled.select(pillNativeSelectCss);

export const InlineForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

export const Input = styled.input`
  box-sizing: border-box;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.875rem;
  line-height: 1.2;
  min-width: 0;
`;

export const SmallSelect = styled.select(pillNativeSelectCss);

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.25rem 0 0.75rem;
  color: ${theme.textSecondary};
  font-size: 0.8125rem;
`;

export const InlineError = styled.div`
  width: 100%;
  font-size: 0.75rem;
  color: ${theme.danger};
  margin-top: -0.25rem;
  margin-bottom: 0.25rem;
`;

export function formatBudget(cents: number | null) {
  if (cents == null) return "—";
  return `￥${(cents / 100).toFixed(2)}`;
}

export function percentage(v: number) {
  if (!isFinite(v)) return "0.00%";
  return `${v.toFixed(2)}%`;
}

export function numberText(v: number) {
  if (!isFinite(v)) return "0";
  return String(Math.round(v));
}

export function statusLabel(t: (k: string) => string, status: string) {
  if (status === "ACTIVE") return t("ads.statusActive");
  if (status === "PAUSED") return t("ads.statusPaused");
  if (status === "DISABLED") return t("ads.statusDisabled");
  if (status === "COMPLETED") return t("ads.statusCompleted");
  return status;
}

export function objectiveLabel(t: (k: string) => string, objective: string) {
  if (objective === "IMPRESSIONS") return t("ads.objectiveImpressions");
  if (objective === "CLICKS") return t("ads.objectiveClicks");
  if (objective === "CONVERSIONS") return t("ads.objectiveConversions");
  return objective;
}
