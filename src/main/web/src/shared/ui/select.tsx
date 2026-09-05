"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const StyledTrigger = styled(SelectPrimitive.Trigger)`
  display: flex;
  height: 2.5rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--input));
  background-color: hsl(var(--background));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    box-shadow:
      0 0 0 2px hsl(var(--ring)),
      0 0 0 4px hsl(var(--background));
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &[data-placeholder] {
    color: hsl(var(--muted-foreground));
  }
  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledScrollUpButton = styled(SelectPrimitive.ScrollUpButton)`
  display: flex;
  cursor: default;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
`;

const StyledScrollDownButton = styled(SelectPrimitive.ScrollDownButton)`
  display: flex;
  cursor: default;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
`;

const StyledContent = styled(SelectPrimitive.Content)`
  position: relative;
  z-index: 50;
  max-height: var(--radix-select-content-available-height);
  min-width: 8rem;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const StyledViewport = styled(SelectPrimitive.Viewport)`
  padding: 0.25rem;
`;

const StyledLabel = styled(SelectPrimitive.Label)`
  padding: 0.375rem 0.5rem 0.375rem 2rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ItemIndicatorWrapper = styled.span`
  position: absolute;
  left: 0.5rem;
  display: flex;
  height: 0.875rem;
  width: 0.875rem;
  align-items: center;
  justify-content: center;
`;

const StyledItem = styled(SelectPrimitive.Item)`
  position: relative;
  display: flex;
  width: 100%;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: 0.125rem;
  padding: 0.375rem 0.5rem 0.375rem 2rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const StyledSeparator = styled(SelectPrimitive.Separator)`
  margin: 0.25rem -0.25rem;
  height: 1px;
  background-color: hsl(var(--muted));
`;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <StyledTrigger ref={ref} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ width: 16, height: 16, opacity: 0.5 }} />
    </SelectPrimitive.Icon>
  </StyledTrigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>((props, ref) => (
  <StyledScrollUpButton ref={ref} {...props}>
    <ChevronUp style={{ width: 16, height: 16 }} />
  </StyledScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>((props, ref) => (
  <StyledScrollDownButton ref={ref} {...props}>
    <ChevronDown style={{ width: 16, height: 16 }} />
  </StyledScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <StyledContent ref={ref} position={position} {...props}>
      <SelectScrollUpButton />
      <StyledViewport>{children}</StyledViewport>
      <SelectScrollDownButton />
    </StyledContent>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>((props, ref) => <StyledLabel ref={ref} {...props} />);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ children, ...props }, ref) => (
  <StyledItem ref={ref} {...props}>
    <ItemIndicatorWrapper>
      <SelectPrimitive.ItemIndicator>
        <Check style={{ width: 16, height: 16 }} />
      </SelectPrimitive.ItemIndicator>
    </ItemIndicatorWrapper>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </StyledItem>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>((props, ref) => <StyledSeparator ref={ref} {...props} />);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
