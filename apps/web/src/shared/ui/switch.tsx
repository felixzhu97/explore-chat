"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { styled } from "@/src/shared/utils/emotion";

const SwitchRoot = styled(SwitchPrimitives.Root)`
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  width: 2.75rem;
  cursor: pointer;
  border-radius: 9999px;
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  transition: background-color 0.15s ease;
  outline: none;

  &:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  &[data-state="checked"] {
    background-color: hsl(var(--primary));
  }

  &[data-state="unchecked"] {
    background-color: hsl(var(--input));
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SwitchThumb = styled(SwitchPrimitives.Thumb)`
  pointer-events: none;
  display: block;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 9999px;
  background-color: hsl(var(--background));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  transform: translateX(0);
  transition: transform 0.15s ease;

  &[data-state="checked"] {
    transform: translateX(1.25rem);
  }
`;

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchRoot ref={ref} className={className} {...props}>
    <SwitchThumb />
  </SwitchRoot>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
