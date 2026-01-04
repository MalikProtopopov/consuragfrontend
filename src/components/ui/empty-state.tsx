"use client"

import * as React from "react"
import { FileQuestion, FolderOpen, Inbox, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyStateIcons: Record<string, React.ElementType> = {
  inbox: Inbox,
  folder: FolderOpen,
  search: Search,
  users: Users,
  file: FileQuestion,
}

type IconName = "inbox" | "folder" | "search" | "users" | "file"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName | React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, icon = "inbox", title, description, action, children, ...props },
    ref
  ) => {
    const Icon =
      typeof icon === "string" && icon in emptyStateIcons
        ? emptyStateIcons[icon]
        : null

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        {...props}
      >
        <div className="mb-4 rounded-full bg-muted p-4">
          {typeof icon === "string" && Icon ? (
            <Icon className="size-8 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            icon
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
        {children}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }

