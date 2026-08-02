"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { styled } from "@/src/shared/utils/emotion";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const StyledSubTrigger = styled(DropdownMenuPrimitive.SubTrigger)<{
  inset?: boolean;
}>`
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.125rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    background-color: hsl(var(--accent));
  }
  &[data-state="open"] {
    background-color: hsl(var(--accent));
  }
  & svg {
    pointer-events: none;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
  ${({ inset }) => inset && "padding-left: 2rem;"}
`;

const StyledSubContent = styled(DropdownMenuPrimitive.SubContent)`
  z-index: 50;
  min-width: 8rem;
  overflow: hidden;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  padding: 0.25rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
`;

const StyledContent = styled(DropdownMenuPrimitive.Content)`
  z-index: 50;
  max-height: var(--radix-dropdown-menu-content-available-height);
  min-width: 8rem;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 0.375rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  padding: 0.25rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const StyledItem = styled(DropdownMenuPrimitive.Item)<{ inset?: boolean }>`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.125rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition:
    background-color 0.15s,
    color 0.15s;

  &:focus {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
  & svg {
    pointer-events: none;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
  ${({ inset }) => inset && "padding-left: 2rem;"}
`;

const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem)`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: 0.125rem;
  padding: 0.375rem 0.5rem 0.375rem 2rem;
  font-size: 0.875rem;
  outline: none;
  transition:
    background-color 0.15s,
    color 0.15s;

  &:focus {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
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

const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem)`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: 0.125rem;
  padding: 0.375rem 0.5rem 0.375rem 2rem;
  font-size: 0.875rem;
  outline: none;
  transition:
    background-color 0.15s,
    color 0.15s;

  &:focus {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const StyledLabel = styled(DropdownMenuPrimitive.Label)<{ inset?: boolean }>`
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  ${({ inset }) => inset && "padding-left: 2rem;"}
`;

const StyledSeparator = styled(DropdownMenuPrimitive.Separator)`
  margin: 0.25rem -0.25rem;
  height: 1px;
  background-color: hsl(var(--muted));
`;

const StyledShortcut = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  opacity: 0.6;
`;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ inset, children, ...props }, ref) => (
  <StyledSubTrigger ref={ref} inset={inset} {...props}>
    {children}
    <ChevronRight style={{ marginLeft: "auto" }} />
  </StyledSubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>((props, ref) => <StyledSubContent ref={ref} {...props} />);
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <StyledContent ref={ref} sideOffset={sideOffset} {...props} />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ inset, ...props }, ref) => (
  <StyledItem ref={ref} inset={inset} {...props} />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ children, checked, ...props }, ref) => (
  <StyledCheckboxItem ref={ref} checked={checked} {...props}>
    <ItemIndicatorWrapper>
      <DropdownMenuPrimitive.ItemIndicator>
        <Check style={{ height: 16, width: 16 }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </ItemIndicatorWrapper>
    {children}
  </StyledCheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ children, ...props }, ref) => (
  <StyledRadioItem ref={ref} {...props}>
    <ItemIndicatorWrapper>
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle style={{ height: 8, width: 8 }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </ItemIndicatorWrapper>
    {children}
  </StyledRadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ inset, ...props }, ref) => (
  <StyledLabel ref={ref} inset={inset} {...props} />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>((props, ref) => <StyledSeparator ref={ref} {...props} />);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = (props: React.HTMLAttributes<HTMLSpanElement>) => (
  <StyledShortcut {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
