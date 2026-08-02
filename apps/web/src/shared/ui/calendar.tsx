"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { Button } from "@/shared/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: defaultClassNames.root,
        months: defaultClassNames.months,
        month: defaultClassNames.month,
        nav: defaultClassNames.nav,
        button_previous: defaultClassNames.button_previous,
        button_next: defaultClassNames.button_next,
        month_caption: defaultClassNames.month_caption,
        dropdowns: defaultClassNames.dropdowns,
        dropdown_root: defaultClassNames.dropdown_root,
        dropdown: defaultClassNames.dropdown,
        caption_label: defaultClassNames.caption_label,
        month_grid: defaultClassNames.month_grid,
        weekdays: defaultClassNames.weekdays,
        weekday: defaultClassNames.weekday,
        week: defaultClassNames.week,
        week_number_header: defaultClassNames.week_number_header,
        week_number: defaultClassNames.week_number,
        day: defaultClassNames.day,
        range_start: defaultClassNames.range_start,
        range_middle: defaultClassNames.range_middle,
        range_end: defaultClassNames.range_end,
        today: defaultClassNames.today,
        outside: defaultClassNames.outside,
        disabled: defaultClassNames.disabled,
        hidden: defaultClassNames.hidden,
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={className}
            {...rootProps}
          />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => {
          const iconClass = ["size-4", className].filter(Boolean).join(" ");
          if (orientation === "left") {
            return <ChevronLeftIcon className={iconClass} {...chevronProps} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={iconClass} {...chevronProps} />;
          }
          return <ChevronDownIcon className={iconClass} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekProps }) => (
          <td {...weekProps}>
            <div>{children}</div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={[defaultClassNames.day, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
