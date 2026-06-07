import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/shared/lib";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        // Default - Primary brand (acid green, black text)
        default: "border-transparent bg-primary text-primary-foreground font-mono",
        // Secondary - Neutral, uses mono font for tag-like appearance
        secondary: "border-transparent bg-muted text-muted-foreground font-mono",
        // Destructive / Error
        destructive: "border-transparent bg-destructive text-destructive-foreground font-mono",
        // Outline - Border only with brand color option
        outline: "border-border text-foreground bg-transparent font-mono",
        "outline-primary": "border-primary text-primary-link bg-transparent font-mono",
        // Burgundy - Premium accent
        burgundy: "border-transparent bg-[var(--burgundy)] text-white font-mono",
        // Success - Positive states (darker fill for white-text contrast)
        success: "border-transparent bg-success-strong text-white font-mono",
        // Warning - Caution states (dark text on amber for contrast)
        warning: "border-transparent bg-warning text-[#0A0A0B] font-mono",
        // Info - Informational
        info: "border-transparent bg-info text-white font-mono",
        // Status variants - for document/avatar pipeline states
        active: "border-transparent bg-success-strong text-white font-mono",
        draft: "border-transparent bg-status-draft text-white font-mono",
        processing: "border-transparent bg-status-processing text-white font-mono",
        failed: "border-transparent bg-status-failed text-white font-mono",
        // Subtle variants - lighter backgrounds
        "success-subtle": "border-success/20 bg-success/10 text-success",
        "warning-subtle": "border-warning/20 bg-warning/10 text-warning",
        "error-subtle":
          "border-destructive/20 bg-destructive/10 text-destructive",
        "info-subtle": "border-info/20 bg-info/10 text-info",
        "primary-subtle": "border-primary/20 bg-primary/10 text-primary-link",
        // Tag variant - for F0 design system tags (mono font, muted colors)
        tag: "border-transparent bg-muted text-muted-foreground font-mono rounded-md",
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
