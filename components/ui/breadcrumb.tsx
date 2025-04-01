import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex flex-wrap items-center text-sm text-muted-foreground", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("inline-flex items-center", className)} {...props} />,
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean
  }
>(({ className, asChild = false, ...props }, ref) => {
  return <a ref={ref} className={cn("hover:text-foreground cursor-pointer", className)} {...props} />
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span role="presentation" aria-hidden="true" className={cn("mx-2 inline-flex items-center", className)} {...props}>
    {children || <ChevronRight className="h-4 w-4" />}
  </span>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator }

