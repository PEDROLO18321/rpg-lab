"use client";

import { useState, useMemo } from "react";
import { MONSTERS, MONSTER_TYPES, CR_ORDER, type Monster, type MonsterType } from "@/lib/dnd/monsters";
import { type Campaign } from "@/lib/dnd/campaignStorage";

interface Props { campaign: Campaign; onChange: (c: Campaign) => void; }

const TYPE_COLORS: Record<MonsterType, string> = {
  "Aberração": "#e8b84b",
  "Besta": "#6ee7b7",
  "Celestial": "#fde68a",
  "Constructo": "#94a3b8",
  "Corruptor": "#f87171",
  "Dragão": "#fb923c",
  "Elemental": "#38bdf8",
  "Fada": "#f9a8d4",
  "Gigante": "#a3a3a3",
  "Humanoide": "#86efac",
  "Limo": "#bef264",
  "Monstruosidade": "#c084fc",
  "Morto-vivo": "#6b7280",
  "Planta": "#4ade80",
};

function crBadgeColor(cr: string) {
  const v = CR_ORDER[cr] ?? 0;
  if (v === 0) return "#6b7280";
  if (v <= 1) return "#4ade80";
  if (v <= 4) return "#fbbf24";
  if (v <= 10) return "#fb923c";
  if (v <= 20) return "#f87171";
  return "#e8b84b";
}

function mod(s: number) {
  const m = Math.floor((s - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function rollD20() { return Math.floor(Math.random() * 20) + 1; }

const CR_OPTIONS = ["Todos", "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11–15", "16–20", "21+"];

const HP_OPTIONS: { id: string; label: string; min: number; max: number }[] = [
  { id: "Todos", label: "Qualquer PV", min: 0,   max: Infinity },
  { id: "1-10",  label: "1–10 PV",     min: 0,   max: 10 },
  { id: "11-30", label: "11–30 PV",    min: 11,  max: 30 },
  { id: "31-60", label: "31–60 PV",    min: 31,  max: 60 },
  { id: "61-100",label: "61–100 PV",   min: 61,  max: 100 },
  { id: "101-200",label: "101–200 PV", min: 101, max: 200 },
  { id: "201+",  label: "201+ PV",     min: 201, max: Infinity },
];

const ATTR_KEYS: { key: keyof Monster; label: string }[] = [
  { key: "str", label: "FOR" }, { key: "dex", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "wis", label: "SAB" }, { key: "cha", label: "CAR" },
];

export function Bestiary({ campaign, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MonsterType | "">("");
  const [crFilter, setCrFilter] = useState("Todos");
  const [hpFilter, setHpFilter] = useState("Todos");
  const [selected, setSelected] = useState<Monster | null>(null);
  const [initValue, setInitValue] = useState("");
  const [showInit, setShowInit] = useState(false);

  const filtered = useMemo(() => {
    let list = MONSTERS;

    if (typeFilter) list = list.filter((m) => m.type === typeFilter);

    if (crFilter !== "Todos") {
      list = list.filter((m) => {
        const v = CR_ORDER[m.cr] ?? 0;
        if (crFilter === "11–15") return v >= 11 && v <= 15;
        if (crFilter === "16–20") return v >= 16 && v <= 20;
        if (crFilter === "21+") return v >= 21;
        return m.cr === crFilter;
      });
    }

    if (hpFilter !== "Todos") {
      const range = HP_OPTIONS.find((o) => o.id === hpFilter);
      if (range) list = list.filter((m) => m.hp >= range.min && m.hp <= range.max);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [search, typeFilter, crFilter, hpFilter]);

  function addToInitiative() {
    if (!selected) return;
    const initiative = initValue !== "" ? Number(initValue) : rollD20();
    onChange({
      ...campaign,
      combatants: [
        ...campaign.combatants,
        { id: crypto.randomUUID(), name: selected.name, initiative, hp: selected.hp, maxHp: selected.hp, isPlayer: false },
      ],
    });
    setShowInit(false);
    setInitValue("");
  }

  const accent = selected ? (TYPE_COLORS[selected.type] ?? "#e8b84b") : "#e8b84b";

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 20, alignItems: "start" }}>
      {/* Left: list */}
      <div>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar monstro..."
            style={{
              flex: "1 1 200px",
              padding: "9px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text)",
              fontSize: "0.86rem",
              outline: "none",
            }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MonsterType | "")}
            style={{ flex: "1 1 160px", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
          >
            <option value="">Todos os tipos</option>
            {MONSTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={crFilter}
            onChange={(e) => setCrFilter(e.target.value)}
            style={{ flex: "0 1 140px", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
          >
            {CR_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === "Todos" ? "Qualquer ND" : `ND ${o}`}</option>
            ))}
          </select>
          <select
            value={hpFilter}
            onChange={(e) => setHpFilter(e.target.value)}
            style={{ flex: "0 1 140px", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
          >
            {HP_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 12 }}>
          {filtered.length} monstro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
          {filtered.map((m) => {
            const ac = TYPE_COLORS[m.type] ?? "#e8b84b";
            const isActive = selected?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setSelected(isActive ? null : m); setShowInit(false); setInitValue(""); }}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  background: isActive ? `${ac}14` : "var(--surface)",
                  border: `1px solid ${isActive ? ac + "55" : "var(--border)"}`,
                  borderRadius: "var(--radius-xl)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = ac + "40"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: ac, background: `${ac}18`, border: `1px solid ${ac}30`, borderRadius: "var(--radius-full)", padding: "2px 7px", letterSpacing: "0.06em" }}>
                    {m.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: crBadgeColor(m.cr), background: `${crBadgeColor(m.cr)}18`, border: `1px solid ${crBadgeColor(m.cr)}30`, borderRadius: "var(--radius-full)", padding: "2px 7px" }}>
                    ND {m.cr}
                  </span>
                </div>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{m.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.size} · CA {m.ac} · PV {m.hp}</p>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>
            Nenhum monstro encontrado com esses filtros.
          </p>
        )}
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div
          style={{
            position: "sticky",
            top: 80,
            padding: "22px",
            background: "var(--surface)",
            border: `1px solid ${accent}40`,
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accent}30`, borderRadius: "var(--radius-full)", padding: "2px 8px", letterSpacing: "0.06em", marginBottom: 6 }}>
                {selected.type.toUpperCase()}
              </span>
              <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 3 }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                {selected.size} · {selected.alignment}
              </p>
            </div>
            <button onClick={() => setSelected(null)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>

          <div style={{ height: 1, background: `${accent}30`, marginBottom: 14 }} />

          {/* Key stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "CA", value: String(selected.ac) },
              { label: "PV", value: String(selected.hp) },
              { label: "ND", value: selected.cr },
              { label: "XP", value: selected.xp.toLocaleString("pt-BR") },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center", padding: "9px 6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>{value}</p>
                <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Speed */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Deslocamento</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{selected.speed}</p>
          </div>

          {/* Ability scores */}
          {"str" in selected && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
                {ATTR_KEYS.map(({ key, label }) => {
                  const val = (selected as unknown as Record<string, unknown>)[key] as number | undefined;
                  return (
                    <div key={key} style={{ textAlign: "center", padding: "7px 4px", background: "var(--surface-2)", border: `1px solid ${accent}25`, borderRadius: "var(--radius)" }}>
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{val ?? "—"}</p>
                      {val !== undefined && <p style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>({mod(val)})</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Saving throws / Skills */}
          {("savingThrows" in selected && (selected as Monster).savingThrows) && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Resistências a Testes</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{(selected as Monster).savingThrows}</p>
            </div>
          )}
          {("skills" in selected && (selected as Monster).skills) && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Perícias</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{(selected as Monster).skills}</p>
            </div>
          )}

          {/* Resistances / Immunities */}
          {("damageResistances" in selected && (selected as Monster).damageResistances) && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Resistências a Dano</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{(selected as Monster).damageResistances}</p>
            </div>
          )}
          {("damageImmunities" in selected && (selected as Monster).damageImmunities) && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Imunidades a Dano</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{(selected as Monster).damageImmunities}</p>
            </div>
          )}
          {("conditionImmunities" in selected && (selected as Monster).conditionImmunities) && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Imunidades a Condição</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{(selected as Monster).conditionImmunities}</p>
            </div>
          )}

          {/* Senses / Languages */}
          {"senses" in selected && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Sentidos</p>
                  <p style={{ fontSize: "0.76rem", color: "var(--text)", lineHeight: 1.5 }}>{(selected as Monster).senses}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Idiomas</p>
                  <p style={{ fontSize: "0.76rem", color: "var(--text)", lineHeight: 1.5 }}>{(selected as Monster).languages || "—"}</p>
                </div>
              </div>
            </>
          )}

          {/* Traits */}
          {"traits" in selected && (selected as Monster).traits && (selected as Monster).traits!.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Habilidades</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {(selected as Monster).traits!.map((t) => (
                  <div key={t.name}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{t.name}.</p>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{t.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          {"actions" in selected && (selected as Monster).actions && (selected as Monster).actions!.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ações</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {(selected as Monster).actions!.map((a) => (
                  <div key={a.name} style={{ padding: "8px 10px", background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: "var(--radius)" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fb923c", marginBottom: 2 }}>{a.name}.</p>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Legendary Actions */}
          {"legendaryActions" in selected && (selected as Monster).legendaryActions && (selected as Monster).legendaryActions!.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fde68a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ações Lendárias</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {(selected as Monster).legendaryActions!.map((a) => (
                  <div key={a.name} style={{ padding: "8px 10px", background: "rgba(253,230,138,0.05)", border: "1px solid rgba(253,230,138,0.2)", borderRadius: "var(--radius)" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fde68a", marginBottom: 2 }}>{a.name}.</p>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add to initiative */}
          <div style={{ height: 1, background: `${accent}30`, marginBottom: 12 }} />
          {!showInit ? (
            <button
              onClick={() => setShowInit(true)}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "var(--accent-dim)",
                color: "var(--accent-light)",
                border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius)",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⚔ Adicionar à Ordem de Iniciativa
            </button>
          ) : (
            <div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>
                Valor de Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = rolar d20)</span>
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={initValue}
                  onChange={(e) => setInitValue(e.target.value)}
                  placeholder="Rolar d20"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addToInitiative()}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "var(--radius)",
                    color: "var(--text)",
                    fontSize: "0.84rem",
                  }}
                />
                <button
                  onClick={addToInitiative}
                  style={{ padding: "8px 14px", background: "var(--accent-dim)", color: "var(--accent-light)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  + Adicionar
                </button>
                <button
                  onClick={() => { setShowInit(false); setInitValue(""); }}
                  style={{ padding: "8px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
