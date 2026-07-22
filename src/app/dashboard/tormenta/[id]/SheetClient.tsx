"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { GOD_BY_ID } from "@/lib/tormenta/gods";
import { WEAPON_BY_ID } from "@/lib/tormenta/items";
import { SPELLS } from "@/lib/tormenta/spells";
import { ATTR_KEYS, ATTR_LABEL, attrMod, SKILLS, SKILL_BY_ID, skillModifier } from "@/lib/tormenta/data";
import { XP_THRESHOLDS, MAX_LEVEL, type ChosenPower } from "@/lib/tormenta/leveling";
import { LevelUpModal } from "./LevelUpModal";

const ACCENT       = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM   = "rgba(160,24,24,0.12)";
const ACCENT_BORD  = "rgba(160,24,24,0.32)";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyChar = any;

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

interface Background { appearance?: string; personality?: string; history?: string; objective?: string }

export function SheetClient({ character }: { character: AnyChar }) {
  const router = useRouter();
  const sheet = character.tormentaSheet;
  const race = sheet.race ? RACE_BY_ID[sheet.race] : null;
  const cls = sheet.className ? CLASS_BY_ID[sheet.className] : null;
  const origin = sheet.origin ? ORIGIN_BY_ID[sheet.origin] : null;
  const god = sheet.godId ? GOD_BY_ID[sheet.godId] : null;

  const [pv, setPv] = useState({ cur: sheet.pvCurrent, max: sheet.pvMax, temp: sheet.pvTemp });
  const [pm, setPm] = useState({ cur: sheet.pmCurrent, max: sheet.pmMax, temp: sheet.pmTemp });
  const [notes, setNotes] = useState<string>(sheet.notes ?? "");
  const [background, setBackground] = useState<Background>(parse(sheet.background, {}));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [levelingUp, setLevelingUp] = useState(false);

  const attrs = { for: sheet.forca, des: sheet.des, con: sheet.con, int: sheet.int, sab: sheet.sab, car: sheet.car };
  const skillsData = parse<Record<string, boolean>>(sheet.skills, {});
  const equipment = parse<string[]>(sheet.equipment, []);
  const weaponIds = parse<string[]>(sheet.weapons, []);
  const spellIds = parse<string[]>(sheet.spellsKnown, []);
  const powers = parse<ChosenPower[]>(sheet.powers, []);
  const xpForNext = sheet.level < MAX_LEVEL ? XP_THRESHOLDS[sheet.level + 1] : null;

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch(`/api/tormenta/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } finally { setSaving(false); }
  }

  function adjustPv(delta: number) {
    const next = { ...pv, cur: Math.max(0, Math.min(pv.max, pv.cur + delta)) };
    setPv(next);
    save({ pvCurrent: next.cur });
  }
  function adjustPm(delta: number) {
    const next = { ...pm, cur: Math.max(0, Math.min(pm.max, pm.cur + delta)) };
    setPm(next);
    save({ pmCurrent: next.cur });
  }

  async function remove() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/tormenta/characters/${character.id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/tormenta/jogador");
    } finally { setDeleting(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav userName={character.user?.name ?? "Jogador"} systemName="Tormenta 20" systemHref="/dashboard/tormenta/jogador" backLabel="Meus Heróis" />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: 6, color: ACCENT }}>Tormenta 20</span>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)" }}>{character.name}</h1>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 4 }}>
              {race?.icon} {race?.name} · {cls?.icon} {cls?.name} (nível {sheet.level}) · {origin?.name}{god ? ` · Devoto de ${god.name}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {sheet.level < 20 && (
              <button onClick={() => setLevelingUp(true)}
                style={{ padding: "8px 16px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: ACCENT_LIGHT, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                ⬆ Subir de Nível
              </button>
            )}
            <button onClick={remove} disabled={deleting}
              style={{ padding: "8px 16px", background: confirmDelete ? "rgba(220,60,60,0.15)" : "var(--surface-2)", border: `1px solid ${confirmDelete ? "#e06c6c" : "var(--border)"}`, borderRadius: "var(--radius)", color: confirmDelete ? "#e06c6c" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              {deleting ? "Excluindo…" : confirmDelete ? "Confirmar exclusão?" : "Excluir personagem"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <VitalCard label="Pontos de Vida" color={ACCENT_LIGHT} data={pv} onDelta={adjustPv} />
          <VitalCard label="Pontos de Mana" color={ACCENT_LIGHT} data={pm} onDelta={adjustPm} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Chip label="Nível" value={`${sheet.level}`} />
          <Chip label="XP" value={xpForNext !== null ? `${sheet.xp} / ${xpForNext}` : `${sheet.xp} (máx.)`} />
          <Chip label="Defesa" value={`${sheet.defense}`} />
          <Chip label="Deslocamento" value={`${sheet.movement}m`} />
          <Chip label="Dinheiro" value={`T$ ${sheet.money}`} />
        </div>

        {levelingUp && <LevelUpModal character={character} onClose={() => setLevelingUp(false)} />}

        <Section title="Atributos">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
            {ATTR_KEYS.map((k) => (
              <div key={k} style={{ textAlign: "center", padding: "10px 6px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>{ATTR_LABEL[k]}</p>
                <p style={{ fontSize: "1.3rem", fontWeight: 800, color: ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{attrs[k]}</p>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{attrMod(attrs[k]) >= 0 ? "+" : ""}{attrMod(attrs[k])}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Perícias">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
            {SKILLS.map((s) => {
              const trained = !!skillsData[s.id];
              const mod = skillModifier(sheet.level, attrMod(attrs[s.attr]), trained);
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: trained ? ACCENT_DIM : "var(--surface)", border: `1px solid ${trained ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)" }}>
                  <span style={{ fontSize: "0.78rem", color: trained ? ACCENT_LIGHT : "var(--text-muted)", fontWeight: trained ? 700 : 500 }}>{s.name}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{mod >= 0 ? "+" : ""}{mod}</span>
                </div>
              );
            })}
          </div>
        </Section>

        {powers.length > 0 && (
          <Section title="Poderes">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {powers.slice().sort((a, b) => a.level - b.level).map((p, i) => (
                <div key={`${p.id}-${i}`} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>
                    {p.name}
                    {p.attrKey ? ` (${ATTR_LABEL[p.attrKey]} +${p.attrAmount})` : ""}
                    <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", fontWeight: 400 }}> · nível {p.level}{p.fixed ? " · automático" : ""}</span>
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {spellIds.length > 0 && (
          <Section title="Magias">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {spellIds.map((id) => {
                const sp = SPELLS.find((s) => s.id === id);
                if (!sp) return null;
                return (
                  <div key={id} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{sp.name} <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", fontWeight: 400 }}>· {sp.school} · {sp.circle}º círculo</span></p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{sp.description}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Equipamento">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weaponIds.map((id) => <Tag key={id}>{WEAPON_BY_ID[id]?.name ?? id}</Tag>)}
            {equipment.map((e, i) => <Tag key={`${e}-${i}`}>{e}</Tag>)}
          </div>
        </Section>

        <Section title="Antecedentes">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(["appearance", "personality", "history", "objective"] as const).map((f) => (
              <div key={f}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  {f === "appearance" ? "Aparência" : f === "personality" ? "Personalidade" : f === "history" ? "História" : "Objetivo"}
                </p>
                <textarea
                  value={background[f] ?? ""}
                  onChange={(e) => setBackground((b) => ({ ...b, [f]: e.target.value }))}
                  onBlur={() => save({ background })}
                  rows={2}
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "10px 12px", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notas">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => save({ notes })}
            rows={4}
            placeholder="Anotações livres de sessão..."
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "10px 12px", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
          />
        </Section>

        {saving && <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Salvando…</p>}

        <Link href="/dashboard/tormenta/jogador" style={{ fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none" }}>← Voltar para Meus Heróis</Link>
      </main>
    </div>
  );
}

function VitalCard({ label, color, data, onDelta }: { label: string; color: string; data: { cur: number; max: number; temp: number }; onDelta: (d: number) => void }) {
  const pct = Math.max(0, Math.min(100, (data.cur / Math.max(1, data.max)) * 100));
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: "1rem", fontWeight: 800, color }}>{data.cur}{data.temp > 0 ? `+${data.temp}` : ""}<span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>/{data.max}</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => onDelta(-1)} style={btnStyle}>−1</button>
        <button onClick={() => onDelta(-5)} style={btnStyle}>−5</button>
        <button onClick={() => onDelta(1)} style={btnStyle}>+1</button>
        <button onClick={() => onDelta(5)} style={btnStyle}>+5</button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: "4px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</p>
      {children}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "8px 14px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)" }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 6 }}>{label}</span>
      <span style={{ fontSize: "0.84rem", fontWeight: 700, color: ACCENT_LIGHT }}>{value}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ padding: "4px 11px", fontSize: "0.76rem", fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", color: "var(--text)" }}>{children}</span>;
}
