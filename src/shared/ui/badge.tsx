import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/shared/lib";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        // Default - Primary brand
        default: "border-transparent bg-primary text-primary-foreground",
        // Secondary - Neutral
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        // Destructive / Error
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        // Outline - Border only
        outline: "border-border text-foreground bg-transparent",
        // Success - Positive states
        success: "border-transparent bg-success text-success-foreground",
        // Warning - Caution states
        warning: "border-transparent bg-warning text-warning-foreground",
        // Info - Informational
        info: "border-transparent bg-info text-info-foreground",
        // Status variants - for document/avatar pipeline states
        active: "border-transparent bg-status-active text-white",
        draft: "border-transparent bg-status-draft text-white",
        processing: "border-transparent bg-status-processing text-white",
        failed: "border-transparent bg-status-failed text-white",
        // Subtle variants - lighter backgrounds
        "success-subtle": "border-success/20 bg-success/10 text-success dark:bg-success/20",
        "warning-subtle": "border-warning/20 bg-warning/10 text-warning dark:bg-warning/20",
        "error-subtle":
          "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20",
        "info-subtle": "border-info/20 bg-info/10 text-info dark:bg-info/20",
        "primary-subtle": "border-primary/20 bg-primary/10 text-primary dark:bg-primary/20",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
