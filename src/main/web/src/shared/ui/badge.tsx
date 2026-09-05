import * as React from "react";

import { styled } from "@/src/shared/utils/emotion";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const StyledBadge = styled.div<BadgeProps>`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border-width: 1px;
  border-style: solid;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  outline: none;

  &:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  ${({ variant = "default" }) => {
    switch (variant) {
      case "secondary":
        return `
          border-color: transparent;
          background-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));

          &:hover {
            background-color: hsl(var(--secondary) / 0.8);
          }
        `;
      case "destructive":
        return `
          border-color: transparent;
          background-color: hsl(var(--destructive));
          color: hsl(var(--destructive-foreground));

          &:hover {
            background-color: hsl(var(--destructive) / 0.8);
          }
        `;
      case "outline":
        return `
          border-color: hsl(var(--border));
          background-color: transparent;
          color: hsl(var(--foreground));
        `;
      default:
        return `
          border-color: transparent;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));

          &:hover {
            background-color: hsl(var(--primary) / 0.8);
          }
        `;
    }
  }}
`;

function Badge(props: BadgeProps) {
  return <StyledBadge {...props} />;
}

export { Badge };
