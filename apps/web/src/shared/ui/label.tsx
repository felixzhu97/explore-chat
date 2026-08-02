"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { styled } from "@/src/shared/utils/emotion";

const LabelRoot = styled(LabelPrimitive.Root)`
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;

  .peer:disabled + &,
  .peer[aria-disabled="true"] + & {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelRoot ref={ref} className={className} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
