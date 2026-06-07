"use client";

/**
 * Global error boundary (S-03) — ловит ошибки корневого layout. Рендерит
 * собственные html/body (заменяет упавший layout), поэтому без внешних стилей-зависимостей.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          background: "#ffffff",
          color: "#0a0a0b",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#c41e3a", fontSize: 14 }}>$ fatal_error</p>
        <h1 style={{ fontSize: 24, margin: "12px 0 8px" }}>Приложение не загрузилось</h1>
        <p style={{ color: "#52525b", maxWidth: 460 }}>
          Произошла критическая ошибка. Обновите страницу — если повторяется, попробуйте позже.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #9fff5b 0%, #5bff8f 100%)",
            color: "#0a0a0b",
            fontWeight: 600,
          }}
        >
          Перезагрузить
        </button>
        {error?.digest && (
          <p style={{ color: "#a1a1aa", fontSize: 12, marginTop: 16 }}>код: {error.digest}</p>
        )}
      </body>
    </html>
  );
}
