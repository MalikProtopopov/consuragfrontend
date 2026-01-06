"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  children: React.ReactNode;
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, currentStep, children, ...props }, ref) => {
    const steps = React.Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-4", className)}
        {...props}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {step}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-border mt-5 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);
Stepper.displayName = "Stepper";

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, title, description, isCompleted, isCurrent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center text-center min-w-[100px]", className)}
        {...props}
      >
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
            isCompleted
              ? "border-accent-primary bg-accent-primary text-accent-contrast"
              : isCurrent
              ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
              : "border-border bg-bg-secondary text-text-muted"
          )}
        >
          {isCompleted ? (
            <Check className="size-5" />
          ) : (
            <span className="text-sm font-medium">
              {React.Children.count(props.children) || ""}
            </span>
          )}
        </div>
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            isCurrent ? "text-text-primary" : "text-text-muted"
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
    );
  }
);
StepperItem.displayName = "StepperItem";

export { Stepper, StepperItem };
