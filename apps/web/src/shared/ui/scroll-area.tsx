"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { styled } from "@/src/shared/utils/emotion";

const Root = styled(ScrollAreaPrimitive.Root)`
  position: relative;
  overflow: hidden;
`;

const Viewport = styled(ScrollAreaPrimitive.Viewport)`
  height: 100%;
  width: 100%;
  border-radius: inherit;
`;

const Thumb = styled(ScrollAreaPrimitive.ScrollAreaThumb)`
  position: relative;
  flex: 1;
  border-radius: 9999px;
  background-color: hsl(var(--border));
`;

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ children, ...props }, ref) => (
  <Root ref={ref} {...props}>
    <Viewport>{children}</Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={className}
    {...props}
  >
    <Thumb />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
