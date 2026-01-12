"use client";

import { ShieldX } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import Link from "next/link";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function AccessDenied({
  title = "Доступ запрещён",
  message = "У вас нет прав для просмотра этой страницы. Обратитесь к администратору проекта для получения доступа.",
  showBackButton = true,
  backHref = "/projects",
}: AccessDeniedProps) {
  return (
    <Card className="border-warning/20 bg-warning/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-warning/10 mb-4">
          <ShieldX className="size-8 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-muted max-w-md mb-6">{message}</p>
        {showBackButton && (
          <Button asChild variant="outline">
            <Link href={backHref}>Вернуться к проектам</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Check if error is a 403 permission error
 */
export function isPermissionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  
  const apiError = error as { status?: number; error?: { code?: string } };
  
  // Check HTTP status
  if (apiError.status === 403) return true;
  
  // Check error codes
  const code = apiError.error?.code;
  return code === "MEMBER_INSUFFICIENT_PERMISSIONS" || code === "PERMISSION_DENIED";
}

