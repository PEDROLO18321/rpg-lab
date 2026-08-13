"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OCCUPATIONS } from "@/lib/cthulhu/data";
import { generateInvestigator } from "@/lib/cthulhu/autoGenerate";

interface Props {
  systemId: string;
  onBack: () => void;
}

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

export function AutoGenerateForm({ systemId, onBack }: Props) {
  const router = useRouter();
  const [charName, setCharName] = useState("");
  const [occupationId, setOccupationId] = useState("");
  const [era, setEra] = useState<"1920s" | "modern">("1920s");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const build = generateInvestigator({
        charName: charName.trim() || undefined,
        occupationId: occupationId || undefined,
        era,
      });

      const res = await fetch("/api/cthulhu/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...build, systemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar investigador");
      router.push(`/dashboard/cthulhu/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar investigador");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 8, display: "block",
  };

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

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>Call of Cthulhu · Crie Para Mim</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Geração automática
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: 24 }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
            Call of Cthulhu não usa níveis — o investigador é gerado pronto para jogar, com atributos rolados, ocupação, perícias e equipamento completos.
          </p>

          <div>
            <label style={labelStyle}>Nome (opcional)</label>
            <input
              type="text"
              placeholder="Deixe em branco para sortear"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              disabled={loading}
              maxLength={60}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Ocupação (opcional)</label>
            <select
              value={occupationId}
              onChange={(e) => setOccupationId(e.target.value)}
              disabled={loading}
              style={inputStyle}
            >
              <option value="">Aleatória</option>
              {OCCUPATIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Era</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value as "1920s" | "modern")}
              disabled={loading}
              style={inputStyle}
            >
              <option value="1920s">1920s</option>
              <option value="modern">Era Moderna</option>
            </select>
          </div>

          {error && (
            <p style={{ fontSize: "0.82rem", color: "#f87171" }}>{error}</p>
          )}

          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: "12px 20px",
              background: loading ? "var(--surface-2)" : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
              color: loading ? "var(--text-muted)" : "#06090f",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 0 20px ${ACCENT_DIM}`,
            }}
          >
            {loading ? "Gerando…" : "Gerar Investigador"}
          </button>
        </div>
      </div>
    </div>
  );
}
