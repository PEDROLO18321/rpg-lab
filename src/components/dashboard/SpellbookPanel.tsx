"use client";

import { useMemo, useState } from "react";
import { SPELLS, SCHOOL_COLORS, spellClassKey } from "@/lib/dnd/spells";
import type { Spell } from "@/lib/dnd/spells";

export interface SpellRow {
  id: string;
  spellName: string;
  level: number;
  school: string | null;
  prepared: boolean;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  description: string | null;
}

function levelLabel(level: number): string {
  return level === 0 ? "Truques" : `Magias de ${level}° Nível`;
}

/** Detalhes completos: catálogo por nome; fallback nos campos salvos. */
function resolveDetails(row: SpellRow): {
  school: string | null;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  description: string | null;
} {
  const cat = SPELLS.find((s) => s.name.toLowerCase() === row.spellName.toLowerCase());
  return {
    school: cat?.school ?? row.school,
    castingTime: cat?.castingTime ?? row.castingTime,
    range: cat?.range ?? row.range,
    duration: cat?.duration ?? row.duration,
    description: cat?.description ?? row.description,
  };
}

/**
 * Grimório: magias e truques agrupados por nível. Grupo expande → lista de
 * magias; magia expande → detalhes completos (escola, conjuração, alcance,
 * duração, descrição). Botão de adicionar com aviso para falar com o Mestre.
 */
export function SpellbookPanel({
  characterId,
  classId,
  spells,
  onSpellAdded,
}: {
  characterId: string;
  classId: string | null;
  spells: SpellRow[];
  onSpellAdded: (spell: SpellRow) => void;
}) {
  const [openGroups, setOpenGroups] = useState<Set<number>>(() => new Set());
  const [openSpellId, setOpenSpellId] = useState<string | null>(null);
  const [addStage, setAddStage] = useState<"idle" | "warn" | "pick">("idle");
  const [search, setSearch] = useState("");
  const [onlyClass, setOnlyClass] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<number, SpellRow[]>();
    for (const s of spells) {
      const arr = map.get(s.level) ?? [];
      arr.push(s);
      map.set(s.level, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.spellName.localeCompare(b.spellName));
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [spells]);

  const knownNames = useMemo(
    () => new Set(spells.map((s) => s.spellName.toLowerCase())),
    [spells]
  );

  const classKey = classId ? spellClassKey(classId) : null;
  const pickList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SPELLS.filter((s) => {
      if (knownNames.has(s.name.toLowerCase())) return false;
      if (onlyClass && classKey && !s.classes.includes(classKey)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [search, onlyClass, classKey, knownNames]);

  async function addSpell(spell: Spell) {
    if (adding) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/dnd/characters/${characterId}/spells`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spellId: spell.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao adicionar magia.");
        return;
      }
      onSpellAdded({ ...data.spell, description: spell.description });
      setAddStage("idle");
      setSearch("");
    } catch {
      setError("Falha de conexão.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Grimório ({spells.length})
        </p>
        <button
          onClick={() => setAddStage("warn")}
          style={{
            padding: "4px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)",
            border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700,
            fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Adicionar magia
        </button>
      </div>

      {/* Aviso do Mestre */}
      {addStage === "warn" && (
        <div style={{
          background: "rgba(201,148,31,0.08)", border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-lg)", padding: "12px 14px", marginBottom: 10,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <p style={{ fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 700, lineHeight: 1.5 }}>
            ⚠ Converse com o Mestre da sua campanha sobre essa área!
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Continuar?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setAddStage("pick")}
              style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              Sim
            </button>
            <button
              onClick={() => setAddStage("idle")}
              style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              Não
            </button>
          </div>
        </div>
      )}

      {/* Picker */}
      {addStage === "pick" && (
        <div style={{
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "12px", marginBottom: 10,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar magia…"
              style={{
                flex: 1, padding: "6px 10px", borderRadius: "var(--radius)",
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => setAddStage("idle")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1rem", cursor: "pointer", padding: "0 6px" }}
            >
              ✕
            </button>
          </div>
          {classKey && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.7rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={onlyClass} onChange={(e) => setOnlyClass(e.target.checked)} />
              Somente magias da minha classe
            </label>
          )}
          {error && <p style={{ fontSize: "0.72rem", color: "#e06c6c", fontWeight: 600 }}>{error}</p>}
          <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {pickList.length === 0 ? (
              <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", fontStyle: "italic", padding: "8px 2px" }}>
                Nenhuma magia encontrada.
              </p>
            ) : (
              pickList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addSpell(s)}
                  disabled={adding}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit",
                    textAlign: "left", opacity: adding ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-xs)",
                    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", flexShrink: 0,
                  }}>
                    {s.level === 0 ? "T" : `${s.level}°`}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--text)", fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontSize: "0.64rem", color: SCHOOL_COLORS[s.school] ?? "var(--text-subtle)", flexShrink: 0 }}>
                    {s.school}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grupos por nível */}
      {groups.length === 0 ? (
        <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
          Nenhuma magia conhecida.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {groups.map(([level, list]) => {
            const isOpen = openGroups.has(level);
            return (
              <div key={level}>
                <button
                  onClick={() => {
                    const next = new Set(openGroups);
                    if (isOpen) next.delete(level); else next.add(level);
                    setOpenGroups(next);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: "var(--radius)",
                    background: isOpen ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${isOpen ? "var(--border-accent)" : "var(--border)"}`,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: isOpen ? "var(--accent-light)" : "var(--text)" }}>
                    {levelLabel(level)}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {list.length} {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4, paddingLeft: 6 }}>
                    {list.map((row) => {
                      const expanded = openSpellId === row.id;
                      const d = resolveDetails(row);
                      return (
                        <div key={row.id}>
                          <button
                            onClick={() => setOpenSpellId(expanded ? null : row.id)}
                            style={{
                              width: "100%", display: "flex", alignItems: "center", gap: 8,
                              padding: "6px 10px", borderRadius: "var(--radius)",
                              background: expanded ? "var(--surface-2)" : "transparent",
                              border: `1px solid ${expanded ? "var(--border)" : "transparent"}`,
                              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                              transition: "all 0.12s",
                            }}
                          >
                            <span style={{
                              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                              background: SCHOOL_COLORS[d.school ?? ""] ?? "var(--text-subtle)",
                            }} />
                            <span style={{ flex: 1, fontSize: "0.78rem", color: expanded ? "var(--accent-light)" : "var(--text)", fontWeight: expanded ? 700 : 500 }}>
                              {row.spellName}
                            </span>
                            <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>{expanded ? "▲" : "▼"}</span>
                          </button>

                          {expanded && (
                            <div style={{
                              margin: "4px 0 6px 15px",
                              background: "var(--surface-2)", border: "1px solid var(--border)",
                              borderLeft: `3px solid ${SCHOOL_COLORS[d.school ?? ""] ?? "var(--accent)"}`,
                              borderRadius: "var(--radius)", padding: "10px 12px",
                              display: "flex", flexDirection: "column", gap: 6,
                            }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {d.school && <DetailChip label="Escola" value={d.school} color={SCHOOL_COLORS[d.school]} />}
                                {d.castingTime && <DetailChip label="Conjuração" value={d.castingTime} />}
                                {d.range && <DetailChip label="Alcance" value={d.range} />}
                                {d.duration && <DetailChip label="Duração" value={d.duration} />}
                              </div>
                              {d.description ? (
                                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                                  {d.description}
                                </p>
                              ) : (
                                <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                                  Sem descrição registrada — consulte o Livro do Jogador.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function DetailChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <span style={{
      fontSize: "0.64rem", padding: "2px 8px", borderRadius: "var(--radius-xs)",
      background: "var(--surface)", border: "1px solid var(--border)",
      color: color ?? "var(--text-muted)",
    }}>
      <strong style={{ color: "var(--text-subtle)", fontWeight: 700 }}>{label}:</strong> {value}
    </span>
  );
}
