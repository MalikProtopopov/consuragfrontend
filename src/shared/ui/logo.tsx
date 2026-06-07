import Link from "next/link";

import { cn } from "@/shared/lib";

const sizeConfig = {
  sm: { box: "size-8 rounded-lg text-sm", text: "text-sm" },
  md: { box: "size-10 rounded-xl text-base", text: "text-base" },
  lg: { box: "size-16 rounded-2xl text-2xl", text: "text-xl" },
} as const;

export interface LogoProps {
  /** Размер знака */
  size?: keyof typeof sizeConfig;
  /** Показывать имя бренда рядом со знаком */
  withText?: boolean;
  /** Обернуть в ссылку (по умолчанию — без ссылки) */
  href?: string;
  className?: string;
}

/** Имя бренда — единственный источник правды */
export const BRAND_NAME = "Avatar AI";

/**
 * Бренд-знак: терминальный промпт `>_` на кислотном градиенте.
 * Курсор мигает (отключается prefers-reduced-motion).
 */
export function Logo({ size = "md", withText = false, href, className }: LogoProps) {
  const cfg = sizeConfig[size];

  const mark = (
    <span
      className={cn(
        "bg-gradient-primary text-primary-foreground flex shrink-0 items-center justify-center font-mono font-bold tracking-tighter select-none",
        cfg.box,
      )}
      aria-hidden="true"
    >
      <span>&gt;</span>
      <span className="animate-cursor-blink motion-reduce:animate-none">_</span>
    </span>
  );

  const content = withText ? (
    <span className={cn("flex items-center gap-3", className)}>
      {mark}
      <span className={cn("font-mono font-semibold tracking-tight", cfg.text)}>{BRAND_NAME}</span>
    </span>
  ) : (
    <span className={cn("inline-flex", className)}>{mark}</span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={BRAND_NAME}>
        {content}
      </Link>
    );
  }

  return content;
}
