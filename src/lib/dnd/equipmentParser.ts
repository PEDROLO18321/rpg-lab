import type { WeaponCategory } from "./equipmentData";

export type SubSelection = {
  category: WeaponCategory;
  label:    string;
  count:    number; // how many picks (1 or 2 for "duas armas")
};

export type EquipmentChoice = {
  letter: string;
  label:  string;
  sub?:   SubSelection;
};

export type EquipmentLine =
  | { type: "fixed";  text: string }
  | { type: "choice"; choices: EquipmentChoice[] };

function detectSub(text: string): SubSelection | undefined {
  const t = text.toLowerCase();

  // Detect count of weapons wanted
  const countMatch = t.match(/(\bum\b|\bduas?\b|\btrês\b|\bcinco\b)/);
  let count = 1;
  if (countMatch) {
    const w = countMatch[1];
    if (w === "duas" || w === "dois") count = 2;
    else if (w === "três") count = 3;
    else if (w === "cinco") count = 5;
  }

  if (t.includes("qualquer arma marcial corpo-a-corpo") || t.includes("qualquer arma corpo-a-corpo marcial"))
    return { category: "weapon-martial-melee", label: "Arma Marcial Corpo-a-Corpo", count };
  if (t.includes("qualquer arma simples corpo-a-corpo") || t.includes("qualquer arma corpo-a-corpo simples"))
    return { category: "weapon-simple-melee", label: "Arma Corpo-a-Corpo Simples", count };
  if (t.includes("qualquer arma simples"))
    return { category: "weapon-simple", label: "Arma Simples", count };
  if (t.includes("qualquer arma marcial"))
    return { category: "weapon-martial", label: "Arma Marcial", count };
  if (t.includes("qualquer arma corpo-a-corpo"))
    return { category: "weapon-melee-any", label: "Arma Corpo-a-Corpo", count };
  if (t.includes("qualquer arma"))
    return { category: "weapon-any", label: "Qualquer Arma", count };
  if (t.includes("instrumento musical"))
    return { category: "instrument", label: "Instrumento Musical", count: 1 };
  if (t.includes("foco arcano"))
    return { category: "arcane-focus", label: "Foco Arcano", count: 1 };
  if (t.includes("foco druídico"))
    return { category: "druidic-focus", label: "Foco Druídico", count: 1 };
  if (t.includes("ferramentas de artesão") && t.includes("escolha"))
    return { category: "artisan-tool", label: "Ferramenta de Artesão", count: 1 };

  // Open choices: "uma arma marcial e um escudo" or "duas armas marciais" (without "qualquer")
  if (t.includes("duas armas marciais") || (t.includes("duas") && t.includes("arma marcial")))
    return { category: "weapon-martial", label: "Arma Marcial", count: 2 };
  if (t.includes("duas armas simples") || (t.includes("duas") && t.includes("arma simples")))
    return { category: "weapon-simple", label: "Arma Simples", count: 2 };
  if (t.includes("duas espadas curtas"))
    return { category: "weapon-simple-melee", label: "Arma Corpo-a-Corpo Simples", count: 2 };
  if (t.includes("uma arma marcial e um escudo") || t.includes("arma marcial e escudo"))
    return { category: "weapon-martial", label: "Arma Marcial", count: 1 };

  return undefined;
}

export function parseEquipmentLine(text: string): EquipmentLine {
  if (!text.trimStart().startsWith("(a)")) {
    return { type: "fixed", text };
  }

  // Extract all "(x)" markers and their positions
  const re = /\(([a-z])\)\s*/g;
  const markers: { letter: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    markers.push({ letter: m[1], start: m.index, end: m.index + m[0].length });
  }

  const choices: EquipmentChoice[] = markers.map(({ letter, end }, i) => {
    const nextStart = markers[i + 1]?.start ?? text.length;
    let label = text.slice(end, nextStart).trim();
    // Strip trailing " ou " and trailing comma
    label = label.replace(/,?\s*ou\s*$/, "").replace(/,\s*$/, "").trim();

    const sub = detectSub(label);
    return { letter, label, sub };
  });

  return { type: "choice", choices };
}

/** Resolve all equipment choices into a flat list of item strings */
export function resolveEquipment(
  clsItems: string[],
  bgItems:  string[],
  choices:  Record<string, string>,
): string[] {
  const result: string[] = [];

  function resolve(raw: string, prefix: string, idx: number) {
    const line = parseEquipmentLine(raw);
    if (line.type === "fixed") {
      result.push(line.text);
      return;
    }
    const letter = choices[`${prefix}_${idx}`];
    if (!letter) return;
    const chosen = line.choices.find((c) => c.letter === letter);
    if (!chosen) return;

    if (!chosen.sub) {
      result.push(chosen.label);
    } else {
      const count = chosen.sub.count ?? 1;
      for (let k = 0; k < count; k++) {
        const val = choices[`${prefix}_${idx}_${letter}_${k}`];
        if (val) result.push(val);
      }
    }
  }

  clsItems.forEach((raw, i) => resolve(raw, "cls", i));
  bgItems.forEach((raw,  i) => resolve(raw, "bg",  i));
  return result;
}
