"use client";

import { useState } from "react";
import { safeFileName } from "@/lib/characterTransfer";

interface Props {
  exportUrl: string;
  characterName: string;
  systemSlug: string;
  style?: React.CSSProperties;
}

export function ExportJsonButton({ exportUrl, characterName, systemSlug, style }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error("Erro ao exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFileName(characterName)}.${systemSlug}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: state === "error" ? "#f87171" : "var(--text-muted)",
        fontWeight: 400,
        fontSize: "0.84rem",
        cursor: state === "loading" ? "default" : "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
        ...style,
        ...(state === "error" ? { color: "#f87171" } : null),
      }}
    >
      {state === "loading" ? "Gerando…" : state === "error" ? "Erro ao baixar" : "Baixar JSON"}
    </button>
  );
}
