"use client";

import {
  ATTR_ABBR, ATTR_LABELS, SKILLS, OCCUPATIONS,
  calcPV, calcPM, calcMOV, calcDamageBonus, calcCorpo,
  getSkillBase, WEAPONS,
  type AttrKey,
} from "@/lib/cthulhu/data";

function creditTierLabel(cr: number): string {
  if (cr <= 0) return "Pobretão";
  if (cr < 10)  return "Pobre";
  if (cr < 50)  return "Médio";
  if (cr < 90)  return "Abastado";
  if (cr < 100) return "Rico";
  return "Ricaço";
}
import type { WizardData } from "../CthulhuWizard";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

const ATTR_KEYS: AttrKey[] = ["for", "con", "tam", "des", "apa", "int", "pod", "edu"];

interface Props {
  data: Partial<WizardData>;
}

export function StepReview({ data }: Props) {
  if (!data.attrs || !data.name) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
        Dados incompletos. Volte e preencha as etapas anteriores.
      </div>
    );
  }

  const attrs = data.attrs;
  const age   = data.age ?? 25;
  const occ   = OCCUPATIONS.find((o) => o.id === data.occupationId);
  const era   = data.era === "modern" ? "Moderno" : "Anos 1920";

  const allSkillPoints: Record<string, number> = {};
  for (const [k, v] of Object.entries(data.occupationSkills ?? {})) allSkillPoints[k] = (allSkillPoints[k] ?? 0) + v;
  for (const [k, v] of Object.entries(data.interestSkills   ?? {})) allSkillPoints[k] = (allSkillPoints[k] ?? 0) + v;

  const notableSkills = SKILLS
    .filter((s) => (allSkillPoints[s.id] ?? 0) > 0)
    .map((s) => ({
      ...s,
      added: allSkillPoints[s.id] ?? 0,
      total: getSkillBase(s, attrs.edu, attrs.des) + (allSkillPoints[s.id] ?? 0),
    }))
    .sort((a, b) => b.total - a.total);

  const bg = data.background ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Etapa 5</span>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 700, color: "var(--text)" }}>
          Revisão e <span style={{ color: ACCENT }}>Criação</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
          Confirme os dados do seu investigador antes de criar.
        </p>
      </div>

      {/* Identity */}
      <Card title="Identidade">
        <Row label="Nome"           value={data.name} />
        <Row label="Ocupação"       value={occ?.name ?? data.occupationId ?? "—"} />
        <Row label="Era"            value={era} />
        <Row label="Idade"          value={`${age} anos`} />
        <Row label="Nível de Crédito" value={`${data.occupationSkills?.nivel_credito ?? 0} — ${creditTierLabel(data.occupationSkills?.nivel_credito ?? 0)}`} />
      </Card>

      {/* Attributes */}
      <Card title="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {ATTR_KEYS.map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span style={{ fontWeight: 700, color: ACCENT_LIGHT, marginRight: 6 }}>{ATTR_ABBR[k]}</span>
                {ATTR_LABELS[k]}
              </span>
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: "var(--text)" }}>{attrs[k]}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span style={{ fontWeight: 700, color: "var(--text-muted)", marginRight: 6 }}>SORTE</span>Sorte
            </span>
            <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: "var(--text)" }}>{attrs.sorte}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginTop: 12 }}>
          {[
            { l: "PV Máx",      v: calcPV(attrs) },
            { l: "PM Máx",      v: calcPM(attrs) },
            { l: "Sanidade",    v: attrs.pod },
            { l: "Movimento",   v: calcMOV(attrs, age) },
            { l: "Dano Extra",  v: calcDamageBonus(attrs) },
            { l: "Corpo",       v: `${calcCorpo(attrs) > 0 ? "+" : ""}${calcCorpo(attrs)}` },
          ].map(({ l, v }) => (
            <div key={l} style={{ padding: "10px 12px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xs)", textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: ACCENT_LIGHT }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills summary */}
      {notableSkills.length > 0 && (
        <Card title={`Perícias Distribuídas (${notableSkills.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
            {notableSkills.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.name}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: ACCENT_LIGHT }}>{s.total}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Background summary */}
      {Object.values(bg).some(Boolean) && (
        <Card title="Antecedentes">
          {Object.entries(bg).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                {k.replace(/([A-Z])/g, " $1").trim()}
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{v as string}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Weapons summary */}
      {(data.weapons?.length ?? 0) > 0 && (
        <Card title="Armas">
          {WEAPONS.filter((w) => data.weapons?.includes(w.id)).map((w) => (
            <Row key={w.id} label={w.name} value={`${w.damage}${w.addDB ? "+DX" : ""}${w.halfDB ? "+½DX" : ""}`} />
          ))}
        </Card>
      )}

      {/* Equipment summary */}
      {data.equipment?.trim() && (
        <Card title="Equipamento e Posses">
          <pre style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
            {data.equipment.trim()}
          </pre>
        </Card>
      )}

    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{value}</span>
    </div>
  );
}
