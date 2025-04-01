"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    type?: "auto" | "always" | "scroll" | "hover"
    hideScrollbar?: boolean
    orientation?: "vertical" | "horizontal" | "both"
    scrollbarClassName?: string
  }
>(
  (
    { className, children, type = "always", hideScrollbar = false, orientation = "both", scrollbarClassName, ...props },
    ref,
  ) => (
    <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} type={type} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>

      {!hideScrollbar && (orientation === "vertical" || orientation === "both") && (
        <ScrollBar orientation="vertical" className={scrollbarClassName} />
      )}

      {!hideScrollbar && (orientation === "horizontal" || orientation === "both") && (
        <ScrollBar orientation="horizontal" className={scrollbarClassName} />
      )}

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
)
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && [
        "h-full w-6 border-l border-l-transparent p-[3px]",
        "right-0 top-0 bottom-0 z-50", // Ensure it's always on top
      ],
      orientation === "horizontal" && [
        "h-6 border-t border-t-transparent p-[3px]",
        "bottom-0 left-0 right-0 z-50", // Ensure it's always on top
      ],
      className,
    )}
    style={{
      // Force the scrollbar to be visible
      visibility: "visible",
      opacity: 1,
    }}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative flex-1 rounded-full",
        "bg-primary/50 hover:bg-primary/70 active:bg-primary/90", // Use primary color for better visibility
        "min-h-[60px]", // Larger minimum height
        "min-w-[8px]", // Minimum width for vertical scrollbar
        "border border-background", // Add border for better contrast
        "transition-colors duration-150 ease-in-out",
      )}
      style={{
        // Force the thumb to be visible
        visibility: "visible",
        opacity: 1,
      }}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

