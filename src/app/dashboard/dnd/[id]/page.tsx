import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import type { AbilityKey } from "@/lib/dnd/races";

/* ── types ── */

type CharacterWithSheet = NonNullable<Awaited<ReturnType<typeof fetchCharacter>>>;
type Sheet = NonNullable<CharacterWithSheet["dndSheet"]>;

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
const PROF_BONUS = 2;

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }

/* ── data fetch ── */

async function fetchCharacter(id: string, userId: string) {
  return prisma.character.findFirst({
    where: { id, userId },
    include: {
      dndSheet: {
        include: {
          classes:   true,
          skills:    true,
          equipment: true,
          features:  true,
        },
      },
    },
  });
}

/* ── page ── */

export default async function CharacterSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const character = await fetchCharacter(id, session.user.id);
  if (!character) notFound();

  const sheet = character.dndSheet;

  // Resolve lib data
  const [raceId, subraceId] = (sheet?.race ?? "").split("/");
  const race     = RACES.find((r) => r.id === raceId);
  const subrace  = race?.subraces.find((s) => s.id === subraceId);
  const bg       = BACKGROUNDS.find((b) => b.id === sheet?.background);
  const clsEntry = sheet?.classes?.[0];
  const cls      = CLASSES.find((c) => c.id === clsEntry?.className);
  const subclass = cls?.subclasses?.find((s) => s.id === clsEntry?.subclass) ??
                   cls?.subclasses?.find((s) => s.name === clsEntry?.subclass);

  // Parse notes (description data stored as JSON)
  let desc: Record<string, string> = {};
  try { if (character.notes) desc = JSON.parse(character.notes); } catch { /* ignore */ }

  const level = clsEntry?.level ?? sheet?.level ?? 1;

  // Final scores from sheet
  const scores: Record<AbilityKey, number> = {
    str: sheet?.str ?? 10,
    dex: sheet?.dex ?? 10,
    con: sheet?.con ?? 10,
    int: sheet?.int ?? 10,
    wis: sheet?.wis ?? 10,
    cha: sheet?.cha ?? 10,
  };

  // Proficient saves from class data
  const proficientSaves = cls?.savingThrows ?? [];
  // Proficient skills from sheet
  const proficientSkills = new Set(
    sheet?.skills.filter((s) => s.proficient).map((s) => s.skillName) ?? []
  );

  const passivePerception = 10 + mod(scores.wis) + (proficientSkills.has("Percepção") ? PROF_BONUS : 0);

  const raceName = race
    ? subrace ? `${race.name} (${subrace.name})` : race.name
    : sheet?.race ?? "—";
  const className = cls
    ? subclass ? `${cls.name} — ${subclass.name}` : cls.name
    : clsEntry?.className ?? "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DashboardNav
        userName={session.user.name ?? session.user.email ?? "Usuário"}
        systemName="D&D 5e"
        systemHref="/dashboard/dnd"
      />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <Link
            href="/dashboard/dnd"
            style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
          >
            ← Meus Personagens
          </Link>
        </div>

        {/* Hero header */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-xl)",
            padding: "28px 28px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-xl)",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              flexShrink: 0,
            }}
          >
            {cls?.icon ?? "⚔️"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.1,
              }}
            >
              {character.name}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6 }}>
              {[raceName, className, bg?.name].filter(Boolean).join(" · ")}
            </p>
            {desc.alignment && (
              <p style={{ fontSize: "0.76rem", color: "var(--accent-light)", marginTop: 3 }}>
                {ALIGNMENT_LABELS[desc.alignment] ?? desc.alignment}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
            <Chip label="Nível" value={String(level)} accent />
            <Chip label="Dado de Vida" value={sheet?.hitDice ?? `d${cls?.hitDie ?? "?"}`} />
          </div>
        </div>

        {/* Core stats bar */}
        {sheet && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <StatBox label="Pontos de Vida" value={`${sheet.hpCurrent} / ${sheet.hpMax}`} accent />
            <StatBox label="Classe de Armadura" value={String(sheet.armorClass)} />
            <StatBox label="Iniciativa" value={signed(sheet.initiative)} />
            <StatBox label="Velocidade" value={`${sheet.speed} ft`} />
            <StatBox label="Perc. Passiva" value={String(passivePerception)} />
            {sheet.inspiration && <StatBox label="Inspiração" value="✦" accent />}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Ability scores */}
            <Section label="Atributos">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {ABILITIES.map((k) => {
                  const score = scores[k];
                  const m     = mod(score);
                  return (
                    <div
                      key={k}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {ABILITY_SHORT[k]}
                      </p>
                      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                        {score}
                      </p>
                      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: m >= 0 ? "var(--accent-light)" : "var(--text-muted)", marginTop: 2 }}>
                        {signed(m)}
                      </p>
                      <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginTop: 3 }}>
                        {ABILITY_LABELS[k]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Saving throws */}
            <Section label="Testes de Resistência">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {SAVE_NAMES.map(({ label, key }) => {
                  const prof  = proficientSaves.includes(label);
                  const bonus = mod(scores[key]) + (prof ? PROF_BONUS : 0);
                  return (
                    <SaveRow key={key} label={label} bonus={bonus} prof={prof} />
                  );
                })}
              </div>
            </Section>

            {/* Skills */}
            <Section label="Perícias">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {Object.entries(SKILL_MAP).map(([skill, abilityKey]) => {
                  const prof  = proficientSkills.has(skill);
                  const bonus = mod(scores[abilityKey]) + (prof ? PROF_BONUS : 0);
                  return (
                    <SaveRow key={skill} label={`${skill} (${ABILITY_SHORT[abilityKey]})`} bonus={bonus} prof={prof} />
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Traits from race + class */}
            {(race || cls || bg) && (
              <Section label="Traços & Características">
                {race && (
                  <TraitGroup
                    label={`Raça — ${raceName}`}
                    items={[...race.traits, ...(subrace?.traits ?? [])]}
                  />
                )}
                {cls && (
                  <TraitGroup label={`Classe — ${cls.name}`} items={cls.keyFeatures} />
                )}
                {bg && (
                  <TraitGroup
                    label={`Antecedente — ${bg.name}`}
                    items={[`${bg.feature}: ${bg.featureDesc}`]}
                  />
                )}
              </Section>
            )}

            {/* Equipment */}
            {sheet && (sheet.equipment.length > 0 || cls || bg) && (
              <Section label="Equipamento">
                {sheet.equipment.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {sheet.equipment.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 12px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.itemName}</span>
                        {item.quantity > 1 && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 6px" }}>
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback: show starting equipment from lib data
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[...(cls?.startingEquipment ?? []), ...(bg?.startingEquipment ?? [])].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent)", fontSize: "0.7rem", marginTop: 2, flexShrink: 0 }}>•</span>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Currency */}
            {sheet && (
              <Section label="Moedas">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {[
                    { label: "CP", value: sheet.cp },
                    { label: "SP", value: sheet.sp },
                    { label: "EP", value: sheet.ep },
                    { label: "GP", value: sheet.gp },
                    { label: "PP", value: sheet.pp },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "10px 6px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 3 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Personality */}
            {(desc.personalityTrait || desc.ideal || desc.bond || desc.flaw || desc.backstory) && (
              <Section label="Personalidade">
                {desc.personalityTrait && <PersonalityRow label="Traço"    value={desc.personalityTrait} />}
                {desc.ideal            && <PersonalityRow label="Ideal"    value={desc.ideal} />}
                {desc.bond             && <PersonalityRow label="Vínculo"  value={desc.bond} />}
                {desc.flaw             && <PersonalityRow label="Fraqueza" value={desc.flaw} />}
                {desc.backstory && (
                  <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      História
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {desc.backstory}
                    </p>
                  </div>
                )}
              </Section>
            )}

            {/* Physical appearance */}
            {(desc.age || desc.height || desc.weight || desc.eyes || desc.skin || desc.hair) && (
              <Section label="Aparência">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {desc.age    && <DescChip label="Idade"  value={desc.age} />}
                  {desc.height && <DescChip label="Altura" value={desc.height} />}
                  {desc.weight && <DescChip label="Peso"   value={desc.weight} />}
                  {desc.eyes   && <DescChip label="Olhos"  value={desc.eyes} />}
                  {desc.skin   && <DescChip label="Pele"   value={desc.skin} />}
                  {desc.hair   && <DescChip label="Cabelo" value={desc.hair} />}
                </div>
              </Section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── helpers ── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Chip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "8px 14px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
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
      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.15rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

function SaveRow({ label, bonus, prof }: { label: string; bonus: number; prof: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: prof ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${prof ? "var(--accent)" : "transparent"}`,
        borderRadius: "var(--radius)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {prof && <span style={{ fontSize: "0.5rem", color: "var(--accent)" }}>◆</span>}
        <span style={{ fontSize: "0.78rem", color: prof ? "var(--accent-light)" : "var(--text-muted)", fontWeight: prof ? 700 : 400 }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: prof ? "var(--accent-light)" : "var(--text-muted)" }}>
        {signed(bonus)}
      </span>
    </div>
  );
}

function TraitGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", fontSize: "0.68rem", flexShrink: 0, marginTop: 2 }}>•</span>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalityRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 56, paddingTop: 2, flexShrink: 0 }}>
        {label}
      </span>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function DescChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px" }}>
      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>{value}</p>
    </div>
  );
}
