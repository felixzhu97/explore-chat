"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

type SheetSide = "top" | "bottom" | "left" | "right";

const StyledOverlay = styled(SheetPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgb(0 0 0 / 0.8);
`;

const StyledContent = styled(SheetPrimitive.Content)<{ side?: SheetSide }>`
  position: fixed;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: hsl(var(--background));
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: transform 0.3s ease-in-out;

  ${({ side = "right" }) => {
    switch (side) {
      case "top":
        return `
          left: 0;
          right: 0;
          top: 0;
          border-bottom-width: 1px;
          border-bottom-style: solid;
          border-color: hsl(var(--border));
        `;
      case "bottom":
        return `
          left: 0;
          right: 0;
          bottom: 0;
          border-top-width: 1px;
          border-top-style: solid;
          border-color: hsl(var(--border));
        `;
      case "left":
        return `
          top: 0;
          bottom: 0;
          left: 0;
          height: 100%;
          width: 75%;
          max-width: 24rem;
          border-right-width: 1px;
          border-right-style: solid;
          border-color: hsl(var(--border));
        `;
      default:
        return `
          top: 0;
          bottom: 0;
          right: 0;
          height: 100%;
          width: 75%;
          max-width: 24rem;
          border-left-width: 1px;
          border-left-style: solid;
          border-color: hsl(var(--border));
        `;
    }
  }}
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 1rem;
  border-radius: 0.125rem;
  opacity: 0.7;
  padding: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
  &:focus {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }
`;

const SheetHeaderRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`;

const SheetFooterRoot = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const SheetTitleRoot = styled(SheetPrimitive.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
`;

const SheetDescriptionRoot = styled(SheetPrimitive.Description)`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>((props, ref) => <StyledOverlay ref={ref} {...props} />);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: SheetSide;
  }
>(({ side = "right", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <StyledContent ref={ref} side={side} {...props}>
      {children}
      <SheetPrimitive.Close asChild>
        <CloseButton type="button">
          <X style={{ height: 16, width: 16 }} />
          <span className="sr-only">Close</span>
        </CloseButton>
      </SheetPrimitive.Close>
    </StyledContent>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetHeaderRoot {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetFooterRoot {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>((props, ref) => <SheetTitleRoot ref={ref} {...props} />);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>((props, ref) => <SheetDescriptionRoot ref={ref} {...props} />);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
