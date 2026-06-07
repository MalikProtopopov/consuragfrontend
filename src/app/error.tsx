"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * Route-level error boundary (S-03). Ловит рантайм-ошибки сегментов и показывает
 * понятный экран с действиями вместо белого экрана.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-error">$ unexpected_error</p>
      <h1 className="mt-3 text-2xl font-semibold text-text-primary">Что-то пошло не так</h1>
      <p className="mt-2 max-w-md text-text-secondary">
        Произошла ошибка при загрузке страницы. Попробуйте обновить — если повторяется, вернитесь
        на главную и попробуйте позже.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Повторить
        </Button>
        <Button variant="outline" asChild>
          <Link href="/projects">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
