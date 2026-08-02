import * as React from "react";

import { styled } from "@/src/shared/utils/emotion";

type AlertVariant = "default" | "destructive";

const StyledAlert = styled.div<{ variant?: AlertVariant }>`
  position: relative;
  width: 100%;
  border-radius: 0.5rem;
  border-width: 1px;
  border-style: solid;
  padding: 1rem;

  & > svg ~ * {
    padding-left: 1.75rem;
  }
  & > svg + div {
    transform: translateY(-3px);
  }
  & > svg {
    position: absolute;
    left: 1rem;
    top: 1rem;
    color: hsl(var(--foreground));
  }

  ${({ variant = "default" }) =>
    variant === "destructive"
      ? `
        border-color: hsl(var(--destructive) / 0.5);
        color: hsl(var(--destructive));
        & > svg { color: hsl(var(--destructive)); }
      `
      : `
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        border-color: hsl(var(--border));
      `}
`;

const AlertTitle = styled.h5`
  margin-bottom: 0.25rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.025em;
`;

const AlertDescription = styled.div`
  font-size: 0.875rem;
  & p {
    line-height: 1.625;
  }
`;

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }
>(({ variant, ...props }, ref) => (
  <StyledAlert ref={ref} role="alert" variant={variant} {...props} />
));
Alert.displayName = "Alert";

export { Alert, AlertTitle, AlertDescription };
