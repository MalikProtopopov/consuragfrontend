"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  title: string
  description?: string
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep: number
  orientation?: "horizontal" | "vertical"
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    { className, steps, currentStep, orientation = "horizontal", ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "flex-row items-center justify-between"
            : "flex-col gap-0",
          className
        )}
        role="list"
        aria-label="Progress steps"
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-3",
                  orientation === "vertical" && "relative"
                )}
                role="listitem"
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all duration-200",
                    orientation === "horizontal" ? "size-10" : "size-8",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5" strokeWidth={2.5} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step content */}
                <div
                  className={cn(
                    "flex flex-col",
                    orientation === "horizontal" && "hidden sm:flex"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCompleted || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && orientation === "vertical" && (
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  )}
                </div>

                {/* Vertical connector */}
                {orientation === "vertical" && !isLast && (
                  <div
                    className={cn(
                      "absolute left-4 top-10 h-8 w-0.5 -translate-x-1/2",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Horizontal connector */}
              {orientation === "horizontal" && !isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

export interface StepContentProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
  currentStep: number
}

const StepContent = React.forwardRef<HTMLDivElement, StepContentProps>(
  ({ className, step, currentStep, children, ...props }, ref) => {
    if (step !== currentStep) return null

    return (
      <div
        ref={ref}
        className={cn("animate-fade-up", className)}
        role="tabpanel"
        aria-label={`Step ${step + 1} content`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StepContent.displayName = "StepContent"

export { Stepper, StepContent }

