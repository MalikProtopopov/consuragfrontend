"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

const trendVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
  {
    variants: {
      trend: {
        up: "text-success bg-success/10",
        down: "text-destructive bg-destructive/10",
        neutral: "text-muted-foreground bg-muted",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
)

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendVariants> {
  title: string
  value: string | number
  icon?: React.ReactNode
  trendValue?: string
  trendLabel?: string
  description?: string
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      className,
      title,
      value,
      icon,
      trend = "neutral",
      trendValue,
      trendLabel,
      description,
      ...props
    },
    ref
  ) => {
    const TrendIcon =
      trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus

    return (
      <Card ref={ref} className={cn("card-hover", className)} {...props}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </div>
            {icon && (
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                {icon}
              </div>
            )}
          </div>
          {(trendValue || description) && (
            <div className="mt-4 flex items-center gap-2">
              {trendValue && (
                <span className={cn(trendVariants({ trend }))}>
                  <TrendIcon className="size-3" />
                  {trendValue}
                </span>
              )}
              {(trendLabel || description) && (
                <span className="text-xs text-muted-foreground">
                  {trendLabel || description}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard, trendVariants }

