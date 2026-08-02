"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const CheckboxRoot = styled(CheckboxPrimitive.Root)`
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  border-radius: 0.125rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--primary));
  background-color: transparent;
  color: hsl(var(--primary-foreground));
  outline: none;

  &:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &[data-state="checked"] {
    background-color: hsl(var(--primary));
  }
`;

const CheckboxIndicator = styled(CheckboxPrimitive.Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxRoot ref={ref} className={className} {...props}>
    <CheckboxIndicator>
      <Check size={16} />
    </CheckboxIndicator>
  </CheckboxRoot>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
