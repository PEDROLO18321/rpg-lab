"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  systemId: string;
  systemLabel: string;
  expectedFormat: string;
  importUrl: string;
  redirectBase: string; // e.g. "/dashboard/dnd"
  accent: string;
  onBack: () => void;
}

export function ImportJsonForm({ systemId, systemLabel, expectedFormat, importUrl, redirectBase, accent, onBack }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPayload(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json?.format !== expectedFormat) {
        setError(`Este arquivo não é uma ficha de ${systemLabel} exportada por este site.`);
        return;
      }
      if (!json.character?.name || typeof json.character.name !== "string") {
        setError("Arquivo incompleto: nome do personagem ausente.");
        return;
      }
      setPayload(json);
    } catch {
      setError("Arquivo inválido — não é um JSON legível.");
    }
  }

  async function handleImport() {
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(importUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId, payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao importar personagem");
      router.push(`${redirectBase}/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar personagem");
      setLoading(false);
    }
  }

  const accentDim = `${accent}1f`;
  const accentBorder = `${accent}59`;
  // Contraste automático: acentos muito claros (ex.: branco da Ordem Paranormal) usam texto escuro no botão.
  const r = parseInt(accent.slice(1, 3), 16) || 0;
  const g = parseInt(accent.slice(3, 5), 16) || 0;
  const b = parseInt(accent.slice(5, 7), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const onAccentText = luminance > 0.6 ? "#0a0a0a" : "#fff";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: loading ? "default" : "pointer", marginBottom: 20, padding: 0 }}
        >
          ← Voltar
        </button>

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>{systemLabel} · Importar JSON</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Importar personagem
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: `1px solid ${accentBorder}`, borderRadius: "var(--radius-xl)", padding: 24 }}>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 8, display: "block" }}>
              Arquivo JSON
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              disabled={loading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontSize: "0.86rem",
                boxSizing: "border-box",
              }}
            />
            {fileName && !error && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 8 }}>
                {payload ? `✓ ${fileName} pronto para importar.` : `Lendo ${fileName}…`}
              </p>
            )}
          </div>

          {payload && (
            <div style={{ fontSize: "0.84rem", color: "var(--text)", background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "10px 14px" }}>
              Personagem: <strong>{(payload.character as { name?: string })?.name}</strong>
            </div>
          )}

          {error && (
            <p style={{ fontSize: "0.82rem", color: "#f87171" }}>{error}</p>
          )}

          <button
            onClick={handleImport}
            disabled={loading || !payload}
            style={{
              padding: "12px 20px",
              background: loading || !payload ? "var(--surface-2)" : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
              color: loading || !payload ? "var(--text-muted)" : onAccentText,
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: loading || !payload ? "default" : "pointer",
              boxShadow: loading || !payload ? "none" : `0 0 20px ${accentDim}`,
            }}
          >
            {loading ? "Importando…" : "Importar Personagem"}
          </button>
        </div>
      </div>
    </div>
  );
}
