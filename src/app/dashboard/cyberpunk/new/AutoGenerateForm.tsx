"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, type RoleKey } from "@/lib/cyberpunk/data";
import { generateEdgerunner, type CreationMethod } from "@/lib/cyberpunk/autoGenerate";
import { Field } from "@/components/ui/Field";

interface Props {
  onBack: () => void;
}

const ACCENT       = "#a855f7";
const ACCENT_LIGHT = "#c084fc";
const ACCENT_DIM   = "rgba(168,85,247,0.14)";
const ACCENT_BORD  = "rgba(168,85,247,0.3)";

export function AutoGenerateForm({ onBack }: Props) {
  const router = useRouter();
  const [charName, setCharName] = useState("");
  const [role, setRole] = useState<RoleKey | "">("");
  const [method, setMethod] = useState<CreationMethod>("streetrat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const build = generateEdgerunner({
        name: charName.trim() || undefined,
        role: role || undefined,
        method,
      });

      const res = await fetch("/api/cyberpunk/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(build),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar edgerunner");
      router.push(`/dashboard/cyberpunk/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar edgerunner");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", minHeight: 40, background: "var(--surface-2)",
    border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)",
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
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
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: loading ? "default" : "pointer", marginBottom: 20, padding: "4px 0", minHeight: 28 }}
        >
          ← Voltar
        </button>

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>Cyberpunk RED · Crie Para Mim</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Geração automática
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: 24 }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
            O edgerunner nasce pronto para jogar: atributos sorteados, pacote de perícias do papel, caminho de vida e o kit inicial com ciberware.
          </p>

          <div>
            <Field label="Nome (opcional)" style={labelStyle}>
              <input type="text" placeholder="Deixe em branco para sortear" value={charName} onChange={(e) => setCharName(e.target.value)} disabled={loading} maxLength={60} style={inputStyle} />
            </Field>
          </div>

          <div>
            <Field label="Papel (opcional)" style={labelStyle}>
              <select value={role} onChange={(e) => setRole(e.target.value as RoleKey | "")} disabled={loading} style={inputStyle}>
                <option value="">Aleatório</option>
                {ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <Field label="Método de atributos" style={labelStyle}>
              <select value={method} onChange={(e) => setMethod(e.target.value as CreationMethod)} disabled={loading} style={inputStyle}>
                <option value="streetrat">Streetrat — uma linha inteira da tabela</option>
                <option value="edgerunner">Edgerunner — um d10 por atributo</option>
              </select>
            </Field>
          </div>

          {error && <p style={{ fontSize: "0.82rem", color: "#f87171" }}>{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: "12px 20px", minHeight: 44,
              background: loading ? "var(--surface-2)" : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
              color: loading ? "var(--text-muted)" : "#0b0614", border: "none", borderRadius: "var(--radius)",
              fontSize: "0.92rem", fontWeight: 700, cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 0 20px ${ACCENT_DIM}`,
            }}
          >
            {loading ? "Gerando…" : "Gerar Edgerunner"}
          </button>
        </div>
      </div>
    </div>
  );
}
