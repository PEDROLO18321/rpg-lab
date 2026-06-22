"use client";

import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import {
  ATTR_KEYS, ATTR_ABBR, ATTR_LABEL, CLASS_BY_ID, SKILL_BY_ID,
  computeVitals, computeDefense, BASE_MOVEMENT,
} from "@/lib/ordem/data";
import { ORIGIN_BY_ID } from "@/lib/ordem/origins";
import { WEAPON_BY_ID, PROTECTION_BY_ID, GENERAL_BY_ID, armorDefenseBonus, loadStatus } from "@/lib/ordem/items";
import { buildTrainedSkills } from "@/lib/ordem/creation";
import { RITUALS } from "@/lib/ordem/rituals";
import { PARANORMAL_POWER_BY_ID } from "@/lib/ordem/abilities";

const ACCENT = "#ffffff";
const ACCENT_LIGHT = "#ffffff";

export function StepReview({ data }: { data: OrdemWizardData }) {
  const cls = data.classId ? CLASS_BY_ID[data.classId] : null;
  const origin = ORIGIN_BY_ID[data.originId];
  const vitals = cls ? computeVitals(data.classId as never, 5, data.attrs.vig, data.attrs.pre, data.originId) : null;
  const defense = computeDefense(data.attrs.agi) + armorDefenseBonus(data.protections);
  const trained = Object.keys(buildTrainedSkills(data));

  const bonusSpaces = data.generalItems.reduce((a, id) => a + (GENERAL_BY_ID[id]?.capacityBonus ?? 0), 0);
  const usedSpaces = [
    ...data.weapons.map((id) => WEAPON_BY_ID[id]?.spaces ?? 0),
    ...data.protections.map((id) => PROTECTION_BY_ID[id]?.spaces ?? 0),
    ...data.generalItems.map((id) => GENERAL_BY_ID[id]?.spaces ?? 0),
  ].reduce((a, b) => a + b, 0);
  const load = loadStatus(usedSpaces, data.attrs.for, bonusSpaces);
  const hasEquip = data.weapons.length > 0 || data.protections.length > 0 || data.generalItems.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Revisão" text="Confira o agente antes de recrutá-lo. Os valores derivados foram calculados automaticamente." />

      {/* Header */}
      <div style={{ padding: "20px 22px", background: "var(--surface)", border: `1px solid ${ACCENT}33`, borderRadius: "var(--radius-lg)" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>
          {data.name || "Sem nome"}
        </h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 4 }}>
          {[cls?.name, origin?.name, "NEX 5%"].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Vitais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
        <Vital label="PV" value={vitals?.pvMax ?? 0} color="#c03030" />
        <Vital label="PE" value={vitals?.peMax ?? 0} color={ACCENT} />
        <Vital label="Sanidade" value={vitals?.sanMax ?? 0} color="#c9941f" />
        <Vital label="Defesa" value={defense} color="#5a9fd4" />
        <Vital label="Deslocamento" value={`${BASE_MOVEMENT}m`} color="var(--text)" />
        <Vital label="Carga" value={`${load.used}/${load.capacity}`} color={load.overloaded ? "#e0843c" : "var(--text)"} />
      </div>

      {/* Atributos */}
      <Section title="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {ATTR_KEYS.map((k) => (
            <div key={k} style={{ textAlign: "center", padding: "10px 6px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{ATTR_ABBR[k]}</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: data.attrs[k] === 0 ? "var(--text-subtle)" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>
                {data.attrs[k]}
              </p>
              <p style={{ fontSize: "0.58rem", color: "var(--text-subtle)" }}>{ATTR_LABEL[k]}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Perícias */}
      <Section title={`Perícias treinadas (${trained.length})`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {trained.map((id) => (
            <span key={id} style={{ padding: "5px 11px", fontSize: "0.76rem", fontWeight: 600, background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`, borderRadius: "var(--radius-full)", color: ACCENT_LIGHT }}>
              {SKILL_BY_ID[id]?.name ?? id}
            </span>
          ))}
        </div>
      </Section>

      {/* Equipamento */}
      {hasEquip && (
        <Section title="Equipamento">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.weapons.map((id) => (
              <Chip key={id} text={WEAPON_BY_ID[id]?.name ?? id} />
            ))}
            {data.protections.map((id) => (
              <Chip key={id} text={`🛡 ${PROTECTION_BY_ID[id]?.name ?? id}`} />
            ))}
            {data.generalItems.map((id) => (
              <Chip key={id} text={GENERAL_BY_ID[id]?.name ?? id} />
            ))}
          </div>
        </Section>
      )}

      {origin && (
        <Section title={`Poder de origem · ${origin.powerName}`}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{origin.powerDesc}</p>
        </Section>
      )}

      {/* Poder paranormal (Cultista Arrependido) */}
      {data.originId === "cultista-arrependido" && data.paranormalPowerId && (() => {
        const pp = PARANORMAL_POWER_BY_ID[data.paranormalPowerId];
        if (!pp) return null;
        return (
          <Section title={`Poder paranormal · ${pp.name}`}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{pp.description}</p>
            <p style={{ fontSize: "0.74rem", color: "#e07070", marginTop: 8, fontStyle: "italic" }}>
              ⚠ Sanidade inicial reduzida à metade (Traços do Outro Lado).
            </p>
          </Section>
        );
      })()}

      {/* Rituais iniciais (Ocultista) */}
      {data.startingRituals.length > 0 && (
        <Section title={`Rituais iniciais (${data.startingRituals.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.startingRituals.map((id) => {
              const r = RITUALS.find((x) => x.id === id);
              if (!r) return null;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{r.name}</span>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: "#9b7fd4", textTransform: "capitalize" }}>{r.element}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-subtle)" }}>{r.execution} · {r.range}</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Background / conceito */}
      {Object.values(data.background).some((v) => v.trim()) && (
        <Section title="Conceito">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.background.appearance && (
              <BackgroundRow label="Aparência" text={data.background.appearance} />
            )}
            {data.background.personality && (
              <BackgroundRow label="Personalidade" text={data.background.personality} />
            )}
            {data.background.history && (
              <BackgroundRow label="História" text={data.background.history} />
            )}
            {data.background.objective && (
              <BackgroundRow label="Objetivo" text={data.background.objective} />
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

function Vital({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "1.5rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>{value}</p>
      <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span style={{ padding: "5px 11px", fontSize: "0.76rem", fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", color: "var(--text)" }}>
      {text}
    </span>
  );
}

function BackgroundRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--text-subtle)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}
