"use client";

import { styled, css } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";

const commercePillSelectCss = css`
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background-color: ${theme.surface};
  color: ${theme.text};
  font-size: 0.8125rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='%238e8e8e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m4.5 6.5 3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.65rem center;
  background-size: 0.75rem 0.75rem;

  [data-theme="dark"] & {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='%23a8a8a8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m4.5 6.5 3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  }
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Card = styled.div`
  background: ${theme.surface};
  border-radius: 10px;
  padding: 1rem 1.1rem;
  border: 1px solid ${theme.border};
  box-shadow: none;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
`;

export const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
`;

export const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.8125rem;
`;

export const Select = styled.select(commercePillSelectCss);

export const Button = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: ${theme.primary};
  color: #fff;
  font-size: 0.8125rem;
  cursor: pointer;
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
`;

export const Td = styled.td`
  padding: 0.72rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};
`;

export const ErrorText = styled.div`
  color: ${theme.danger};
  font-size: 0.875rem;
`;

export const Empty = styled.div`
  color: ${theme.textSecondary};
  font-size: 0.875rem;
  padding: 0.5rem 0;
`;

export function money(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `￥${(cents / 100).toFixed(2)}`;
}
