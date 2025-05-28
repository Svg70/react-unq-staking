"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("st-p-3", className)}
      classNames={{
          months: "st-flex st-flex-col sm:st-flex-row st-space-y-4 sm:st-space-x-4 sm:st-space-y-0",
          month: "st-space-y-4",
          caption: "st-flex st-justify-center st-pt-1 st-relative st-items-center",
          caption_label: "st-text-sm st-font-medium",
          nav: "st-space-x-1 st-flex st-items-center",
          nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "st-h-7 st-w-7 st-bg-transparent st-p-0 st-opacity-50 st-hover:st-opacity-100"
          ),
          nav_button_previous: "st-absolute st-left-1",
          nav_button_next: "st-absolute st-right-1",
          table: "st-w-full st-border-collapse st-space-y-1",
          head_row: "st-flex",
          head_cell:
              "st-text-muted-foreground st-rounded-md st-w-9 st-font-normal st-text-[0.8rem]",
          row: "st-flex st-w-full st-mt-2",
          cell: "st-h-9 st-w-9 st-text-center st-text-sm st-p-0 st-relative [&:has([aria-selected].day-range-end)]:st-rounded-r-md [&:has([aria-selected].day-outside)]:st-bg-accent/50 [&:has([aria-selected])]:st-bg-accent first:[&:has([aria-selected])]:st-rounded-l-md last:[&:has([aria-selected])]:st-rounded-r-md st-focus-within:st-relative st-focus-within:st-z-20",
          day: cn(
              buttonVariants({ variant: "ghost" }),
              "st-h-9 st-w-9 st-p-0 st-font-normal aria-selected:st-opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
              "st-bg-primary st-text-primary-foreground st-hover:bg-primary st-hover:text-primary-foreground st-focus:bg-primary st-focus:text-primary-foreground",
          day_today: "st-bg-accent st-text-accent-foreground",
          day_outside:
              "day-outside st-text-muted-foreground aria-selected:st-bg-accent/50 aria-selected:st-text-muted-foreground",
          day_disabled: "st-text-muted-foreground st-opacity-50",
          day_range_middle:
              "aria-selected:st-bg-accent aria-selected:st-text-accent-foreground",
          day_hidden: "st-invisible",
          ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="st-h-4 st-w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="st-h-4 st-w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
