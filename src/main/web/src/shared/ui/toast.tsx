"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const ToastProvider = ToastPrimitives.Provider;

type ToastVariant = "default" | "destructive";

const StyledViewport = styled(ToastPrimitives.Viewport)`
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  max-height: 100vh;
  width: 100%;
  flex-direction: column-reverse;
  padding: 1rem;

  @media (min-width: 640px) {
    bottom: 0;
    top: auto;
    flex-direction: column;
    right: 0;
    max-width: 420px;
  }
`;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>((props, ref) => <StyledViewport ref={ref} {...props} />);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const StyledToast = styled(ToastPrimitives.Root)<{ variant?: ToastVariant }>`
  pointer-events: auto;
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  overflow: hidden;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  padding: 1.5rem 2rem 1.5rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: all 0.15s ease;

  &[data-swipe="cancel"] {
    transform: translateX(0);
  }
  &[data-swipe="end"] {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  &[data-swipe="move"] {
    transform: translateX(var(--radix-toast-swipe-move-x));
    transition: none;
  }

  ${({ variant = "default" }) =>
    variant === "destructive"
      ? `
        border-color: hsl(var(--destructive));
        background-color: hsl(var(--destructive));
        color: hsl(var(--destructive-foreground));
      `
      : `
        border-color: hsl(var(--border));
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
      `}
`;

const StyledAction = styled(ToastPrimitives.Action)`
  display: inline-flex;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s,
    color 0.15s;
  outline: none;

  &:focus {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }
  &:hover {
    background-color: hsl(var(--secondary));
  }
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const StyledClose = styled(ToastPrimitives.Close)`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: hsl(var(--foreground) / 0.5);
  opacity: 0;
  transition: opacity 0.15s;
  outline: none;

  &:focus {
    opacity: 1;
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }
  .group:hover & {
    opacity: 1;
  }
`;

const StyledTitle = styled(ToastPrimitives.Title)`
  font-size: 0.875rem;
  font-weight: 600;
`;

const StyledDescription = styled(ToastPrimitives.Description)`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: ToastVariant;
  }
>(({ variant, ...props }, ref) => (
  <StyledToast ref={ref} variant={variant} {...props} />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>((props, ref) => <StyledAction ref={ref} {...props} />);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>((props, ref) => (
  <StyledClose ref={ref} toast-close="" {...props}>
    <X style={{ height: 16, width: 16 }} />
  </StyledClose>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>((props, ref) => <StyledTitle ref={ref} {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>((props, ref) => <StyledDescription ref={ref} {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
