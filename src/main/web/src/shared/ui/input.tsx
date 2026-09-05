import * as React from "react";

import { styled } from "@/src/shared/utils/emotion";

const StyledInput = styled.input`
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: calc(var(--radius) - 2px);
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--input));
  background-color: hsl(var(--background));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;

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

  &::file-selector-button {
    border: 0;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
    margin-right: 0.5rem;
  }
`;

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ type, ...props }, ref) => {
    return <StyledInput type={type} ref={ref} {...props} />;
  },
);
Input.displayName = "Input";

export { Input };
