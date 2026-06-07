"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/shared/lib";

export type AvatarIdentitySize = "sm" | "md" | "lg";

export interface AvatarIdentityProps {
  /** Avatar name — source for initials and deterministic fallback color. */
  name: string;
  /** Explicit color (avatar `primary_color` from API). Overrides the deterministic palette. */
  color?: string | null;
  /** Avatar image URL (avatar `avatar_image_url` from API). Highest priority when present. */
  imageUrl?: string | null;
  /** Visual size. Defaults to `md`. */
  size?: AvatarIdentitySize;
  className?: string;
}

/**
 * Deterministic, token-compatible pastel backgrounds. Dark text on light
 * pastel ensures contrast on the light techno theme.
 */
const FALLBACK_PALETTE = [
  { bg: "#DCF7E3", fg: "#0E5A2B" }, // mint
  { bg: "#DBEAFE", fg: "#1E3A8A" }, // blue
  { bg: "#FCE7F3", fg: "#9D174D" }, // pink
  { bg: "#FEF3C7", fg: "#92400E" }, // amber
  { bg: "#EDE9FE", fg: "#5B21B6" }, // violet
  { bg: "#CCFBF1", fg: "#115E59" }, // teal
  { bg: "#FFE4E6", fg: "#9F1239" }, // rose
  { bg: "#E0E7FF", fg: "#3730A3" }, // indigo
] as const;

const sizeConfig: Record<
  AvatarIdentitySize,
  { box: string; text: string; image: number }
> = {
  sm: { box: "size-8", text: "text-xs", image: 32 },
  md: { box: "size-12", text: "text-base", image: 48 },
  lg: { box: "size-16", text: "text-2xl", image: 64 },
};

/** Stable string hash (djb2-ish) → palette index. */
function hashToIndex(value: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash) % modulo;
}

/** 1–2 uppercase letters from the name (first letters of up to two words). */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "?";
  const second = words[1];
  if (!second) {
    return first.slice(0, 2).toUpperCase();
  }
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

export function AvatarIdentity({
  name,
  color,
  imageUrl,
  size = "md",
  className,
}: AvatarIdentityProps) {
  const { box, text, image } = sizeConfig[size];

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg",
          box,
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={image}
          height={image}
          className="size-full object-cover"
        />
      </div>
    );
  }

  const initials = getInitials(name);
  const palette =
    FALLBACK_PALETTE[hashToIndex(name, FALLBACK_PALETTE.length)] ??
    FALLBACK_PALETTE[0];

  // primary_color, when present, drives the background; text stays dark for contrast.
  const style: React.CSSProperties = color
    ? { backgroundColor: `${color}26`, color: "var(--color-text-primary)" }
    : { backgroundColor: palette.bg, color: palette.fg };

  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-lg font-mono font-semibold uppercase leading-none",
        box,
        text,
        className
      )}
      style={style}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
