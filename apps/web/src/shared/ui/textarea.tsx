import * as React from "react";

import { styled } from "@/src/shared/utils/emotion";

const StyledTextarea = styled.textarea`
  display: flex;
  min-height: 80px;
  width: 100%;
  border-radius: calc(var(--radius) - 2px);
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--input));
  background-color: hsl(var(--background));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  resize: vertical;

  &::placeholder {
    color: hsl(var(--muted-foreground));
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>((props, ref) => {
  return <StyledTextarea ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";

export { Textarea };
