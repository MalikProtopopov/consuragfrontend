import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex size-20 items-center justify-center rounded-full bg-bg-secondary">
            <FileQuestion className="size-10 text-text-muted" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-text-primary mb-3">404</h1>
        <h2 className="text-xl font-semibold text-text-secondary mb-4">
          Страница не найдена
        </h2>
        <p className="text-text-muted mb-8">
          К сожалению, запрошенная страница не существует или была удалена.
        </p>
        
        <Link
          href="/projects"
          className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-6 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-primary/90"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

