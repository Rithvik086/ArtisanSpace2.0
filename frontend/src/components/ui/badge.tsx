import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "destructive"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
  const variants: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    secondary: "bg-secondary/10 text-secondary",
    destructive: "bg-red-100 text-red-700",
  }

  return <span className={cn(base, variants[variant] ?? variants.default, className)} {...props} />
}

export default Badge
