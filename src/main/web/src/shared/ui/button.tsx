import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { styled } from "@/src/shared/utils/emotion";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border: none;
  box-shadow: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  outline: none;

  &:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  & svg {
    pointer-events: none;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  ${({ size = "default" }) => {
    switch (size) {
      case "sm":
        return `
          height: 2.25rem;
          padding: 0 0.75rem;
        `;
      case "lg":
        return `
          height: 2.75rem;
          padding: 0 2rem;
        `;
      case "icon":
        return `
          width: 2.5rem;
          height: 2.5rem;
        `;
      default:
        return `
          height: 2.5rem;
          padding: 0.5rem 1rem;
        `;
    }
  }}

  ${({ variant = "default" }) => {
    switch (variant) {
      case "destructive":
        return `
          background-color: hsl(var(--destructive));
          color: hsl(var(--destructive-foreground));

          &:hover:not(:disabled) {
            background-color: hsl(var(--destructive) / 0.9);
          }
        `;
      case "outline":
        return `
          border-width: 1px;
          border-style: solid;
          border-color: hsl(var(--input));
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));

          &:hover:not(:disabled) {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }
        `;
      case "secondary":
        return `
          background-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));

          &:hover:not(:disabled) {
            background-color: hsl(var(--secondary) / 0.8);
          }
        `;
      case "ghost":
        return `
          background-color: transparent;
          border: none;
          box-shadow: none;

          &:hover:not(:disabled) {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }
        `;
      case "link":
        return `
          background-color: transparent;
          color: hsl(var(--primary));
          text-decoration: none;
          text-underline-offset: 4px;

          &:hover:not(:disabled) {
            text-decoration: underline;
          }
        `;
      default:
        return `
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));

          &:hover:not(:disabled) {
            background-color: hsl(var(--primary) / 0.9);
          }
        `;
    }
  }}
`;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <StyledButton as={Comp} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button };
