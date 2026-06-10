"use client";

import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { resolveEquipment } from "@/lib/dnd/equipmentParser";
import { SPELLS, SPELLCASTING } from "@/lib/dnd/spells";
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
const SKILL_MAP: Record<string, AbilityKey> = {
  "Atletismo": "str",
  "Acrobacia": "dex", "Furtividade": "dex", "Prestidigitação": "dex",
  "Arcanismo": "int", "História": "int", "Investigação": "int", "Natureza": "int", "Religião": "int",
  "Adestrar Animais": "wis", "Intuição": "wis", "Medicina": "wis", "Percepção": "wis", "Sobrevivência": "wis",
  "Atuação": "cha", "Enganação": "cha", "Intimidação": "cha", "Persuasão": "cha",
};
const PROF_BONUS = 2;
const ALIGNMENT_LABELS: Record<string, string> = {
  lg: "Leal e Bom", ng: "Neutro e Bom", cg: "Caótico e Bom",
  ln: "Leal e Neutro", nn: "Neutro", cn: "Caótico e Neutro",
  le: "Leal e Mau", ne: "Neutro e Mau", ce: "Caótico e Mau",
};

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }

function isLevel1Feature(f: string) {
  const m = f.match(/\((\d+)°\)/);
  return !m || parseInt(m[1]) <= 1;
}

interface Props {
  data: Partial<WizardData>;
}

export function StepReview({ data }: Props) {
  const race    = RACES.find((r) => r.id === data.raceId);
  const subrace = race?.subraces.find((s) => s.id === data.subraceId);
  const cls     = CLASSES.find((c) => c.id === data.classId);
  const bg      = BACKGROUNDS.find((b) => b.id === data.backgroundId);

  // Racial bonus
  const racialBonus: Partial<Record<AbilityKey, number>> = {};
  if (race)    for (const [k, v] of Object.entries(race.baseBonus)  as [AbilityKey, number][]) racialBonus[k] = (racialBonus[k] ?? 0) + v;
  if (subrace) for (const [k, v] of Object.entries(subrace.bonus)   as [AbilityKey, number][]) racialBonus[k] = (racialBonus[k] ?? 0) + v;

  const bases = data.abilityBases ?? {} as Record<AbilityKey, number>;
  const finalScores: Record<AbilityKey, number> = ABILITIES.reduce((acc, k) => ({
    ...acc,
    [k]: (bases[k] ?? 8) + (racialBonus[k] ?? 0),
  }), {} as Record<AbilityKey, number>);

  const classSkills = data.selectedSkills ?? [];
  const bgSkills    = bg?.skills ?? [];
  const allSkills   = [...new Set([...bgSkills, ...classSkills])];

  const passivePerception = 10 + mod(finalScores.wis) + (allSkills.includes("Percepção") ? PROF_BONUS : 0);

  const conMod = mod(finalScores.con);
  const dexMod = mod(finalScores.dex);
  const hp     = cls ? Math.max(1, cls.hitDie + conMod) : null;
  const ac     = 10 + dexMod;

  const raceName = race ? (subrace ? `${race.name} (${subrace.name})` : race.name) : "—";
  const desc = data.desc ?? {};

  const level1ClassFeatures = cls?.keyFeatures.filter(isLevel1Feature) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 8 · Revisão
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
          Resumo completo da ficha de nível 1. Confirme antes de criar o personagem.
        </p>
      </div>

      {/* Identity */}
      <Card accent>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56, height: 56,
              borderRadius: "var(--radius-xl)",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", flexShrink: 0,
            }}
          >
            {cls?.name?.slice(0, 2).toUpperCase() ?? "—"}
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
              {data.charName || <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>Sem nome</span>}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
              {[raceName, cls?.name, bg?.name].filter(Boolean).join(" · ")}
            </p>
            {desc.alignment && (
              <p style={{ fontSize: "0.76rem", color: "var(--accent-light)", marginTop: 2 }}>
                {ALIGNMENT_LABELS[desc.alignment] ?? desc.alignment}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats chips */}
      {cls && hp !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          <StatChip label="PV (Nível 1)" value={String(hp)} accent />
          <StatChip label="Dado de Vida" value={`D${cls.hitDie}`} />
          <StatChip label="Classe de Armadura" value={String(ac)} />
          <StatChip label="Bônus Prof." value={`+${PROF_BONUS}`} accent />
          <StatChip label="Perc. Passiva" value={String(passivePerception)} />
          <StatChip label="Velocidade" value={`${race?.speed ?? 9} m`} />
        </div>
      )}

      {/* Ability scores */}
      <Section label="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {ABILITIES.map((k) => {
            const score  = finalScores[k];
            const m      = mod(score);
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

      {/* Saves + Skills */}
      {cls && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <SubLabel>Testes de Resistência</SubLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {SAVE_NAMES.map(({ label, key }) => {
                const prof  = cls.savingThrows.includes(label);
                const bonus = mod(finalScores[key]) + (prof ? PROF_BONUS : 0);
                return (
                  <RowItem key={key} label={label} value={signed(bonus)} highlight={prof} />
                );
              })}
            </div>
          </div>

          <div>
            <SubLabel>Perícias com Proficiência</SubLabel>
            {allSkills.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma selecionada</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {allSkills.map((skill) => {
                  const abilityKey = SKILL_MAP[skill] ?? "str";
                  const bonus      = mod(finalScores[abilityKey]) + PROF_BONUS;
                  const fromBg     = bgSkills.includes(skill);
                  return (
                    <div
                      key={skill}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "7px 12px",
                        background: "var(--accent-dim)",
                        border: "1px solid var(--accent)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: "0.55rem", color: "var(--accent)" }}>◆</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 700 }}>{skill}</span>
                        {fromBg && (
                          <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontStyle: "italic" }}>ant.</span>
                        )}
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
        <Section label={`Traços Raciais — ${raceName}`}>
          <TraitList traits={[...race.traits, ...(subrace?.traits ?? [])]} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            <Tag>Velocidade: {race.speed} m</Tag>
            <Tag>Tamanho: {race.size}</Tag>
            {race.languages.map((l) => <Tag key={l}>{l}</Tag>)}
          </div>
        </Section>
      )}

      {/* Class features nível 1 */}
      {cls && (
        <Section label={`Características de Classe · ${cls.name} · Nível 1`}>
          <div style={{ display: "flex", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <Tag>Dado de Vida: D{cls.hitDie}</Tag>
            {cls.savingThrows.map((s) => <Tag key={s}>Save: {s}</Tag>)}
            {cls.armorProficiencies.length > 0 && <Tag>Armaduras: {cls.armorProficiencies.join(", ")}</Tag>}
          </div>
          <TraitList traits={level1ClassFeatures} />
        </Section>
      )}

      {/* Background */}
      {bg && (
        <Section label={`Antecedente — ${bg.name}`}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {bg.description}
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-muted)" }}>Característica:</strong> {bg.feature} — {bg.featureDesc}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {bg.skills.map((s) => <Tag key={s}>{s}</Tag>)}
          </div>
        </Section>
      )}

      {/* Description */}
      {Object.keys(desc).some((k) => !!(desc as Record<string, string>)[k]) && (
        <Section label="Descrição">
          {(desc.age || desc.height || desc.weight || desc.eyes || desc.skin || desc.hair) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }}>
              {desc.age    && <DescChip label="Idade"   value={desc.age} />}
              {desc.height && <DescChip label="Altura"  value={desc.height} />}
              {desc.weight && <DescChip label="Peso"    value={desc.weight} />}
              {desc.eyes   && <DescChip label="Olhos"   value={desc.eyes} />}
              {desc.skin   && <DescChip label="Pele"    value={desc.skin} />}
              {desc.hair   && <DescChip label="Cabelo"  value={desc.hair} />}
            </div>
          )}
          {desc.personalityTrait && <PersonalityRow label="Traço"    value={desc.personalityTrait} />}
          {desc.ideal            && <PersonalityRow label="Ideal"    value={desc.ideal} />}
          {desc.bond             && <PersonalityRow label="Vínculo"  value={desc.bond} />}
          {desc.flaw             && <PersonalityRow label="Fraqueza" value={desc.flaw} />}
          {desc.backstory && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
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

      {/* Subclass */}
      {cls && data.subclassId && (() => {
        const sub = cls.subclasses?.find((s) => s.id === data.subclassId);
        if (!sub) return null;
        return (
          <Section label={`Subclasse — ${cls.name}`}>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--accent-light)" }}>{sub.name}</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{sub.description}</p>
          </Section>
        );
      })()}

      {/* Languages */}
      {(() => {
        const langs = data.selectedLanguages ?? [];
        if (langs.length === 0) return null;
        return (
          <Section label="Idiomas Adicionais">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {langs.map((l) => <Tag key={l}>{l}</Tag>)}
            </div>
          </Section>
        );
      })()}

      {/* Spells */}
      {data.classId && SPELLCASTING[data.classId] && (() => {
        const cantrips = (data.selectedCantrips ?? []).map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);
        const spells1  = (data.selectedSpells ?? []).map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);
        if (cantrips.length === 0 && spells1.length === 0) return null;
        return (
          <Section label="Magias">
            {cantrips.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <SubLabel>Truques</SubLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cantrips.map((s) => <Tag key={s!.id}>{s!.name}</Tag>)}
                </div>
              </div>
            )}
            {spells1.length > 0 && (
              <div>
                <SubLabel>Magias de 1° Nível</SubLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {spells1.map((s) => <Tag key={s!.id}>{s!.name}</Tag>)}
                </div>
              </div>
            )}
          </Section>
        );
      })()}

      {/* Equipment */}
      {(cls || bg) && (() => {
        const ec = data.equipmentChoices ?? {};
        const useGold = ec["useGold"] === "true";
        const goldAmt = ec["rolledGold"];
        const resolved = resolveEquipment(
          cls?.startingEquipment ?? [],
          bg?.startingEquipment  ?? [],
          ec,
        );
        return (
          <Section label="Equipamento Inicial">
            {useGold ? (
              <div>
                <p style={{ fontSize: "0.84rem", color: "var(--accent-light)", fontWeight: 700, marginBottom: 4 }}>
                  Riqueza inicial: {goldAmt ? `${goldAmt} po` : cls?.startingGold}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
                  Equipamento a ser comprado com as moedas de ouro.
                </p>
              </div>
            ) : resolved.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {resolved.map((item, i) => <EquipRow key={i} item={item} accent={i < (cls?.startingEquipment.length ?? 0)} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cls?.startingEquipment.map((item, i) => <EquipRow key={`cls-${i}`} item={item} accent />)}
                {bg?.startingEquipment.map((item, i)  => <EquipRow key={`bg-${i}`}  item={item} />)}
              </div>
            )}
          </Section>
        );
      })()}

      {/* Confirm */}
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
        <strong style={{ color: "var(--accent-light)" }}>Criar Personagem</strong> para salvar.
      </div>
    </div>
  );
}

/* ── helpers ── */

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--accent-dim)" : "var(--surface)", border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "12px 10px", textAlign: "center" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

function RowItem({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: highlight ? "var(--accent-dim)" : "var(--surface-2)", border: `1px solid ${highlight ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {highlight && <span style={{ fontSize: "0.55rem", color: "var(--accent)" }}>◆</span>}
        <span style={{ fontSize: "0.78rem", color: highlight ? "var(--accent-light)" : "var(--text-muted)", fontWeight: highlight ? 700 : 400 }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: highlight ? "var(--accent-light)" : "var(--text-muted)" }}>{value}</span>
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
    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-light)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "3px 9px" }}>
      {children}
    </span>
  );
}

function DescChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function PersonalityRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 60, paddingTop: 2, flexShrink: 0 }}>
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
