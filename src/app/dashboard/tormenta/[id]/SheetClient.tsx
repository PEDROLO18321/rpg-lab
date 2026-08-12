"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DeleteCharacterButton } from "@/components/dashboard/DeleteCharacterButton";
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
  const sheet = character.tormentaSheet;
  const race = sheet.race ? RACE_BY_ID[sheet.race] : null;
  const cls = sheet.className ? CLASS_BY_ID[sheet.className] : null;
  const origin = sheet.origin ? ORIGIN_BY_ID[sheet.origin] : null;
  const god = sheet.godId ? GOD_BY_ID[sheet.godId] : null;

  const [mode, setMode] = useState<"ficha" | "editar">("ficha");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl ?? null);
  const [pv, setPv] = useState({ cur: sheet.pvCurrent, max: sheet.pvMax, temp: sheet.pvTemp });
  const [pm, setPm] = useState({ cur: sheet.pmCurrent, max: sheet.pmMax, temp: sheet.pmTemp });
  const [notes, setNotes] = useState<string>(sheet.notes ?? "");
  const [background, setBackground] = useState<Background>(parse(sheet.background, {}));
  const [saving, setSaving] = useState(false);
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

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav userName={character.user?.name ?? "Jogador"} systemName="Tormenta 20" systemHref="/dashboard/tormenta/jogador" backLabel="Meus Heróis" accentColor="#a01818" onExportPdf={() => window.print()} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "var(--radius-xl)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {portraitUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={portraitUrl} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: ACCENT_LIGHT, letterSpacing: "0.04em" }}>{cls ? cls.id.slice(0, 3).toUpperCase() : "T20"}</span>}
            </div>
            <div>
              <span className="section-label" style={{ display: "block", marginBottom: 6, color: ACCENT }}>Tormenta 20</span>
              <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)" }}>{character.name}</h1>
              <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 4 }}>
                {race?.icon} {race?.name} · {cls?.icon} {cls?.name} (nível {sheet.level}) · {origin?.name}{god ? ` · Devoto de ${god.name}` : ""}
              </p>
            </div>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 8 }}>
            {sheet.level < 20 && mode === "ficha" && (
              <button onClick={() => setLevelingUp(true)}
                style={{ padding: "8px 16px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: ACCENT_LIGHT, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                ⬆ Subir de Nível
              </button>
            )}
            <ModeBtn active={mode === "editar"} onClick={() => setMode("editar")}>Editar</ModeBtn>
            <ModeBtn active={mode === "ficha"} onClick={() => setMode("ficha")}>Ficha</ModeBtn>
          </div>
        </div>

        {mode === "editar" ? (
          <EditMode
            characterId={character.id}
            characterName={character.name}
            sheet={sheet}
            portraitUrl={portraitUrl}
            setPortraitUrl={setPortraitUrl}
          />
        ) : (
        <>
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
        </>
        )}
      </main>

      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 40 }}>
        <DeleteCharacterButton
          characterId={character.id}
          characterName={character.name}
          apiPath={`/api/tormenta/characters/${character.id}`}
          redirectTo="/dashboard/tormenta/jogador"
        />
      </div>
    </div>
  );
}

// ── Mode Button ───────────────────────────────────────────────────────────────

function ModeBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-lg)",
        background: active ? ACCENT_DIM : "var(--surface-2)",
        border: `1px solid ${active ? ACCENT_BORD : "var(--border)"}`,
        color: active ? ACCENT_LIGHT : "var(--text-muted)",
        fontWeight: active ? 700 : 400,
        fontSize: "0.84rem",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// ── EDIT MODE ─────────────────────────────────────────────────────────────────

interface EditProps {
  characterId: string;
  characterName: string;
  sheet: AnyChar;
  portraitUrl: string | null;
  setPortraitUrl: (v: string | null) => void;
}

function EditMode({ characterId, characterName, sheet, portraitUrl, setPortraitUrl }: EditProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(characterName);
  const [portrait, setPortrait] = useState<string | null>(portraitUrl);
  const [attrs, setAttrs] = useState<Record<(typeof ATTR_KEYS)[number], number>>({
    for: sheet.forca, des: sheet.des, con: sheet.con, int: sheet.int, sab: sheet.sab, car: sheet.car,
  });
  const [vitals, setVitals] = useState({
    level: sheet.level, xp: sheet.xp,
    pvMax: sheet.pvMax, pvCurrent: sheet.pvCurrent,
    pmMax: sheet.pmMax, pmCurrent: sheet.pmCurrent,
    defense: sheet.defense, movement: sheet.movement, money: sheet.money,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAttr(k: keyof typeof attrs, v: number) {
    setAttrs((a) => ({ ...a, [k]: v }));
    setSaved(false);
  }
  function setVital(k: keyof typeof vitals, v: number) {
    setVitals((s) => ({ ...s, [k]: v }));
    setSaved(false);
  }

  // Redimensiona a imagem escolhida (máx. 400px) e guarda como data URL — sem
  // depender de storage externo; cabe na coluna portraitUrl.
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPortrait(canvas.toDataURL("image/jpeg", 0.85));
        setSaved(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tormenta/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, portraitUrl: portrait, ...attrs, ...vitals }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setPortraitUrl(portrait);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.78rem", color: ACCENT_LIGHT, fontWeight: 700, marginBottom: 2 }}>⚠ Atenção: edição manual da ficha</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Ao salvar, os valores atuais desta tela substituem os antigos. Use com liberdade para ajustar nome, retrato, atributos e vitais — revise antes de confirmar.
        </p>
      </div>

      <Section title="Identidade">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 110, height: 110, borderRadius: "var(--radius-lg)", border: `1px solid ${ACCENT_BORD}`, background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {portrait
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={portrait} alt="Retrato" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)", textAlign: "center", padding: 8 }}>Sem foto</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => fileRef.current?.click()} style={miniBtn}>Trocar foto</button>
              {portrait && <button onClick={() => { setPortrait(null); setSaved(false); }} style={miniBtn}>Remover</button>}
            </div>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.4, maxWidth: 130 }}>
              Ideal: imagem quadrada (1:1), ~400×400px. Redimensionada automaticamente.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <EditText label="Nome" value={name} onChange={(v) => { setName(v); setSaved(false); }} />
          </div>
        </div>
      </Section>

      <Section title="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {ATTR_KEYS.map((k) => (
            <EditNumber key={k} label={ATTR_LABEL[k]} value={attrs[k]} onChange={(v) => setAttr(k, v)} hint={`mod ${attrMod(attrs[k]) >= 0 ? "+" : ""}${attrMod(attrs[k])}`} />
          ))}
        </div>
      </Section>

      <Section title="Vitais & Progressão">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          <EditNumber label="Nível" value={vitals.level} onChange={(v) => setVital("level", v)} />
          <EditNumber label="XP" value={vitals.xp} onChange={(v) => setVital("xp", v)} />
          <EditNumber label="PV Máximo" value={vitals.pvMax} onChange={(v) => setVital("pvMax", v)} />
          <EditNumber label="PV Atual" value={vitals.pvCurrent} onChange={(v) => setVital("pvCurrent", v)} />
          <EditNumber label="PM Máximo" value={vitals.pmMax} onChange={(v) => setVital("pmMax", v)} />
          <EditNumber label="PM Atual" value={vitals.pmCurrent} onChange={(v) => setVital("pmCurrent", v)} />
          <EditNumber label="Defesa" value={vitals.defense} onChange={(v) => setVital("defense", v)} />
          <EditNumber label="Deslocamento" value={vitals.movement} onChange={(v) => setVital("movement", v)} />
          <EditNumber label="Dinheiro (T$)" value={vitals.money} onChange={(v) => setVital("money", v)} />
        </div>
      </Section>

      {error && <p style={{ fontSize: "0.8rem", color: "#ff6b6b" }}>{error}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={saveAll} disabled={saving}
          style={{ padding: "10px 24px", background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, border: "none", borderRadius: "var(--radius-lg)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: saving ? "wait" : "pointer" }}>
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
        {saved && <span style={{ fontSize: "0.78rem", color: "#5fbf7f" }}>✓ Salvo</span>}
      </div>
    </div>
  );
}

function EditText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={editInputStyle} />
    </div>
  );
}

function EditNumber({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}{hint ? <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}> · {hint}</span> : ""}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={editInputStyle}
      />
    </div>
  );
}

const editLabelStyle: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 };
const editInputStyle: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", color: "var(--text)", fontSize: "0.86rem", fontFamily: "inherit", boxSizing: "border-box" };
const miniBtn: React.CSSProperties = { padding: "5px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.74rem", cursor: "pointer" };

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
