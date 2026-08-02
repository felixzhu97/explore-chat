"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { styled } from "@/src/shared/utils/emotion";

const Tabs = TabsPrimitive.Root;

const StyledTabsList = styled(TabsPrimitive.List)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  padding: 0.25rem;
`;

const StyledTabsTrigger = styled(TabsPrimitive.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.125rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  outline: none;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &[data-state="active"] {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  }
`;

const StyledTabsContent = styled(TabsPrimitive.Content)`
  margin-top: 0.5rem;
  outline: none;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }
`;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>((props, ref) => <StyledTabsList ref={ref} {...props} />);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>((props, ref) => <StyledTabsTrigger ref={ref} {...props} />);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>((props, ref) => <StyledTabsContent ref={ref} {...props} />);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
