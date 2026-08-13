"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLASSES } from "@/lib/tormenta/classes";
import { MAX_LEVEL, buildLevelUpPlan, nextAttributeIncreaseAmount, type ChosenPower } from "@/lib/tormenta/leveling";
import { racialAttrBonus, finalAttrs } from "@/lib/tormenta/creation";
import { generateLevel1Build, pickLevelUpChoice } from "@/lib/tormenta/autoGenerate";
import type { AttrKey, TormentaAttrs } from "@/lib/tormenta/data";

interface Props {
  userId: string;
  systemId: string;
  onBack: () => void;
}

const ACCENT       = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM   = "rgba(160,24,24,0.12)";
const ACCENT_BORD  = "rgba(160,24,24,0.35)";

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
      const build = generateLevel1Build({ charName: charName.trim() || undefined, classId: classId || undefined });

      const createRes = await fetch("/api/tormenta/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...build, userId, systemId }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error ?? "Erro ao gerar herói");
      const id: string = createJson.id;

      if (level > 1) {
        const bonus = racialAttrBonus(build.raceId, build.raceVariantId ?? null, build.racialAttrChoices ?? []);
        let attrs: TormentaAttrs = finalAttrs(build.attrBases, bonus);
        let existingPowers: ChosenPower[] = [];
        let spellsKnown: string[] = [...build.selectedSpells];
        const schoolsChosen = build.schoolsChosen ?? [];
        let currentLevel = 1;

        while (currentLevel < level) {
          const plan = buildLevelUpPlan(build.classId, build.pathId ?? null, currentLevel);
          if (!plan) break;

          const choice = pickLevelUpChoice(build.classId, build.pathId ?? null, plan, attrs, existingPowers, spellsKnown, schoolsChosen);

          const res = await fetch(`/api/tormenta/characters/${id}/levelup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ powerId: choice.power.id, attrKey: choice.attrKey, newSpells: choice.newSpells }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error ?? `Erro ao subir para o nível ${plan.toLevel}`);
          }

          if (choice.attrKey) {
            const amt = nextAttributeIncreaseAmount(existingPowers, choice.attrKey);
            attrs = { ...attrs, [choice.attrKey]: attrs[choice.attrKey] + amt };
          }
          existingPowers = [
            ...existingPowers,
            {
              level: plan.toLevel, id: choice.power.id, name: choice.power.name, category: choice.power.category,
              description: choice.power.description, prerequisite: choice.power.prerequisite,
              classId: choice.power.classId, attrKey: choice.attrKey,
            },
          ];
          spellsKnown = [...spellsKnown, ...choice.newSpells];
          currentLevel = plan.toLevel;
        }
      }

      router.push(`/dashboard/tormenta/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar herói");
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

        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>Tormenta 20 · Crie Para Mim</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          Geração automática
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: 24 }}>
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
              background: loading ? "var(--surface-2)" : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
              color: loading ? "var(--text-muted)" : "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.92rem",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 0 20px ${ACCENT_DIM}`,
            }}
          >
            {loading ? "Gerando… pode levar alguns segundos em níveis altos." : "Gerar Herói"}
          </button>
        </div>
      </div>
    </div>
  );
}
