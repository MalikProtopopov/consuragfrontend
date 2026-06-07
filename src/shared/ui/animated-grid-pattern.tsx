"use client";

/**
 * AnimatedGridPattern
 * Адаптация magicui Animated Grid Pattern (dillionverma) на пакет `motion`.
 * Источник: https://21st.dev/r/dillionverma/animated-grid-pattern (magicui.design).
 *
 * Отличия от оригинала (адаптация под наши токены, UI_REDESIGN_PLAN T-3.3/T-3.4):
 *  - цвет сетки → var(--border) (тонкая техно-сетка);
 *  - вспышки квадратов → var(--primary-ring) с opacity /10 (мягкие);
 *  - prefers-reduced-motion → статичная сетка без вспышек (useReducedMotion);
 *  - грузится через next/dynamic({ ssr:false }) на стороне потребителя.
 */

import * as React from "react";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/shared/lib";

export interface AnimatedGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 30,
  maxOpacity = 0.1,
  duration = 4,
  className,
  ...props
}: AnimatedGridPatternProps) {
  const id = React.useId();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = React.useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  const getPos = React.useCallback(
    (dims: { width: number; height: number }) => [
      Math.floor((Math.random() * dims.width) / width),
      Math.floor((Math.random() * dims.height) / height),
    ],
    [width, height],
  );

  const generateSquares = React.useCallback(
    (count: number, dims: { width: number; height: number }) =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(dims),
      })),
    [getPos],
  );

  const [squares, setSquares] = React.useState<{ id: number; pos: number[] }[]>([]);

  React.useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions));
    }
  }, [dimensions, numSquares, generateSquares]);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const updateSquarePosition = (squareId: number) => {
    if (prefersReducedMotion) return;
    setSquares((current) =>
      current.map((sq) =>
        sq.id === squareId ? { ...sq, pos: getPos(dimensions) } : sq,
      ),
    );
  };

  return (
    <svg
      ref={containerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-[var(--border)]/30 stroke-[var(--border)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />

      {/* Вспышки квадратов — только если reduced-motion НЕ включён */}
      {!prefersReducedMotion && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(({ pos: [px, py], id: squareId }, index) => (
            <motion.rect
              key={`${px}-${py}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: maxOpacity }}
              transition={{
                duration,
                repeat: Infinity,
                delay: index * 0.1,
                repeatType: "reverse",
              }}
              onAnimationComplete={() => updateSquarePosition(squareId)}
              width={width - 1}
              height={height - 1}
              x={(px ?? 0) * width + 1}
              y={(py ?? 0) * height + 1}
              fill="var(--primary-ring)"
              strokeWidth="0"
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
