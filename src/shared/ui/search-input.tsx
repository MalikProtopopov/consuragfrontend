"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/shared/lib";

import { Input } from "./input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Поисковая строка для списков (N-02): иконка-лупа + поле + кнопка очистки.
 * Контролируемая (value/onChange) — фильтрация на стороне вызывающего.
 */
export function SearchInput({ value, onChange, placeholder = "Поиск…", className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Очистить поиск"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
