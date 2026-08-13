"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLASSES } from "@/lib/dnd/classes";
import { MAX_LEVEL } from "@/lib/dnd/leveling";

interface Props {
  userId: string;
  systemId: string;
  onBack: () => void;
}

export function AutoGenerateForm({ userId, systemId, onBack }: Props) {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [charName, setCharName] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dnd/characters/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, systemId, level,
          charName: charName.trim() || undefined,
          classId: classId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar personagem");
      router.push(`/dashboard/dnd/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar personagem");
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

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>D&D 5e · Crie Para Mim</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Geração automática
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", padding: 24 }}>
          <div>
            <label style={labelStyle}>Nível (obrigatório)</label>
            <input
              type="number"
              min={1}
              max={MAX_LEVEL}
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(MAX_LEVEL, Number(e.target.value) || 1)))}
              disabled={loading}
              style={inputStyle}
            />
          </div>

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
            <label style={labelStyle}>Classe (opcional)</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={loading}
              style={inputStyle}
            >
              <option value="">Aleatória</option>
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
              background: loading ? "var(--surface-2)" : "linear-gradient(135deg, #e8b84bee 0%, #c9941f 100%)",
              color: loading ? "var(--text-muted)" : "#06090f",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Gerando… pode levar alguns segundos em níveis altos." : "Gerar Personagem"}
          </button>
        </div>
      </div>
    </div>
  );
}
