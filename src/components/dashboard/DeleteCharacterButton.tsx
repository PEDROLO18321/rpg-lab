"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  characterId: string;
  characterName: string;
}

export function DeleteCharacterButton({ characterId, characterName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/dnd/characters/${characterId}`, { method: "DELETE" });
      router.push("/dashboard/dnd");
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "12px 14px",
        }}
      >
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
          Excluir <strong style={{ color: "var(--text)" }}>{characterName}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              flex: 1,
              padding: "7px 12px",
              background: "#ef4444",
              border: "none",
              borderRadius: "var(--radius)",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Excluindo…" : "Confirmar"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              flex: 1,
              padding: "7px 12px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        width: "100%",
        padding: "8px 14px",
        background: "transparent",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "var(--radius)",
        color: "#f87171",
        fontSize: "0.76rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        textAlign: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(239,68,68,0.08)";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
      }}
    >
      Excluir personagem
    </button>
  );
}
