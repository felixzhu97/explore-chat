"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const OverlayRoot = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgb(0 0 0 / 0.8);
`;

const ContentRoot = styled(DialogPrimitive.Content)`
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 50;
  display: grid;
  width: 100%;
  max-width: 32rem;
  transform: translate(-50%, -50%);
  gap: 1rem;
  border-radius: var(--radius);
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: hsl(var(--background));
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(15 23 42 / 0.3);
`;

const HeaderRoot = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.375rem;
  text-align: left;
`;

const FooterRoot = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: 0.5rem;
`;

const TitleRoot = styled(DialogPrimitive.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
`;

const DescriptionRoot = styled(DialogPrimitive.Description)`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const CloseButton = styled.button<{ $viewport?: boolean }>`
  position: ${(p) => (p.$viewport ? "fixed" : "absolute")};
  right: ${(p) => (p.$viewport ? "24px" : "1rem")};
  top: ${(p) => (p.$viewport ? "24px" : "1rem")};
  z-index: ${(p) => (p.$viewport ? 51 : "auto")};
  border-radius: 9999px;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  color: ${(p) => (p.$viewport ? "rgb(255 255 255)" : "inherit")};
  cursor: pointer;
  min-width: 32px;
  min-height: 32px;
`;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <OverlayRoot ref={ref} className={className} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    closeInViewport?: boolean;
    hideClose?: boolean;
    accessibleTitle?: string;
  }
>(
  (
    {
      className,
      children,
      closeInViewport,
      hideClose,
      accessibleTitle,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <ContentRoot
        ref={ref}
        className={className}
        {...props}
        aria-describedby={props["aria-describedby"] ?? undefined}
      >
        {accessibleTitle != null && (
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>{accessibleTitle}</DialogPrimitive.Title>
          </VisuallyHidden.Root>
        )}
        {children}
        {!hideClose && (
          <DialogPrimitive.Close asChild>
            <CloseButton type="button" $viewport={closeInViewport}>
              <X size={16} />
              <span className="sr-only">Close</span>
            </CloseButton>
          </DialogPrimitive.Close>
        )}
      </ContentRoot>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeaderRoot className={className} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <FooterRoot className={className} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <TitleRoot ref={ref} className={className} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DescriptionRoot ref={ref} className={className} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
