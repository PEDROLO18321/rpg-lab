"use client";

import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import type { AbilityKey } from "@/lib/dnd/races";
import type { WizardData } from "../CharacterWizard";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};
const SAVE_NAMES: { label: string; key: AbilityKey }[] = [
  { label: "Força",        key: "str" },
  { label: "Destreza",     key: "dex" },
  { label: "Constituição", key: "con" },
  { label: "Inteligência", key: "int" },
  { label: "Sabedoria",    key: "wis" },
  { label: "Carisma",      key: "cha" },
];
const PROF_BONUS = 2;

const ALIGNMENT_LABELS: Record<string, string> = {
  lg: "Leal e Bom", ng: "Neutro e Bom", cg: "Caótico e Bom",
  ln: "Leal e Neutro", nn: "Neutro", cn: "Caótico e Neutro",
  le: "Leal e Mau", ne: "Neutro e Mau", ce: "Caótico e Mau",
};
const SKILL_MAP: Record<string, AbilityKey> = {
  "Atletismo": "str",
  "Acrobacia": "dex", "Furtividade": "dex", "Prestidigitação": "dex",
  "Arcanismo": "int", "História": "int", "Investigação": "int", "Natureza": "int", "Religião": "int",
  "Adestrar Animais": "wis", "Intuição": "wis", "Medicina": "wis", "Percepção": "wis", "Sobrevivência": "wis",
  "Atuação": "cha", "Enganação": "cha", "Intimidação": "cha", "Persuasão": "cha",
};

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }

interface Props {
  data: Partial<WizardData>;
}

export function StepReview({ data }: Props) {
  const race     = RACES.find((r) => r.id === data.raceId);
  const subrace  = race?.subraces.find((s) => s.id === data.subraceId);
  const cls      = CLASSES.find((c) => c.id === data.classId);
  const subclass = cls?.subclasses?.find((s) => s.id === data.subclassId);
  const bg       = BACKGROUNDS.find((b) => b.id === data.backgroundId);

  // Compute racial bonus
  const racialBonus: Partial<Record<AbilityKey, number>> = {};
  if (race)    for (const [k, v] of Object.entries(race.baseBonus)   as [AbilityKey, number][]) racialBonus[k] = (racialBonus[k] ?? 0) + v;
  if (subrace) for (const [k, v] of Object.entries(subrace.bonus)    as [AbilityKey, number][]) racialBonus[k] = (racialBonus[k] ?? 0) + v;

  const bases = data.abilityBases ?? {} as Record<AbilityKey, number>;
  const finalScores: Record<AbilityKey, number> = ABILITIES.reduce((acc, k) => ({
    ...acc,
    [k]: (bases[k] ?? 8) + (racialBonus[k] ?? 0),
  }), {} as Record<AbilityKey, number>);

  const selectedSkills = data.selectedSkills ?? [];
  const passivePerception = 10 + mod(finalScores.wis) + (selectedSkills.includes("Percepção") ? PROF_BONUS : 0);

  // HP at level 1 = hit die max + CON modifier
  const conMod  = mod(finalScores.con);
  const hp      = cls ? (cls.hitDie + conMod) : null;

  const desc = data.desc ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 7 · Revisão
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          Revisão do <span className="text-gold">Personagem</span>
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Confirme todas as escolhas antes de criar o personagem. Você pode voltar a qualquer etapa para fazer alterações.
        </p>
      </div>

      {/* Identity card */}
      <Card accent>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "var(--radius-xl)",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              flexShrink: 0,
            }}
          >
            {cls?.icon ?? "⚔️"}
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.1,
              }}
            >
              {data.charName || <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>Sem nome</span>}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
              {[
                race?.name && (subrace ? `${race.name} (${subrace.name})` : race.name),
                cls?.name && (subclass ? `${cls.name} — ${subclass.name}` : cls.name),
                bg?.name,
              ].filter(Boolean).join(" · ")}
            </p>
            {desc.alignment && (
              <p style={{ fontSize: "0.76rem", color: "var(--accent-light)", marginTop: 2 }}>
                {ALIGNMENT_LABELS[desc.alignment] ?? desc.alignment}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      {cls && hp !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          <StatChip label="PV (Nível 1)" value={String(hp)} accent />
          <StatChip label="Dado de Vida" value={`d${cls.hitDie}`} />
          <StatChip label="Perc. Passiva" value={String(passivePerception)} />
          <StatChip label="Velocidade" value={`${race?.speed ?? 30} ft`} />
        </div>
      )}

      {/* Abilities */}
      <Section label="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {ABILITIES.map((k) => {
            const score = finalScores[k];
            const m     = mod(score);
            const racial = racialBonus[k] ?? 0;
            return (
              <div
                key={k}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 10px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {ABILITY_SHORT[k]}
                </p>
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                  {score}
                </p>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: m >= 0 ? "var(--accent-light)" : "var(--text-muted)", marginTop: 2 }}>
                  {signed(m)}
                </p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>
                  {ABILITY_LABELS[k]}
                </p>
                {racial > 0 && (
                  <span style={{ display: "inline-block", marginTop: 4, fontSize: "0.6rem", color: "var(--accent-light)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "1px 5px" }}>
                    +{racial} racial
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Saving throws + skills */}
      {cls && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Saves */}
          <div>
            <SubLabel>Testes de Resistência</SubLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {SAVE_NAMES.map(({ label, key }) => {
                const prof  = cls.savingThrows.includes(label);
                const bonus = mod(finalScores[key]) + (prof ? PROF_BONUS : 0);
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 12px",
                      background: prof ? "var(--accent-dim)" : "var(--surface-2)",
                      border: `1px solid ${prof ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {prof && <span style={{ fontSize: "0.55rem", color: "var(--accent)" }}>◆</span>}
                      <span style={{ fontSize: "0.78rem", color: prof ? "var(--accent-light)" : "var(--text-muted)", fontWeight: prof ? 700 : 400 }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: prof ? "var(--accent-light)" : "var(--text-muted)" }}>
                      {signed(bonus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <SubLabel>Perícias com Proficiência</SubLabel>
            {selectedSkills.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma selecionada</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {selectedSkills.map((skill) => {
                  const abilityKey = SKILL_MAP[skill] ?? "str";
                  const bonus = mod(finalScores[abilityKey]) + PROF_BONUS;
                  return (
                    <div
                      key={skill}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 12px",
                        background: "var(--accent-dim)",
                        border: "1px solid var(--accent)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: "0.55rem", color: "var(--accent)" }}>◆</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 700 }}>{skill}</span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-light)" }}>
                        {signed(bonus)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Race traits */}
      {race && (
        <Section label={`Traços Raciais — ${race.name}${subrace ? ` (${subrace.name})` : ""}`}>
          <TraitList traits={[...race.traits, ...(subrace?.traits ?? [])]} />
        </Section>
      )}

      {/* Class features */}
      {cls && (
        <Section label={`Características de Classe — ${cls.name}`}>
          <TraitList traits={cls.keyFeatures} />
        </Section>
      )}

      {/* Background */}
      {bg && (
        <Section label={`Antecedente — ${bg.name}`}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
            {bg.description}
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-muted)" }}>Característica:</strong> {bg.feature} — {bg.featureDesc}
          </p>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {bg.skills.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </Section>
      )}

      {/* Description */}
      {Object.keys(desc).length > 0 && (
        <Section label="Descrição">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {desc.age       && <DescChip label="Idade"   value={desc.age} />}
            {desc.height    && <DescChip label="Altura"  value={desc.height} />}
            {desc.weight    && <DescChip label="Peso"    value={desc.weight} />}
            {desc.eyes      && <DescChip label="Olhos"   value={desc.eyes} />}
            {desc.skin      && <DescChip label="Pele"    value={desc.skin} />}
            {desc.hair      && <DescChip label="Cabelo"  value={desc.hair} />}
          </div>
          {desc.personalityTrait && <PersonalityRow label="Traço"    value={desc.personalityTrait} />}
          {desc.ideal            && <PersonalityRow label="Ideal"    value={desc.ideal} />}
          {desc.bond             && <PersonalityRow label="Vínculo"  value={desc.bond} />}
          {desc.flaw             && <PersonalityRow label="Fraqueza" value={desc.flaw} />}
          {desc.backstory && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                História
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {desc.backstory}
              </p>
            </div>
          )}
        </Section>
      )}

      {/* Equipment */}
      {(cls || bg) && (
        <Section label="Equipamento Inicial">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls?.startingEquipment.map((item, i) => (
              <EquipRow key={`cls-${i}`} item={item} accent />
            ))}
            {bg?.startingEquipment.map((item, i) => (
              <EquipRow key={`bg-${i}`} item={item} />
            ))}
          </div>
          {cls && (
            <p style={{ marginTop: 12, fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
              Alternativa: {cls.startingGold} para comprar equipamento próprio.
            </p>
          )}
        </Section>
      )}

      {/* Confirmation note */}
      <div
        style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-xl)",
          padding: "18px 20px",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        Tudo certo? Clique em{" "}
        <strong style={{ color: "var(--accent-light)" }}>Criar Personagem ✓</strong> para salvar. Você poderá editar os detalhes na ficha depois.
      </div>
    </div>
  );
}

/* ── helpers ── */

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
      }}
    >
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "var(--text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "var(--accent-dim)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "12px 10px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "1.2rem",
          fontWeight: 700,
          color: accent ? "var(--accent-light)" : "var(--text)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function TraitList({ traits }: { traits: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {traits.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.7rem", marginTop: 1, flexShrink: 0 }}>•</span>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{t}</p>
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "var(--accent-light)",
        background: "var(--accent-dim)",
        border: "1px solid var(--border-accent)",
        borderRadius: "var(--radius-xs)",
        padding: "3px 9px",
      }}
    >
      {children}
    </span>
  );
}

function DescChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function PersonalityRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "var(--text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          minWidth: 60,
          paddingTop: 2,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function EquipRow({ item, accent }: { item: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ color: accent ? "var(--accent)" : "var(--text-muted)", fontWeight: 700, fontSize: "0.7rem", marginTop: 2, flexShrink: 0 }}>•</span>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item}</p>
    </div>
  );
}
