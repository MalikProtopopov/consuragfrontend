import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        // Primary - Main CTAs, uses brand color (Hot Pink #FF006E)
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98]",
        // Secondary - Less emphasis, outlined style
        secondary:
          "bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-secondary/80 hover:scale-[1.01] active:scale-[0.98]",
        // Ghost - Minimal chrome, transparent background
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        // Destructive - Dangerous actions
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-destructive",
        // Outline - Border only
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] active:scale-[0.98]",
        // Link - Looks like a hyperlink
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        // Success - Positive actions
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-success",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs gap-1.5 has-[>svg]:px-2",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-11 rounded-md px-6 text-base has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    // When asChild is true, pass children directly without wrapping
    // Icons and loading states are not supported with asChild
    if (asChild) {
      return (
        <Comp
          ref={ref}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
