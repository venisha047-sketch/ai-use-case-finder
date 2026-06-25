"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fafafa",
          color: "#111",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <AlertTriangle style={{ width: 24, height: 24, color: "#dc2626" }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Critical error
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 360, marginBottom: 24 }}>
          The application encountered a fatal error and could not recover.
          {error.digest && (
            <>
              {" "}
              <span style={{ fontFamily: "monospace", opacity: 0.6 }}>
                ({error.digest})
              </span>
            </>
          )}
        </p>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw style={{ width: 16, height: 16 }} />
          Reload page
        </button>
      </body>
    </html>
  );
}
