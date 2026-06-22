"use client";

import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import {
  WEAPONS, PROTECTIONS, GENERAL_ITEMS, GENERAL_GROUP_LABEL,
  WEAPON_BY_ID, PROTECTION_BY_ID, GENERAL_BY_ID,
  DAMAGE_TYPE_LABEL, loadStatus, categoryLimit,
  type WeaponProf, type GeneralGroup,
} from "@/lib/ordem/items";

const BORD_SEL = "rgba(255,255,255,0.55)";
const ROMAN = ["0", "I", "II", "III", "IV"];
const PATENTE = "recruta"; // nível 1

const PROF_LABEL: Record<WeaponProf, string> = {
  simples: "Armas Simples",
  tatica: "Armas Táticas",
  pesada: "Armas Pesadas",
};

const CLASS_WEAPON_PROFS: Record<string, WeaponProf[]> = {
  combatente: ["simples", "tatica"],
  especialista: ["simples"],
  ocultista: ["simples"],
};

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

interface PickItem { category: number; spaces: number }

export function StepEquipment({ data, onChange }: Props) {
  const profSet = data.classId ? CLASS_WEAPON_PROFS[data.classId] ?? [] : [];

  // ── Estado de carga / categorias ──
  const picked: PickItem[] = [
    ...data.weapons.map((id) => WEAPON_BY_ID[id]).filter(Boolean),
    ...data.protections.map((id) => PROTECTION_BY_ID[id]).filter(Boolean),
    ...data.generalItems.map((id) => GENERAL_BY_ID[id]).filter(Boolean),
  ];
  const catICount = picked.filter((i) => i.category === 1).length;
  const bonusSpaces = data.generalItems.reduce((a, id) => a + (GENERAL_BY_ID[id]?.capacityBonus ?? 0), 0);
  const usedSpaces = picked.reduce((a, i) => a + i.spaces, 0);
  const load = loadStatus(usedSpaces, data.attrs.for, bonusSpaces);
  const catILimit = categoryLimit(PATENTE, 1); // 2 para recruta

  function isSelected(kind: keyof OrdemWizardData, id: string): boolean {
    return (data[kind] as string[]).includes(id);
  }

  // Motivo de bloqueio (null = pode selecionar).
  function blockReason(category: number, spaces: number, selected: boolean): string | null {
    if (selected) return null;
    if (category >= 2 && categoryLimit(PATENTE, category) <= 0) return `Categoria ${ROMAN[category]} exige patente maior`;
    if (category === 1 && catICount >= catILimit) return `Limite de categoria I (${catILimit})`;
    if (load.used + spaces > load.hardCap) return "Excede o limite máximo de carga";
    return null;
  }

  function toggle(kind: "weapons" | "protections" | "generalItems", id: string, category: number, spaces: number) {
    const list = data[kind];
    const selected = list.includes(id);
    if (selected) {
      onChange({ [kind]: list.filter((x) => x !== id) } as Partial<OrdemWizardData>);
    } else if (!blockReason(category, spaces, false)) {
      onChange({ [kind]: [...list, id] } as Partial<OrdemWizardData>);
    }
  }

  const profs: WeaponProf[] = ["simples", "tatica", "pesada"];
  const groups: GeneralGroup[] = ["acessorio", "explosivo", "operacional"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <Intro
        title="Equipamento & Identidade"
        text="Como recruta (nível 1), você libera quantos itens de categoria 0 quiser e até 2 de categoria I — itens de categoria superior exigem patente maior. Respeite também sua capacidade de carga."
      />

      {/* Resumo de carga + categorias (sticky) */}
      <div
        style={{
          position: "sticky", top: 64, zIndex: 5,
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
          padding: "14px 18px",
          background: "rgba(10,12,18,0.92)", backdropFilter: "blur(12px)",
          border: `1px solid ${load.overCap ? "rgba(220,60,60,0.5)" : load.overloaded ? "rgba(224,132,60,0.5)" : "rgba(255,255,255,0.18)"}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Carga</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: load.overCap ? "#e0843c" : "#ffffff" }}>
              {load.used} / {load.capacity} esp{load.overloaded && !load.overCap ? " · sobrecarregado" : ""}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (load.used / Math.max(1, load.capacity)) * 100)}%`, background: load.overloaded ? "#e0843c" : "#ffffff", transition: "width 0.25s" }} />
          </div>
          <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginTop: 4 }}>
            Capacidade 5×Força{bonusSpaces ? ` +${bonusSpaces}` : ""} · teto {load.hardCap}. Sobrecarga: −5 Defesa, −3m, −5 perícias de carga.
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "var(--radius)" }}>
          <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Categoria I</p>
          <p style={{ fontSize: "1.05rem", fontWeight: 800, color: catICount >= catILimit ? "#e0843c" : "#ffffff" }}>{catICount}/{catILimit}</p>
        </div>
      </div>

      {load.overloaded && (
        <p style={{ fontSize: "0.78rem", color: "#e0843c", marginTop: -12 }}>
          {load.overCap ? "Acima do teto de carga — remova itens para continuar." : "Sobrecarregado: aplicará −5 em Defesa, −3m de deslocamento e −5 em perícias de carga."}
        </p>
      )}

      {/* Armas */}
      <Section title="Armas" caption={<><span style={{ color: "#e0843c", fontWeight: 700 }}>−5</span> = arma fora da proficiência da classe.</>}>
        {profs.map((prof) => (
          <div key={prof} style={{ marginBottom: 12 }}>
            <GroupLabel>{PROF_LABEL[prof]}</GroupLabel>
            <Grid>
              {WEAPONS.filter((w) => w.prof === prof).map((w) => {
                const sel = isSelected("weapons", w.id);
                const block = blockReason(w.category, w.spaces, sel);
                const proficient = profSet.includes(w.prof);
                return (
                  <ItemBtn
                    key={w.id}
                    selected={sel}
                    blocked={block}
                    onClick={() => toggle("weapons", w.id, w.category, w.spaces)}
                    title={w.name}
                    titleExtra={!proficient ? <span style={{ fontSize: "0.62rem", color: "#e0843c", fontWeight: 700, marginLeft: 6 }}>−5</span> : null}
                    sub={`${w.damage} · ${DAMAGE_TYPE_LABEL[w.type]} · crít ${w.crit}${w.range ? ` · ${w.range}` : ""}`}
                    category={w.category}
                    spaces={w.spaces}
                  />
                );
              })}
            </Grid>
          </div>
        ))}
      </Section>

      {/* Proteções */}
      <Section title="Proteções">
        <Grid>
          {PROTECTIONS.map((p) => {
            const sel = isSelected("protections", p.id);
            const block = blockReason(p.category, p.spaces, sel);
            return (
              <ItemBtn
                key={p.id}
                selected={sel}
                blocked={block}
                onClick={() => toggle("protections", p.id, p.category, p.spaces)}
                title={p.name}
                sub={`Defesa +${p.defense}${p.note ? ` · ${p.note}` : ""}`}
                category={p.category}
                spaces={p.spaces}
              />
            );
          })}
        </Grid>
      </Section>

      {/* Itens Gerais */}
      <Section title="Itens Gerais">
        {groups.map((g) => (
          <div key={g} style={{ marginBottom: 12 }}>
            <GroupLabel>{GENERAL_GROUP_LABEL[g]}</GroupLabel>
            <Grid>
              {GENERAL_ITEMS.filter((it) => it.group === g).map((it) => {
                const sel = isSelected("generalItems", it.id);
                const block = blockReason(it.category, it.spaces, sel);
                return (
                  <ItemBtn
                    key={it.id}
                    selected={sel}
                    blocked={block}
                    onClick={() => toggle("generalItems", it.id, it.category, it.spaces)}
                    title={it.name}
                    sub={it.desc}
                    category={it.category}
                    spaces={it.spaces}
                  />
                );
              })}
            </Grid>
          </div>
        ))}
      </Section>

      {/* Identidade */}
      <Section title="Identidade (opcional)">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Aparência" value={data.background.appearance} onChange={(v) => onChange({ background: { ...data.background, appearance: v } })} placeholder="Como o agente se parece?" />
          <Field label="Personalidade" value={data.background.personality} onChange={(v) => onChange({ background: { ...data.background, personality: v } })} placeholder="Traços marcantes, manias, valores…" />
          <Field label="História" value={data.background.history} onChange={(v) => onChange({ background: { ...data.background, history: v } })} placeholder="O que aconteceu antes da Ordem?" textarea />
          <Field label="Objetivo" value={data.background.objective} onChange={(v) => onChange({ background: { ...data.background, objective: v } })} placeholder="O que move o agente?" />
        </div>
      </Section>
    </div>
  );
}

/* ── Subcomponentes ── */

function Section({ title, caption, children }: { title: string; caption?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: caption ? 4 : 12 }}>{title}</h3>
      {caption && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 12 }}>{caption}</p>}
      {children}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{children}</p>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>{children}</div>;
}

function ItemBtn({
  selected, blocked, onClick, title, titleExtra, sub, category, spaces,
}: {
  selected: boolean;
  blocked: string | null;
  onClick: () => void;
  title: string;
  titleExtra?: React.ReactNode;
  sub: string;
  category: number;
  spaces: number;
}) {
  const disabled = !!blocked && !selected;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={blocked ?? undefined}
      style={{
        textAlign: "left", padding: "10px 12px",
        background: selected ? "rgba(255,255,255,0.12)" : "var(--surface)",
        border: `1px solid ${selected ? BORD_SEL : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.12s",
        display: "flex", flexDirection: "column", gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: selected ? "#ffffff" : "var(--text)" }}>
          {title}{titleExtra}
        </span>
        <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <Tag>Cat {ROMAN[category] ?? category}</Tag>
          <Tag>{spaces} esp</Tag>
        </span>
      </div>
      <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", lineHeight: 1.45 }}>
        {blocked && !selected ? blocked : sub}
      </span>
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Field({
  label, value, onChange, placeholder, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean;
}) {
  const common = {
    width: "100%", padding: "10px 13px",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem",
    fontFamily: "inherit", resize: "vertical" as const,
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={common} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={common} />
      )}
    </div>
  );
}
