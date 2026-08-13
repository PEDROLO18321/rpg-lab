import type { AbilityKey } from "@/lib/dnd/races";
import type { WeaponEntry } from "@/lib/dnd/items";

// ── Types ─────────────────────────────────────────────────────────────────

type DescData = {
  alignment?: string;
  age?: string; height?: string; weight?: string;
  eyes?: string; skin?: string; hair?: string;
  personalityTrait?: string; ideal?: string; bond?: string; flaw?: string;
  backstory?: string;
  languages?: string[];
};

type WeaponAttack = { id: string; name: string; w: WeaponEntry; atkMod: number; dmgMod: number };

interface Props {
  characterName: string;
  playerName: string;
  raceName: string;
  classDisplay: string;
  level: number;
  backgroundName: string;
  alignmentLabel: string;
  xp: number;
  scores: Record<AbilityKey, number>;
  profBonus: number;
  proficientSaves: string[];
  proficientSkills: Set<string>;
  expertiseSkills: Set<string>;
  ac: number;
  initiative: number;
  speed: number;
  hpMax: number;
  hpCurrent: number;
  hpTemp: number;
  hitDiceType: string;
  hitDiceTotal: number;
  hitDiceAvailable: number;
  deathSavesSuccess: number;
  deathSavesFailure: number;
  inspiration: boolean;
  weaponAttacks: WeaponAttack[];
  equipment: { id: string; itemName: string; quantity: number; equipped: boolean }[];
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number };
  features: { id: string; name: string; source: string | null }[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  desc: DescData;
  isCaster: boolean;
  spellAbilityLabel: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  maxSlots: Record<string, number>;
  slotsUsedCount: Record<string, number>;
  spells: { id: string; spellName: string; level: number; prepared: boolean }[];
}

const ABILITY_LONG: Record<AbilityKey, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};
const SKILL_LIST: { name: string; ability: AbilityKey }[] = [
  { name: "Acrobacia",         ability: "dex" },
  { name: "Arcanismo",         ability: "int" },
  { name: "Atletismo",         ability: "str" },
  { name: "Atuação",           ability: "cha" },
  { name: "Enganação",         ability: "cha" },
  { name: "Furtividade",       ability: "dex" },
  { name: "História",          ability: "int" },
  { name: "Intimidação",       ability: "cha" },
  { name: "Intuição",          ability: "wis" },
  { name: "Investigação",      ability: "int" },
  { name: "Adestrar Animais",  ability: "wis" },
  { name: "Medicina",          ability: "wis" },
  { name: "Natureza",          ability: "int" },
  { name: "Percepção",         ability: "wis" },
  { name: "Persuasão",         ability: "cha" },
  { name: "Prestidigitação",   ability: "dex" },
  { name: "Religião",          ability: "int" },
  { name: "Sobrevivência",     ability: "wis" },
];

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }

const box: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "12px 14px",
  breakInside: "avoid",
};
const label: React.CSSProperties = {
  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 4,
};
const value: React.CSSProperties = { fontSize: "0.86rem", color: "var(--text)", fontWeight: 600 };

function Field({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div style={box}>
      <div style={label}>{heading}</div>
      <div style={value}>{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="section-label"
      style={{ fontSize: "0.78rem", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}
    >
      {children}
    </h2>
  );
}

// ── Component ────────────────────────────────────────────────────────────

export function DndPrintSheet(props: Props) {
  const {
    characterName, playerName, raceName, classDisplay, level, backgroundName, alignmentLabel, xp,
    scores, profBonus, proficientSaves, proficientSkills, expertiseSkills,
    ac, initiative, speed, hpMax, hpCurrent, hpTemp,
    hitDiceType, hitDiceTotal, hitDiceAvailable, deathSavesSuccess, deathSavesFailure, inspiration,
    weaponAttacks, equipment, currency, features,
    armorProficiencies, weaponProficiencies, toolProficiencies,
    desc, isCaster, spellAbilityLabel, spellSaveDC, spellAttackBonus, maxSlots, slotsUsedCount, spells,
  } = props;

  const wisMod = mod(scores.wis);
  const passivePerception = 10 + wisMod
    + (proficientSkills.has("Percepção") ? profBonus : 0)
    + (expertiseSkills.has("Percepção") ? profBonus : 0);

  const equippedItems = equipment.filter((e) => e.equipped);
  const otherItems = equipment.filter((e) => !e.equipped);

  const hasPersonality = desc.personalityTrait || desc.ideal || desc.bond || desc.flaw;
  const hasAppearance = desc.age || desc.height || desc.weight || desc.eyes || desc.skin || desc.hair;

  const spellLevels = Object.keys(maxSlots).map(Number).sort((a, b) => a - b);
  const cantrips = spells.filter((s) => s.level === 0);
  const spellsByLevel = spellLevels.map((lvl) => ({
    level: lvl,
    slots: maxSlots[String(lvl)] ?? 0,
    used: slotsUsedCount[String(lvl)] ?? 0,
    list: spells.filter((s) => s.level === lvl),
  }));

  return (
    <div className="print-only">
    <div
      style={{ maxWidth: 980, margin: "0 auto", padding: 28, display: "flex", flexDirection: "column", gap: 18 }}
    >
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, borderBottom: "2px solid var(--accent)", paddingBottom: 12 }}>
        <div>
          <div style={label}>RPG Lab · D&D 5e</div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>
            {characterName}
          </h1>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div>{classDisplay} · Nível {level}</div>
          <div>{raceName} · {backgroundName}</div>
        </div>
      </header>

      {/* Identity row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <Field heading="Jogador">{playerName}</Field>
        <Field heading="Tendência">{alignmentLabel}</Field>
        <Field heading="Pontos de Experiência">{xp}</Field>
        <Field heading="Bônus de Proficiência">{signed(profBonus)}</Field>
      </div>

      {/* Combat stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        <Field heading="Classe de Armadura">{ac}</Field>
        <Field heading="Iniciativa">{signed(initiative)}</Field>
        <Field heading="Deslocamento">{speed} m</Field>
        <Field heading="Pontos de Vida">{hpCurrent} / {hpMax}{hpTemp > 0 ? ` (+${hpTemp} temp)` : ""}</Field>
        <Field heading="Dados de Vida">{hitDiceAvailable}/{hitDiceTotal} {hitDiceType}</Field>
        <Field heading="Inspiração">{inspiration ? "Sim" : "Não"}</Field>
      </div>

      {deathSavesSuccess + deathSavesFailure > 0 && (
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Testes contra a morte — Sucessos: {deathSavesSuccess}/3 · Fracassos: {deathSavesFailure}/3
        </div>
      )}

      {/* Attributes + Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(Object.keys(scores) as AbilityKey[]).map((k) => (
            <div key={k} style={{ ...box, textAlign: "center", padding: "8px 6px" }}>
              <div style={label}>{ABILITY_LONG[k]}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{scores[k]}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{signed(mod(scores[k]))}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <SectionTitle>Testes de Resistência</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 16px", fontSize: "0.82rem" }}>
              {(Object.keys(scores) as AbilityKey[]).map((k) => {
                const prof = proficientSaves.includes(ABILITY_LONG[k]);
                const total = mod(scores[k]) + (prof ? profBonus : 0);
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--border-hover)", background: prof ? "var(--accent)" : "transparent", flexShrink: 0 }} />
                    <span style={{ color: "var(--text)" }}>{signed(total)}</span>
                    <span style={{ color: "var(--text-muted)" }}>{ABILITY_LONG[k]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle>Perícias — Percepção Passiva {passivePerception}</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px 16px", fontSize: "0.82rem" }}>
              {SKILL_LIST.map(({ name, ability }) => {
                const prof = proficientSkills.has(name);
                const exp  = expertiseSkills.has(name);
                const total = mod(scores[ability]) + (prof ? profBonus : 0) + (exp ? profBonus : 0);
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--border-hover)", background: exp ? "var(--accent)" : prof ? "var(--accent-glow-lg)" : "transparent", flexShrink: 0 }} />
                    <span style={{ color: "var(--text)" }}>{signed(total)}</span>
                    <span style={{ color: "var(--text-muted)" }}>{name} ({ABILITY_LONG[ability].slice(0, 3)})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Attacks */}
      <div>
        <SectionTitle>Ataques</SectionTitle>
        {weaponAttacks.length === 0 ? (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Nenhuma arma equipada.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-subtle)" }}>
                <th style={{ padding: "4px 6px", fontWeight: 700 }}>Arma</th>
                <th style={{ padding: "4px 6px", fontWeight: 700 }}>Bônus</th>
                <th style={{ padding: "4px 6px", fontWeight: 700 }}>Dano / Tipo</th>
              </tr>
            </thead>
            <tbody>
              {weaponAttacks.map((atk) => (
                <tr key={atk.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "4px 6px", color: "var(--text)" }}>{atk.name}</td>
                  <td style={{ padding: "4px 6px", color: "var(--text)" }}>{signed(atk.atkMod)}</td>
                  <td style={{ padding: "4px 6px", color: "var(--text)" }}>{atk.w.damage}{signed(atk.dmgMod)} / {atk.w.damageType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Equipment + currency */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div>
          <SectionTitle>Equipamento</SectionTitle>
          <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.7 }}>
            {equippedItems.map((e) => `${e.itemName}${e.quantity > 1 ? ` (x${e.quantity})` : ""} [equipado]`).concat(
              otherItems.map((e) => `${e.itemName}${e.quantity > 1 ? ` (x${e.quantity})` : ""}`)
            ).join(", ") || "—"}
          </p>
        </div>
        <div>
          <SectionTitle>Tesouro</SectionTitle>
          <div style={{ fontSize: "0.82rem", color: "var(--text)" }}>
            {currency.pp > 0 && <div>{currency.pp} PL</div>}
            {currency.gp > 0 && <div>{currency.gp} PO</div>}
            {currency.ep > 0 && <div>{currency.ep} PE</div>}
            {currency.sp > 0 && <div>{currency.sp} PP</div>}
            {currency.cp > 0 && <div>{currency.cp} PC</div>}
            {currency.pp + currency.gp + currency.ep + currency.sp + currency.cp === 0 && "—"}
          </div>
        </div>
      </div>

      {/* Proficiencies */}
      <div>
        <SectionTitle>Idiomas e Outras Proficiências</SectionTitle>
        <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.7 }}>
          {desc.languages && desc.languages.length > 0 && <><strong>Idiomas:</strong> {desc.languages.join(", ")}<br /></>}
          {armorProficiencies.length > 0 && <><strong>Armaduras:</strong> {armorProficiencies.join(", ")}<br /></>}
          {weaponProficiencies.length > 0 && <><strong>Armas:</strong> {weaponProficiencies.join(", ")}<br /></>}
          {toolProficiencies.length > 0 && <><strong>Ferramentas:</strong> {toolProficiencies.join(", ")}</>}
        </p>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div>
          <SectionTitle>Características e Habilidades</SectionTitle>
          <ul style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.7, paddingLeft: 18 }}>
            {features.map((f) => (
              <li key={f.id}><strong>{f.name}</strong>{f.source ? ` (${f.source})` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Personality + appearance + backstory — page 2 */}
      {(hasPersonality || hasAppearance || desc.backstory) && (
        <div style={{ breakBefore: "page", paddingTop: 8 }}>
          <SectionTitle>Personalidade e História</SectionTitle>

          {hasPersonality && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
              {desc.personalityTrait && <Field heading="Traço de Personalidade">{desc.personalityTrait}</Field>}
              {desc.ideal && <Field heading="Ideal">{desc.ideal}</Field>}
              {desc.bond && <Field heading="Vínculo">{desc.bond}</Field>}
              {desc.flaw && <Field heading="Defeito">{desc.flaw}</Field>}
            </div>
          )}

          {hasAppearance && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 14 }}>
              {desc.age    && <Field heading="Idade">{desc.age}</Field>}
              {desc.height && <Field heading="Altura">{desc.height}</Field>}
              {desc.weight && <Field heading="Peso">{desc.weight}</Field>}
              {desc.eyes   && <Field heading="Olhos">{desc.eyes}</Field>}
              {desc.skin   && <Field heading="Pele">{desc.skin}</Field>}
              {desc.hair   && <Field heading="Cabelo">{desc.hair}</Field>}
            </div>
          )}

          {desc.backstory && (
            <div style={box}>
              <div style={label}>História do Personagem</div>
              <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{desc.backstory}</p>
            </div>
          )}
        </div>
      )}

      {/* Spellcasting — page 3 */}
      {isCaster && (
        <div style={{ breakBefore: "page", paddingTop: 8 }}>
          <SectionTitle>Magias</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            <Field heading="Habilidade Chave">{spellAbilityLabel}</Field>
            <Field heading="CD do Teste de Resistência">{spellSaveDC}</Field>
            <Field heading="Bônus de Ataque">{signed(spellAttackBonus)}</Field>
          </div>

          {cantrips.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={label}>Truques</div>
              <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.7 }}>
                {cantrips.map((s) => s.spellName).join(", ")}
              </p>
            </div>
          )}

          {spellsByLevel.map(({ level: lvl, slots, used, list }) => (
            <div key={lvl} style={{ marginBottom: 12, ...box }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={label}>Nível {lvl}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Espaços: {slots - used}/{slots}</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.7 }}>
                {list.length > 0 ? list.map((s) => `${s.spellName}${s.prepared ? " (preparada)" : ""}`).join(", ") : "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <footer style={{ fontSize: "0.68rem", color: "var(--text-subtle)", textAlign: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        RPG Lab — Ficha gerada digitalmente
      </footer>
    </div>
    </div>
  );
}
