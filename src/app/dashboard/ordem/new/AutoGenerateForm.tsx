"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLASSES, NEX_VALUES, computeVitals, computeDefense, type ClassId } from "@/lib/ordem/data";
import { emptyProgression } from "@/lib/ordem/leveling";
import { generateLevel1Build, pickNexUpgrade, type OrdemSnapshot } from "@/lib/ordem/autoGenerate";

interface Props {
  systemId: string;
  onBack: () => void;
}

const ACCENT      = "#ffffff";
const ACCENT_DIM  = "rgba(255,255,255,0.14)";
const ACCENT_BORD = "rgba(255,255,255,0.32)";

export function AutoGenerateForm({ systemId, onBack }: Props) {
  const router = useRouter();
  const [nex, setNex] = useState(5);
  const [charName, setCharName] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const build = generateLevel1Build({
        charName: charName.trim() || undefined,
        classId: (classId || undefined) as ClassId | undefined,
      });

      const createRes = await fetch("/api/ordem/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...build, systemId }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error ?? "Erro ao gerar agente");
      const id: string = createJson.id;

      if (nex > 5) {
        const vitals = computeVitals(build.className, 5, build.attrs.vig, build.attrs.pre, build.origin ?? undefined);
        let snapshot: OrdemSnapshot = {
          nex: 5,
          agi: build.attrs.agi, for: build.attrs.for, int: build.attrs.int, pre: build.attrs.pre, vig: build.attrs.vig,
          pvMax: vitals.pvMax, pvCurrent: vitals.pvMax,
          peMax: vitals.peMax, peCurrent: vitals.peMax,
          sanMax: vitals.sanMax, sanCurrent: vitals.sanMax,
          defense: computeDefense(build.attrs.agi),
          classId: build.className,
          originId: build.origin ?? undefined,
          progression: emptyProgression(),
          skills: build.skills,
          rituals: build.rituals ?? [],
        };

        while (snapshot.nex < nex) {
          const result = pickNexUpgrade(snapshot);
          if (!result) break;
          const patchRes = await fetch(`/api/ordem/characters/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.patch),
          });
          if (!patchRes.ok) {
            const j = await patchRes.json().catch(() => ({}));
            throw new Error(j.error ?? `Erro ao subir para NEX ${result.next.nex}%`);
          }
          snapshot = result.next;
        }
      }

      router.push(`/dashboard/ordem/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar agente");
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

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>Ordem Paranormal · Crie Para Mim</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Geração automática
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: 24 }}>
          <div>
            <label style={labelStyle}>NEX (obrigatório)</label>
            <select
              value={nex}
              onChange={(e) => setNex(Number(e.target.value))}
              disabled={loading}
              style={inputStyle}
            >
              {NEX_VALUES.map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
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
              background: loading ? "var(--surface-2)" : ACCENT_DIM,
              color: loading ? "var(--text-muted)" : ACCENT,
              border: `1px solid ${loading ? "var(--border)" : ACCENT_BORD}`,
              borderRadius: "var(--radius)",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 0 20px rgba(255,255,255,0.1)",
            }}
          >
            {loading ? "Gerando… pode levar alguns segundos em NEX altos." : "Recrutar Agente"}
          </button>
        </div>
      </div>
    </div>
  );
}
