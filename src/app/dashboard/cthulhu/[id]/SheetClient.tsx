"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ExportJsonButton } from "@/components/dashboard/ExportJsonButton";
import {
  SKILLS, ATTR_ABBR, ATTR_LABELS, OCCUPATIONS, WEAPONS,
  getSkillBase, half, fifth, calcDamageBonus, calcCorpo,
  resolveCheck, rollWeaponDamage, rollExpr, rollImprovement, CHECK_LABELS,
  type AttrKey, type CthulhuAttrs, type SkillCheck, type Weapon,
} from "@/lib/cthulhu/data";
import "../cthulhu-responsive.css";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

const ATTR_KEYS: AttrKey[] = ["for", "con", "tam", "des", "apa", "int", "pod", "edu"];

type Sheet = {
  occupation:   string | null;
  era:          string | null;
  age:          number | null;
  atribFor:     number; atribCon: number; atribTam: number;
  atribDes:     number; atribApa: number; atribInt: number;
  atribPod:     number; atribEdu: number;
  sanCurrent:   number; sanMax:   number;
  pvMax:        number; pvCurrent: number;
  luck:         number; mov:      number; pmCurrent: number;
  pvTemp:       number; sanTemp:  number; pmTemp: number;
  skills:       string | null;
  skillChecks:  string | null;
  background:   string | null;
  weapons:      string | null;
  equipment:    string | null;
  notes:        string | null;
  insanityData: string | null;
  spellsData:   string | null;
};

type DevResult = { id: string; name: string; from: number; roll: number; improved: boolean; gain: number; to: number };

const LEVEL_COLOR: Record<string, string> = {
  critico:  "#d4af37",
  extremo:  "#7d9c3e",
  dificil:  "#a3b86c",
  normal:   "#6f8f4f",
  falha:    "#9aa0a6",
  desastre: "#c03030",
};

type RollEntry =
  | { kind: "check"; label: string; check: SkillCheck }
  | { kind: "damage"; label: string; segments: { label?: string; total: number; expr: string; rolls: number[] }[] }
  | { kind: "raw"; label: string; total: number; expr: string; rolls: number[] };

type Character = { id: string; name: string; portraitUrl: string | null; cthulhuSheet: Sheet; system: { name: string }; user?: { name: string | null } | null };

interface Props { character: Character; }

export function SheetClient({ character }: Props) {
  const s = character.cthulhuSheet;

  // ── Editable state ──
  const [name,       setName]       = useState(character.name);
  const [occupation, setOccupation] = useState(s.occupation ?? "");
  const [age,        setAge]        = useState(s.age ?? 25);
  const [era,        setEra]        = useState<"1920s" | "modern">(s.era === "modern" ? "modern" : "1920s");
  const [attrs, setAttrs] = useState<Record<AttrKey, number>>({
    for: s.atribFor, con: s.atribCon, tam: s.atribTam, des: s.atribDes,
    apa: s.atribApa, int: s.atribInt, pod: s.atribPod, edu: s.atribEdu,
  });
  const [pvMax,  setPvMax]  = useState(s.pvMax);
  const [sanMax, setSanMax] = useState(s.sanMax);
  const [mov,    setMov]    = useState(s.mov);

  const [pvCurrent,  setPvCurrent]  = useState(s.pvCurrent);
  const [sanCurrent, setSanCurrent] = useState(s.sanCurrent);
  const [pmCurrent,  setPmCurrent]  = useState(s.pmCurrent);
  const [luck,       setLuck]       = useState(s.luck);
  const [pvTemp,  setPvTemp]  = useState(s.pvTemp  ?? 0);
  const [sanTemp, setSanTemp] = useState(s.sanTemp ?? 0);
  const [pmTemp,  setPmTemp]  = useState(s.pmTemp  ?? 0);

  const [skillPoints, setSkillPoints] = useState<Record<string, number>>(s.skills ? JSON.parse(s.skills) : {});
  const [marked, setMarked] = useState<string[]>(s.skillChecks ? JSON.parse(s.skillChecks) : []);

  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [devOpen,  setDevOpen]  = useState(false);
  const [devResults, setDevResults] = useState<DevResult[] | null>(null);

  const [portrait,       setPortrait]       = useState<string | null>(character.portraitUrl ?? null);
  const [equipmentText,  setEquipmentText]  = useState(s.equipment ?? "");
  const [weaponIds,      setWeaponIds]      = useState<string[]>(s.weapons ? JSON.parse(s.weapons) : []);
  const [editBg,         setEditBg]         = useState<Record<string, string>>(s.background ? JSON.parse(s.background) : {});
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const background = editBg;
  const equipped: Weapon[] = WEAPONS.filter((w) => weaponIds.includes(w.id));

  const attrsFull: CthulhuAttrs = { ...attrs, sorte: luck };
  const pmMax = Math.floor(attrs.pod / 5);

  type InsanityData = { sessionLoss: number; status: "normal" | "temp_insane" | "indef_insane"; phobias: string[]; manias: string[]; notes: string };
  const PHOBIAS_LIST = ["Acrofobia (alturas)", "Agorafobia (espaços abertos)", "Aracnofobia (aranhas)", "Claustrofobia (espaços fechados)", "Cinofobia (cães)", "Entomofobia (insetos)", "Hematofobia (sangue)", "Hidrofobia (água profunda)", "Necrofobia (cadáveres)", "Noctifobia (escuridão)", "Ofidiofobia (cobras)", "Talassofobia (oceano profundo)", "Xenofobia (estranhos/alienígenas)", "Medo de fogo", "Medo de sons estranhos", "Medo de símbolos do Mythos"];
  const MANIAS_LIST  = ["Ablutomania (lavagem compulsiva)", "Aritmomania (contar objetos)", "Bibliofilia (coletar livros)", "Cleptomania (roubar)", "Dipsomania (beber álcool)", "Fascínio por fogo", "Fascínio por símbolos ocultos", "Grafofilia (escrever compulsivamente)", "Hipocondria", "Obsessão por datas e horários", "Obsessão por um Grande Antigo", "Paranoia generalizada", "Sadismo", "Xenofilia (fascínio por estranhos)"];
  const parseInsanity = (): InsanityData => { try { return s.insanityData ? JSON.parse(s.insanityData) : { sessionLoss: 0, status: "normal", phobias: [], manias: [], notes: "" }; } catch { return { sessionLoss: 0, status: "normal", phobias: [], manias: [], notes: "" }; } };
  const [insanity, setInsanityRaw] = useState<InsanityData>(parseInsanity);
  const [phobiaInput, setPhobiaInput] = useState("");
  const [maniaInput, setManiaInput] = useState("");

  function setInsanity(patch: Partial<InsanityData>) {
    const next = { ...insanity, ...patch };
    setInsanityRaw(next);
    patchSheet({ insanityData: next });
  }

  function sanLost(amount: number) {
    const newLoss = insanity.sessionLoss + amount;
    const threshold = Math.floor(sanMax / 5);
    const status: InsanityData["status"] = newLoss >= threshold ? "indef_insane" : amount >= 5 ? "temp_insane" : insanity.status;
    setInsanity({ sessionLoss: newLoss, status });
  }

  function addTag(field: "phobias" | "manias", value: string) {
    const v = value.trim();
    if (!v || insanity[field].includes(v)) return;
    setInsanity({ [field]: [...insanity[field], v] });
  }

  function removeTag(field: "phobias" | "manias", value: string) {
    setInsanity({ [field]: insanity[field].filter((t) => t !== value) });
  }

  type CthulhuSpell = { id: string; name: string; mpCost: number; sanCost: string; castingTime: string; notes: string };
  const parseSpells = (): CthulhuSpell[] => { try { return s.spellsData ? JSON.parse(s.spellsData) : []; } catch { return []; } };
  const [spells, setSpellsRaw] = useState<CthulhuSpell[]>(parseSpells);
  const [spellOpen, setSpellOpen] = useState<"closed" | "manual" | "grimoire">("closed");
  const [spellForm, setSpellForm] = useState<Omit<CthulhuSpell, "id">>({ name: "", mpCost: 1, sanCost: "1", castingTime: "1 rodada", notes: "" });

  const GRIMOIRE_CATALOG: Omit<CthulhuSpell, "id">[] = [
    { name: "Alerta", mpCost: 1, sanCost: "0", castingTime: "5 rodadas", notes: "1 PM por pedra. Conjurador é alertado se alguma pedra for movida." },
    { name: "Banimento de Yde Etad", mpCost: 7, sanCost: "1D4", castingTime: "1 hora+", notes: "Requer 3+ conjuradores (múltiplo de 3). Banir inteligência transdimensional. Teste resistido POD." },
    { name: "Canção de Hastur", mpCost: 4, sanCost: "1D4/rodada", castingTime: "3 rodadas", notes: "1D4 PM/rodada. Visível apenas quando Aldebaran estiver visível. 1D6 dano/rodada ao alvo." },
    { name: "Cântico de Thoth", mpCost: 10, sanCost: "1D4", castingTime: "30 minutos", notes: "Concede dado de bônus em tarefa intelectual específica." },
    { name: "Causar Cegueira", mpCost: 8, sanCost: "2D6", castingTime: "1 dia", notes: "Cegueira permanente. Teste resistido POD. Pode ser revertido com Curar Cegueira." },
    { name: "Curar Cegueira", mpCost: 8, sanCost: "0", castingTime: "1 dia", notes: "Reverte cegueira se olhos/nervos ópticos intactos. Teste resistido POD." },
    { name: "Consumir Semblante", mpCost: 10, sanCost: "1D20", castingTime: "vários dias", notes: "10 PM a cada 6h + 5 POD permanente. Assume aparência de pessoa morta à vontade." },
    { name: "Contactar Abissal", mpCost: 3, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Deve ser conjurado à beira do oceano/mar." },
    { name: "Contactar Carniçal", mpCost: 5, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Perto de cemitérios/criptas antigos. Melhor em noites de lua." },
    { name: "Contactar Chthoniano", mpCost: 5, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Em local com atividade vulcânica/sísmica recente." },
    { name: "Contactar Cão de Tíndalos", mpCost: 7, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Vem automaticamente. Não há como negociar — o cão está faminto." },
    { name: "Contactar Coisa-Rato", mpCost: 2, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Perto de local infestado por Coisas-Rato." },
    { name: "Contactar Espíritos dos Mortos", mpCost: 3, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Tenda de lençóis brancos perto de rio, jarras d'água. Rolar soma dos PM × 5 em d100." },
    { name: "Contactar Gnoph-Keh", mpCost: 6, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Desertos congelados próximos ao Polo Norte. Requer Canto bem-sucedido + efígie de gelo." },
    { name: "Contactar Habitante da Areia", mpCost: 3, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Em deserto adequado (Saara, sudoeste dos EUA, Arábia, Austrália)." },
    { name: "Contactar Mi-Go", mpCost: 8, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "No topo ou base de montanha alta minerada/visitada por Mi-Go." },
    { name: "Contactar Pólipo Voador", mpCost: 9, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Requer abertura/duto para as cidades subterrâneas dos pólipos." },
    { name: "Contactar Prole-Estelar de Cthulhu", mpCost: 6, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "À beira-mar, perto de posto avançado de abissais ou sobre R'lyeh." },
    { name: "Contactar Ser Ancestral", mpCost: 3, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Sul da Cordilheira Mesoatlântica ou fossas oceânicas próximas da Antártida." },
    { name: "Contactar Serviçal dos Deuses Exteriores", mpCost: 14, sanCost: "1D6", castingTime: "5-10 rodadas", notes: "Estrelas visíveis. Requer sacrifício de sangue. Pode transmitir um feitiço ao custo de 1D8 SAN." },
    { name: "Contactar Yithiano", mpCost: 4, sanCost: "1D3", castingTime: "5-10 rodadas", notes: "Só funciona se mente Yithiana estiver a ≤150 km. Responde se curioso/alarmado." },
    { name: "Criar Barreira de Naach-Tith", mpCost: 0, sanCost: "1D10", castingTime: "1 minuto", notes: "PM variável: cada PM = 3D10 FOR para barreira esférica de 100m, dura 1D4+4 horas." },
    { name: "Criar Névoa de R'lyeh", mpCost: 2, sanCost: "0", castingTime: "instantâneo", notes: "Névoa densa oval (3×3×4,5m) por 1D6+4 rodadas." },
    { name: "Criar Zumbi", mpCost: 16, sanCost: "1D6", castingTime: "1 semana", notes: "Líquido ritual sobre cadáver, matura 1 semana. Zumbi apodrece gradualmente." },
    { name: "Decomposição Verde", mpCost: 15, sanCost: "2D8", castingTime: "1 dia", notes: "Também perde 10 POD. Entrega folha verde ao alvo. Teste resistido POD. Apodrecimento em 7 dias." },
    { name: "Deformação Corporal de Gorgoroth", mpCost: 6, sanCost: "2D6", castingTime: "1D6+4 minutos", notes: "Também perde 5 POD. Muda forma física do conjurador permanentemente até reconjurar." },
    { name: "Devastar", mpCost: 3, sanCost: "1", castingTime: "1 rodada", notes: "Incapacita alvo a ≤10m por 1D6 rodadas. Teste resistido POD." },
    { name: "Dissolver a Carne", mpCost: 5, sanCost: "1D6", castingTime: "5 rodadas", notes: "Carne viva: 5 PM por 15 TAM. Carne morta: 1 PM por 15 TAM. 1D4 dano por 15 TAM." },
    { name: "Dominação", mpCost: 1, sanCost: "1", castingTime: "instantâneo", notes: "Controla alvo a ≤10m por 1 rodada. Teste resistido POD. Reconjurável sem limite." },
    { name: "Encantar Apito", mpCost: 5, sanCost: "1D6", castingTime: "1 semana", notes: "Apito de prata encantado convoca Byakhee. Requer rituais noturnos ao longo da semana." },
    { name: "Encantar Faca", mpCost: 10, sanCost: "1D6", castingTime: "1 semana", notes: "Faca ritual que inflige dano máximo em criaturas do Mythos. Eficaz apenas em mãos do criador." },
    { name: "Encantar Flautas", mpCost: 4, sanCost: "1D3", castingTime: "1 hora", notes: "Flautas especiais tocadas harmoniosamente podem suprimir/estimular ações de criaturas do Mythos." },
    { name: "Encantar Livro", mpCost: 0, sanCost: "variável", castingTime: "variável", notes: "PM variável. Imprime feitiços e conhecimento do Mythos em livro. Custo depende do conteúdo." },
    { name: "Enevoar Memória", mpCost: 10, sanCost: "1D2", castingTime: "1 rodada", notes: "Apaga memória de evento específico do alvo. Teste resistido POD. Efeito permanente." },
    { name: "Enfeitiçar Vítima", mpCost: 2, sanCost: "1D6", castingTime: "1 hora", notes: "Alvo entorpecido após contato físico breve. Teste resistido POD. Dura INT horas." },
    { name: "Encarquilhar", mpCost: 0, sanCost: "metade do PM gasto", castingTime: "1 rodada", notes: "PM variável: cada PM inflige 1 ponto de dano ao alvo. Teste resistido POD para metade." },
    { name: "Espelho de Tarkhun Atep", mpCost: 5, sanCost: "1", castingTime: "1 rodada", notes: "Projeta imagem ilusória em espelho visto pelo alvo a qualquer distância." },
    { name: "Feitiço de Morte", mpCost: 24, sanCost: "3D10", castingTime: "1 rodada", notes: "Alvo pega fogo espontaneamente. 1D6 dano na primeira rodada, 1D10 nas seguintes. Teste resistido POD." },
    { name: "Gorgolejo das Profundezas", mpCost: 8, sanCost: "1D6", castingTime: "1 rodada", notes: "Pulmões do alvo enchem de água salgada. Afogamento em CON rodadas. Teste resistido POD." },
    { name: "Implantar Medo", mpCost: 12, sanCost: "1D6", castingTime: "1 rodada", notes: "Alvo foge em pânico para local que considera seguro por 1D6 horas. Teste resistido POD." },
    { name: "Invocar/Vincular Byakhee", mpCost: 0, sanCost: "1D10", castingTime: "variável", notes: "PM variável. Requer apito encantado e Convocar Hastur. Aldebaran visível." },
    { name: "Invocar/Vincular Cria Negra", mpCost: 5, sanCost: "1D6", castingTime: "1D6 horas", notes: "Convoca e tenta controlar uma Cria Negra. Falha no vínculo = criatura livre e hostil." },
    { name: "Invocar/Vincular Espreitador Dimensional", mpCost: 8, sanCost: "1D6", castingTime: "1D6 horas", notes: "Convoca Espreitador Dimensional para servir. Requer testes resistidos de POD para vincular." },
    { name: "Invocar/Vincular Horror Caçador", mpCost: 6, sanCost: "1D6", castingTime: "1 hora", notes: "Conjura Horror Caçador para perseguir alvo específico. Persegue até matar ou ser dispensado." },
    { name: "Invocar/Vincular Noitesguio", mpCost: 4, sanCost: "1D4", castingTime: "30 minutos", notes: "Convoca Noitesguio como espião ou mensageiro. Criaturas pequenas e furtivas do Mythos." },
    { name: "Invocar/Vincular Vampiro de Fogo", mpCost: 7, sanCost: "1D6", castingTime: "1 hora", notes: "Conjura Vampiro de Fogo. Existe apenas em altas temperaturas; desaparece no frio." },
    { name: "Invocar/Vincular Vampiro Estelar", mpCost: 6, sanCost: "1D4", castingTime: "1 hora", notes: "Invisível até sugar sangue. Vínculo falho = ataca o conjurador primeiro." },
    { name: "Maldição da Casca Pútrida", mpCost: 5, sanCost: "10", castingTime: "1 rodada", notes: "Ilusão de apodrecimento físico no alvo visível a todos. −1D10 SAN por rodada. POD resistido." },
    { name: "Maldição Pavorosa de Azathoth", mpCost: 4, sanCost: "1D6", castingTime: "1 rodada", notes: "Drena 3D6 POD permanente do alvo. Teste resistido POD. Alvo reduzido a POD 0 = morto." },
    { name: "Mau Olhado", mpCost: 10, sanCost: "1D4", castingTime: "1 rodada", notes: "Sorte do alvo reduzida à metade (arredonda para baixo) até o amanhecer seguinte." },
    { name: "Onda do Oblívio", mpCost: 30, sanCost: "1D8", castingTime: "1D6 horas", notes: "Gera onda oceânica devastadora. Conjurador deve estar na água. Dano em área massivo." },
    { name: "Palavras de Poder", mpCost: 3, sanCost: "1D6", castingTime: "10 minutos", notes: "Grupo de ouvintes acredita em qualquer afirmação do conjurador por 1D3 dias. POD resistido." },
    { name: "Pó de Ibn-Ghazi", mpCost: 1, sanCost: "0", castingTime: "1 rodada", notes: "Torna criaturas e objetos invisíveis visíveis por 10 batimentos cardíacos. 1 dose por PM." },
    { name: "Pó de Suleiman", mpCost: 10, sanCost: "0", castingTime: "1 rodada", notes: "3 doses. Cada dose inflige 1D20 dano a seres de origem extraterrestre ou transdimensional." },
    { name: "Proteger a Carne", mpCost: 0, sanCost: "1D4", castingTime: "5 rodadas", notes: "PM variável: cada PM concede 1D6 de armadura contra ataques físicos não-mágicos." },
    { name: "Punho de Yog-Sothoth", mpCost: 0, sanCost: "1D6", castingTime: "1 rodada", notes: "PM variável: cada PM = 2D10 FOR de força telecinética. Empurra e derruba alvos a ≤30m." },
    { name: "Rajada Mental", mpCost: 10, sanCost: "1D3", castingTime: "1 rodada", notes: "Inflige −5 SAN permanente ao alvo e causa insanidade temporária. Teste resistido POD." },
    { name: "Repartir o Ka", mpCost: 10, sanCost: "2D10", castingTime: "1 semana por órgão", notes: "Remove órgão vital do próprio corpo (coração, olhos, etc.) e esconde. Torna-se invulnerável naquela área. Perde 5 POD por órgão." },
    { name: "Ressequir Membro", mpCost: 8, sanCost: "1D6", castingTime: "1 rodada", notes: "Murcha braço ou perna do alvo permanentemente. −2D10 CON permanente. Teste resistido POD." },
    { name: "Ressurreição", mpCost: 3, sanCost: "1D10", castingTime: "1 hora", notes: "Reduz cadáver a sais cristalinos, ou reverte o processo se os sais existirem. Corpo deve estar intacto." },
    { name: "Símbolo Ancestral", mpCost: 0, sanCost: "0", castingTime: "1 hora", notes: "Custa 10 POD permanente (não PM). Barreira que impede passagem de servos dos Grandes Antigos." },
    { name: "Símbolo Vermelho de Shudde M'ell", mpCost: 3, sanCost: "1D8", castingTime: "3 rodadas", notes: "Símbolo ativo causa 1D3 dano/rodada em 10m e 1 dano em 30m. PM por rodada mantido." },
    { name: "Símbolo Vooriano", mpCost: 5, sanCost: "1D4", castingTime: "1 hora", notes: "Símbolo gravado causa 1D10 SAN a quem o vê. Guardião determina condições exatas." },
    { name: "Sugestão Mental", mpCost: 5, sanCost: "1D3", castingTime: "1 rodada", notes: "Compele alvo a executar sugestão por INT rodadas. Cada 5 PM extras = 1D3 SAN a mais ao custo." },
    { name: "Transferência Mental", mpCost: 10, sanCost: "1D10", castingTime: "1D6 horas", notes: "Troca corpos permanentemente com o alvo. Custa 5 POD permanente. Alvo morre se resistir." },
    { name: "Troca de Mentes", mpCost: 0, sanCost: "1D3", castingTime: "1 hora", notes: "PM variável. Troca temporária de consciência com alvo que deve ter afeição pelo conjurador." },
    { name: "Criar Portal", mpCost: 0, sanCost: "1/uso", castingTime: "1D6 horas", notes: "PM variável (mín. 10). Porta permanente entre dois locais. Pode ser de mão única ou dupla." },
    { name: "Encontrar Portal", mpCost: 1, sanCost: "1D3", castingTime: "5 minutos", notes: "Revela portais ativos num raio de INT metros. Indica direção e distância de cada um." },
    { name: "Vislumbrar Portal", mpCost: 3, sanCost: "1D3", castingTime: "1 rodada", notes: "Espia através de portal ativo como se estivesse do outro lado, sem passar fisicamente." },
  ];

  function saveSpells(next: CthulhuSpell[]) {
    setSpellsRaw(next);
    patchSheet({ spellsData: next });
  }
  function addSpell() {
    if (!spellForm.name.trim()) return;
    saveSpells([...spells, { ...spellForm, id: crypto.randomUUID() }]);
    setSpellForm({ name: "", mpCost: 1, sanCost: "1", castingTime: "1 rodada", notes: "" });
    setSpellOpen("closed");
  }
  function learnFromGrimoire(entry: Omit<CthulhuSpell, "id">) {
    if (spells.some((sp) => sp.name === entry.name)) return;
    saveSpells([...spells, { ...entry, id: crypto.randomUUID() }]);
  }
  function removeSpell(id: string) { saveSpells(spells.filter((sp) => sp.id !== id)); }

  const [log, setLog] = useState<RollEntry[]>([]);
  function pushLog(entry: RollEntry) {
    setLog((prev) => [entry, ...prev].slice(0, 12));
  }
  function rollCheck(label: string, target: number) {
    pushLog({ kind: "check", label, check: resolveCheck(target) });
  }
  function rollDamage(weapon: Weapon) {
    const segs = rollWeaponDamage(weapon, attrsFull);
    pushLog({
      kind: "damage",
      label: `Dano · ${weapon.name}`,
      segments: segs.map((sg) => ({ label: sg.label, total: sg.result.total, expr: sg.result.expr, rolls: sg.result.rolls })),
    });
  }

  const occ  = OCCUPATIONS.find((o) => o.id === occupation);
  const eraLabel = era === "modern" ? "Moderno" : "Anos 1920";

  const allSkills = SKILLS
    .filter((sk) => sk.id !== "nivel_credito")
    .map((sk) => ({
      ...sk,
      base:  getSkillBase(sk, attrs.edu, attrs.des),
      total: getSkillBase(sk, attrs.edu, attrs.des) + (skillPoints[sk.id] ?? 0),
      added: skillPoints[sk.id] ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));

  const patchSheet = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    await fetch(`/api/cthulhu/characters/${character.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).finally(() => setSaving(false));
  }, [character.id]);

  // ── Vital changes (temp absorbs damage first, D&D-style) ──
  function changeVital(
    delta: number,
    cur: number, setCur: (n: number) => void, curKey: string,
    temp: number, setTemp: (n: number) => void, tempKey: string,
    max: number,
  ) {
    if (delta < 0) {
      let dmg = -delta;
      let t = temp;
      if (t > 0) { const absorbed = Math.min(t, dmg); t -= absorbed; dmg -= absorbed; }
      const nc = Math.max(0, cur - dmg);
      setTemp(t); setCur(nc);
      patchSheet({ [curKey]: nc, [tempKey]: t });
    } else {
      const nc = Math.min(max, cur + delta);
      setCur(nc);
      patchSheet({ [curKey]: nc });
    }
  }
  function changeTemp(delta: number, temp: number, setTemp: (n: number) => void, key: string) {
    const nt = Math.max(0, temp + delta);
    setTemp(nt);
    patchSheet({ [key]: nt });
  }
  function adjustLuck(delta: number) {
    const next = Math.max(0, Math.min(99, luck + delta));
    setLuck(next);
    patchSheet({ luck: next });
  }

  // ── Portrait upload ──
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPortrait(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Weapon management ──
  function toggleSheetWeapon(id: string) {
    const next = weaponIds.includes(id) ? weaponIds.filter((w) => w !== id) : [...weaponIds, id];
    setWeaponIds(next);
    patchSheet({ weapons: next });
  }

  // ── Development phase ──
  function toggleMark(id: string) {
    const next = marked.includes(id) ? marked.filter((m) => m !== id) : [...marked, id];
    setMarked(next);
    patchSheet({ skillChecks: next });
  }

  function runDevelopment() {
    const results: DevResult[] = [];
    const nextPoints = { ...skillPoints };
    for (const id of marked) {
      const sk = SKILLS.find((x) => x.id === id);
      if (!sk) continue;
      const base = getSkillBase(sk, attrs.edu, attrs.des);
      const from = base + (skillPoints[id] ?? 0);
      const imp  = rollImprovement(from);
      results.push({ id, name: sk.name, from, roll: imp.roll, improved: imp.improved, gain: imp.gain, to: imp.newValue });
      if (imp.improved) nextPoints[id] = Math.max(0, imp.newValue - base);
    }
    setSkillPoints(nextPoints);
    setMarked([]);
    setDevResults(results);
    patchSheet({ skills: nextPoints, skillChecks: [] });
  }

  // ── Save edits ──
  function saveEdits() {
    patchSheet({
      name,
      occupation: occupation || null,
      age,
      era,
      atribFor: attrs.for, atribCon: attrs.con, atribTam: attrs.tam, atribDes: attrs.des,
      atribApa: attrs.apa, atribInt: attrs.int, atribPod: attrs.pod, atribEdu: attrs.edu,
      pvMax, sanMax, mov,
      skills: skillPoints,
      portraitUrl: portrait,
      weapons: weaponIds,
      equipment: equipmentText || null,
      background: Object.keys(editBg).length > 0 ? editBg : null,
    });
    // clamp currents to new maxes
    setPvCurrent((c) => Math.min(c, pvMax));
    setSanCurrent((c) => Math.min(c, sanMax));
    setPmCurrent((c) => Math.min(c, pmMax));
    setEditMode(false);
    setWeaponPickerOpen(false);
  }

  function setAttr(k: AttrKey, v: number) {
    setAttrs((p) => ({ ...p, [k]: Math.max(0, Math.min(99, v || 0)) }));
  }
  function setSkillTotal(id: string, base: number, total: number) {
    setSkillPoints((p) => ({ ...p, [id]: Math.max(0, (total || 0) - base) }));
  }

  const sanPct = Math.max(0, Math.min(100, (sanCurrent / sanMax) * 100));
  const pvPct  = Math.max(0, Math.min(100, (pvCurrent  / pvMax)  * 100));

  const sanColor = sanPct > 60 ? ACCENT : sanPct > 30 ? "#c9941f" : "#c03030";
  const pvColor  = pvPct  > 60 ? ACCENT : pvPct  > 30 ? "#c9941f" : "#c03030";

  const bgLabels: Record<string, string> = {
    personalDescription:  "Descrição Pessoal",
    ideology:             "Ideologia / Crenças",
    significantPeople:    "Pessoas Significativas",
    meaningfulLocations:  "Locais Importantes",
    treasuredPossessions: "Pertences Queridos",
    traits:               "Características",
    backstory:            "História",
    injuries:             "Ferimentos e Cicatrizes",
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={character.user?.name ?? "Investigador"}
        systemName="Call of Cthulhu"
        systemHref="/dashboard/cthulhu/jogador"
        backLabel="Investigadores"
        accentColor={ACCENT}
        // onExportPdf={() => window.print()} — export em PDF desativado do visual por ora
      />

      <div className="no-print" style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        {saving && <span style={{ fontSize: "0.74rem", color: ACCENT_LIGHT }}>Salvando…</span>}
        <button
          onClick={() => { setDevOpen(true); setDevResults(null); }}
          style={{ ...pillBtn, background: "var(--surface-2)" }}
          title="Fase de Desenvolvimento"
        >
          📈 Desenvolvimento
        </button>
        {editMode ? (
          <button onClick={saveEdits} style={{ ...pillBtn, background: ACCENT, color: "#06090f", border: "none" }}>
            ✓ Salvar
          </button>
        ) : (
          <button onClick={() => setEditMode(true)} style={{ ...pillBtn, background: "var(--surface-2)" }}>
            ✎ Editar
          </button>
        )}
        <ExportJsonButton exportUrl={`/api/cthulhu/characters/${character.id}/export`} characterName={character.name} systemSlug="cthulhu" style={pillBtn} />
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <span className="section-label" style={{ display: "block", marginBottom: 6, color: ACCENT }}>
              Call of Cthulhu 7ª Edição · {eraLabel}
            </span>
            {editMode ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Portrait upload */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 90, height: 90, borderRadius: "var(--radius-lg)", border: `1px solid ${ACCENT_BORD}`, background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {portrait
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={portrait} alt="Retrato" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textAlign: "center", padding: 6 }}>Sem foto</span>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} style={{ ...pillBtn, fontSize: "0.68rem", padding: "3px 10px" }}>Trocar foto</button>
                  {portrait && <button onClick={() => setPortrait(null)} style={{ ...pillBtn, fontSize: "0.68rem", padding: "3px 10px", color: "#e06c6c" }}>Remover</button>}
                </div>
                {/* Identity fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 220 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" style={editInput} />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <select value={occupation} onChange={(e) => setOccupation(e.target.value)} style={{ ...editInput, flex: 1 }}>
                      <option value="">Sem ocupação</option>
                      {OCCUPATIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <select value={era} onChange={(e) => setEra(e.target.value as "1920s" | "modern")} style={{ ...editInput, width: 130 }}>
                      <option value="1920s">Anos 1920</option>
                      <option value="modern">Moderno</option>
                    </select>
                    <input type="number" min={15} max={90} value={age} onChange={(e) => setAge(Math.max(0, parseInt(e.target.value) || 0))} style={{ ...editInput, width: 80 }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {portrait && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portrait} alt="Retrato" style={{ width: 72, height: 72, borderRadius: "var(--radius-lg)", objectFit: "cover", border: `1px solid ${ACCENT_BORD}`, flexShrink: 0 }} />
                )}
                <div>
                  <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--text)" }}>
                    {name}
                  </h1>
                  <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 4 }}>
                    {occ?.name ?? occupation ?? "Sem ocupação"} · {age ? `${age} anos` : "Idade desconhecida"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vitals trackers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
          <Tracker
            label="Pontos de Vida"
            current={pvCurrent} temp={pvTemp} max={pvMax} pct={pvPct} barColor={pvColor}
            onDelta={(d) => changeVital(d, pvCurrent, setPvCurrent, "pvCurrent", pvTemp, setPvTemp, "pvTemp", pvMax)}
            onTemp={(d) => changeTemp(d, pvTemp, setPvTemp, "pvTemp")}
          />
          <Tracker
            label="Sanidade"
            current={sanCurrent} temp={sanTemp} max={sanMax} pct={sanPct} barColor={sanColor}
            onDelta={(d) => { if (d < 0) sanLost(-d); changeVital(d, sanCurrent, setSanCurrent, "sanCurrent", sanTemp, setSanTemp, "sanTemp", sanMax); }}
            onTemp={(d) => changeTemp(d, sanTemp, setSanTemp, "sanTemp")}
            onRoll={() => rollCheck(`Teste de Sanidade (${sanCurrent}%)`, sanCurrent)}
          />
          <Tracker
            label="Pontos de Magia"
            current={pmCurrent} temp={pmTemp} max={pmMax} pct={pmMax ? Math.max(0, (pmCurrent / pmMax) * 100) : 0} barColor={ACCENT}
            onDelta={(d) => changeVital(d, pmCurrent, setPmCurrent, "pmCurrent", pmTemp, setPmTemp, "pmTemp", pmMax)}
            onTemp={(d) => changeTemp(d, pmTemp, setPmTemp, "pmTemp")}
          />
          <Tracker
            label="Sorte"
            current={luck} max={99} pct={luck} barColor="var(--text-subtle)"
            onDelta={(d) => adjustLuck(d > 0 ? 5 : -5)}
            stepLabel="±5"
            onRoll={() => rollCheck(`Sorte (${luck}%)`, luck)}
          />
        </div>

        <div className="cth-view-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Attributes */}
          <Section title="Atributos">
            {ATTR_KEYS.map((k) => {
              const v = attrs[k];
              if (editMode) {
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ width: 40, fontSize: "0.74rem", fontWeight: 700, color: ACCENT_LIGHT }}>{ATTR_ABBR[k]}</span>
                    <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-muted)" }}>{ATTR_LABELS[k]}</span>
                    <input type="number" min={0} max={99} value={v} onChange={(e) => setAttr(k, parseInt(e.target.value))} style={{ ...editInput, width: 70, textAlign: "center" }} />
                  </div>
                );
              }
              return (
                <button
                  key={k}
                  onClick={() => rollCheck(`${ATTR_LABELS[k]} (${v}%)`, v)}
                  title={`Rolar teste de ${ATTR_LABELS[k]}`}
                  style={{
                    width: "100%", textAlign: "left", cursor: "pointer", background: "transparent",
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 6px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)", borderTop: "none", borderLeft: "none", borderRight: "none",
                    borderRadius: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_DIM)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ width: 40, fontSize: "0.74rem", fontWeight: 700, color: ACCENT_LIGHT }}>{ATTR_ABBR[k]}</span>
                  <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-muted)" }}>{ATTR_LABELS[k]}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: "var(--text)", minWidth: 32, textAlign: "right" }}>{v}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", minWidth: 40, textAlign: "right" }}>½ {half(v)}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>⅕ {fifth(v)}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>🎲</span>
                </button>
              );
            })}
          </Section>

          {/* Derived stats */}
          <Section title="Dados Secundários">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Dano Extra</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{calcDamageBonus(attrsFull)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Corpo</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{calcCorpo(attrsFull)}</span>
            </div>
            <EditableStat label="MOV"        value={mov}    editMode={editMode} onChange={(n) => setMov(Math.max(0, n))} />
            <EditableStat label="PV Máximo"  value={pvMax}  editMode={editMode} onChange={(n) => setPvMax(Math.max(1, n))} />
            <EditableStat label="SAN Máximo" value={sanMax} editMode={editMode} onChange={(n) => setSanMax(Math.max(0, Math.min(99, n)))} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>PM Máximo</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{pmMax}</span>
            </div>
          </Section>
        </div>

        {/* Skills */}
        <Section title="Perícias">
          <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 10, lineHeight: 1.5 }}>
            {editMode
              ? "Modo edição: ajuste o valor total de cada perícia."
              : <>Clique para rolar. Marque <b style={{ color: ACCENT_LIGHT }}>◼</b> a perícia ao ter sucesso — na Fase de Desenvolvimento elas podem subir 1D10. {marked.length > 0 && <span style={{ color: ACCENT_LIGHT }}>({marked.length} marcada{marked.length > 1 ? "s" : ""})</span>}</>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 4 }}>
            {allSkills.map((sk) => {
              const isMarked = marked.includes(sk.id);
              if (editMode) {
                return (
                  <div key={sk.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px" }}>
                    <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--text-muted)" }}>{sk.name}</span>
                    <input
                      type="number" min={0} max={99} value={sk.total}
                      onChange={(e) => setSkillTotal(sk.id, sk.base, parseInt(e.target.value))}
                      style={{ ...editInput, width: 64, textAlign: "center" }}
                    />
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>base {sk.base}</span>
                  </div>
                );
              }
              return (
                <div
                  key={sk.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
                    background: sk.added > 0 ? ACCENT_DIM : "transparent",
                    border: `1px solid ${isMarked ? ACCENT_BORD : sk.added > 0 ? "rgba(125,156,62,0.15)" : "transparent"}`,
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  <button
                    onClick={() => toggleMark(sk.id)}
                    title={isMarked ? "Desmarcar" : "Marcar como usada com sucesso"}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: isMarked ? ACCENT_LIGHT : "var(--text-subtle)", padding: "0 2px" }}
                  >
                    {isMarked ? "◼" : "◻"}
                  </button>
                  <button
                    onClick={() => rollCheck(`${sk.name} (${sk.total}%)`, sk.total)}
                    title={`Rolar teste de ${sk.name}`}
                    style={{ flex: 1, textAlign: "left", cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}
                  >
                    <span style={{ flex: 1, fontSize: "0.78rem", color: sk.added > 0 ? "var(--text)" : "var(--text-muted)" }}>{sk.name}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: sk.added > 0 ? ACCENT_LIGHT : "var(--text-subtle)" }}>{sk.total}%</span>
                    <span style={{ fontSize: "0.67rem", color: "var(--text-subtle)", minWidth: 30, textAlign: "right" }}>½ {half(sk.total)}</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>🎲</span>
                  </button>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Weapons */}
        {(equipped.length > 0 || editMode) && (
          <Section title="Armas">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {equipped.map((w) => {
                const skillTot = getSkillBase(SKILLS.find((sk) => sk.id === w.skillId)!, attrs.edu, attrs.des) + (skillPoints[w.skillId] ?? 0);
                return (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>{w.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>
                        {w.skillName} {skillTot}% · dano {w.damage}{w.addDB ? "+DX" : ""}{w.halfDB ? "+½DX" : ""} · {w.range}
                      </div>
                    </div>
                    {editMode ? (
                      <button onClick={() => toggleSheetWeapon(w.id)} style={{ ...pillBtn, color: "#e06c6c", borderColor: "rgba(220,60,60,0.3)", background: "rgba(220,60,60,0.08)" }}>
                        × Remover
                      </button>
                    ) : (
                      <>
                        <button onClick={() => rollCheck(`Ataque · ${w.name} (${skillTot}%)`, skillTot)} style={pillBtn}>
                          🎯 Atacar
                        </button>
                        <button onClick={() => rollDamage(w)} style={{ ...pillBtn, color: "#e0b94e", borderColor: "rgba(224,185,78,0.4)" }}>
                          🎲 Dano
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {editMode && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => setWeaponPickerOpen((o) => !o)}
                    style={{ ...pillBtn, color: ACCENT_LIGHT, borderColor: ACCENT_BORD, background: ACCENT_DIM, padding: "7px 16px" }}
                  >
                    {weaponPickerOpen ? "Fechar lista" : "+ Adicionar arma"}
                  </button>
                  {weaponPickerOpen && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 14 }}>
                      {(["corpo", "arremesso", "pistola", "rifle", "espingarda"] as const).map((cat) => {
                        const list = WEAPONS.filter((w) => w.category === cat && !weaponIds.includes(w.id));
                        if (!list.length) return null;
                        const catLabel: Record<string, string> = { corpo: "Corpo a Corpo", arremesso: "Arremesso", pistola: "Pistolas", rifle: "Rifles", espingarda: "Espingardas" };
                        return (
                          <div key={cat}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{catLabel[cat]}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 5 }}>
                              {list.map((w) => (
                                <button
                                  key={w.id}
                                  onClick={() => toggleSheetWeapon(w.id)}
                                  style={{ textAlign: "left", padding: "7px 10px", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)", cursor: "pointer" }}
                                >
                                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text)" }}>{w.name}</div>
                                  <div style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginTop: 1 }}>
                                    {w.damage}{w.addDB ? "+DX" : ""}{w.halfDB ? "+½DX" : ""} · {w.range}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Equipment / notes */}
        {(equipmentText.trim() || editMode) && (
          <Section title="Equipamento e Posses">
            {editMode ? (
              <textarea
                value={equipmentText}
                onChange={(e) => setEquipmentText(e.target.value)}
                rows={5}
                placeholder={"Lanterna elétrica\nKit de primeiros socorros\nCâmera fotográfica\n..."}
                style={{ ...editInput, width: "100%", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
              />
            ) : (
              <pre style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
                {equipmentText.trim()}
              </pre>
            )}
          </Section>
        )}

        {/* Insanidade */}
        <Section title="Insanidade">
          {(() => {
            const threshold = Math.floor(sanMax / 5);
            const statusColor = insanity.status === "normal" ? ACCENT : insanity.status === "temp_insane" ? "#fbbf24" : "#f87171";
            const statusLabel = insanity.status === "normal" ? "Normal" : insanity.status === "temp_insane" ? "Temporariamente Insano" : "Indefinidamente Insano";
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Status + session loss */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: statusColor, background: `${statusColor}22`, border: `1px solid ${statusColor}44`, borderRadius: "var(--radius-xs)", padding: "4px 12px" }}>
                    {statusLabel}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Perda sessão:</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: insanity.sessionLoss >= threshold ? "#f87171" : "var(--text)" }}>{insanity.sessionLoss}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>/ {threshold} (SAN/5)</span>
                    {insanity.sessionLoss >= threshold && <span style={{ fontSize: "0.68rem", color: "#f87171" }}>— LIMITE</span>}
                  </div>
                  <button onClick={() => setInsanity({ sessionLoss: 0, status: "normal" })} title="Resetar para nova sessão" style={{ ...pillBtn, fontSize: "0.7rem" }}>↺ Nova Sessão</button>
                </div>
                {/* Manual loss input */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Lançar perda manual:</span>
                  {[1, 2, 3, 5, 8].map((n) => (
                    <button key={n} onClick={() => sanLost(n)} style={{ ...pillBtn, fontSize: "0.72rem", padding: "3px 10px" }}>−{n} SAN</button>
                  ))}
                </div>
                {/* Status override */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["normal", "temp_insane", "indef_insane"] as const).map((s) => {
                    const c = s === "normal" ? ACCENT : s === "temp_insane" ? "#fbbf24" : "#f87171";
                    const l = s === "normal" ? "Normal" : s === "temp_insane" ? "Temp. Insano" : "Indef. Insano";
                    return (
                      <button key={s} onClick={() => setInsanity({ status: s })} style={{ padding: "5px 12px", borderRadius: "var(--radius)", border: `1px solid ${insanity.status === s ? c : "var(--border)"}`, background: insanity.status === s ? `${c}22` : "transparent", color: insanity.status === s ? c : "var(--text-muted)", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
                {/* Phobias */}
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Fobias</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {insanity.phobias.map((p) => (
                      <span key={p} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fca5a5" }}>
                        {p}
                        <button onClick={() => removeTag("phobias", p)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value="" onChange={(e) => addTag("phobias", e.target.value)} style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      <option value="">Escolher fobia...</option>
                      {PHOBIAS_LIST.filter((p) => !insanity.phobias.includes(p)).map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input value={phobiaInput} onChange={(e) => setPhobiaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addTag("phobias", phobiaInput); setPhobiaInput(""); } }} placeholder="Fobia personalizada..." style={{ padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.82rem", width: 180 }} />
                    <button onClick={() => { addTag("phobias", phobiaInput); setPhobiaInput(""); }} style={{ ...pillBtn }}>+</button>
                  </div>
                </div>
                {/* Manias */}
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Manias</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {insanity.manias.map((m) => (
                      <span key={m} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fde68a" }}>
                        {m}
                        <button onClick={() => removeTag("manias", m)} style={{ background: "transparent", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value="" onChange={(e) => addTag("manias", e.target.value)} style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      <option value="">Escolher mania...</option>
                      {MANIAS_LIST.filter((m) => !insanity.manias.includes(m)).map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input value={maniaInput} onChange={(e) => setManiaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addTag("manias", maniaInput); setManiaInput(""); } }} placeholder="Mania personalizada..." style={{ padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.82rem", width: 180 }} />
                    <button onClick={() => { addTag("manias", maniaInput); setManiaInput(""); }} style={{ ...pillBtn }}>+</button>
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Notas de Insanidade</div>
                  <textarea value={insanity.notes} onChange={(e) => setInsanity({ notes: e.target.value })} placeholder="Episódios, alucinações, traumas..." style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", lineHeight: 1.6, resize: "vertical", minHeight: 70, boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              </div>
            );
          })()}
        </Section>

        {/* Feitiços */}
        <Section title="Feitiços Conhecidos">
          <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 12, lineHeight: 1.5 }}>
            Feitiços aprendidos durante o jogo (de tomos, cultistas, entidades). Cada conjuração consome PM e pode custar Sanidade.
          </div>
          {spells.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {spells.map((sp) => {
                const mythosTotal = allSkills.find((sk) => sk.id === "mythos")?.total ?? 0;
                return (
                  <div key={sp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: ACCENT_LIGHT }}>{sp.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2 }}>
                        <span style={{ marginRight: 10 }}>PM: <b style={{ color: "var(--text)" }}>{sp.mpCost}</b></span>
                        <span style={{ marginRight: 10 }}>SAN: <b style={{ color: "#f87171" }}>−{sp.sanCost}</b></span>
                        <span>Tempo: <b style={{ color: "var(--text)" }}>{sp.castingTime}</b></span>
                      </div>
                      {sp.notes && <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 3 }}>{sp.notes}</div>}
                    </div>
                    <button
                      onClick={() => { rollCheck(`Conjurar · ${sp.name} (Mythos ${mythosTotal}%)`, mythosTotal); }}
                      style={{ ...pillBtn, color: ACCENT_LIGHT, borderColor: ACCENT_BORD, background: ACCENT_DIM }}
                      title={`Rolar Mythos ${mythosTotal}% para conjurar`}
                    >
                      🎲 Conjurar
                    </button>
                    <button
                      onClick={() => removeSpell(sp.id)}
                      style={{ ...pillBtn, color: "#e06c6c", borderColor: "rgba(220,60,60,0.3)", background: "rgba(220,60,60,0.08)", fontSize: "0.72rem" }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {spells.length === 0 && !spellOpen && (
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: 12 }}>
              Nenhum feitiço aprendido ainda. Aprenda durante o jogo ao ler tomos ou contactar entidades.
            </p>
          )}
          {spellOpen === "grimoire" && (
            <div style={{ padding: "14px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>Grimório — Feitiços Canônicos</span>
                <button onClick={() => setSpellOpen("closed")} style={{ ...pillBtn, fontSize: "0.72rem" }}>Fechar</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 340, overflowY: "auto" }}>
                {GRIMOIRE_CATALOG.map((entry) => {
                  const already = spells.some((sp) => sp.name === entry.name);
                  return (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: already ? ACCENT_DIM : "var(--surface)", border: `1px solid ${already ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: already ? ACCENT_LIGHT : "var(--text)" }}>{entry.name}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 1 }}>
                          PM: <b>{entry.mpCost}</b> · SAN: <b style={{ color: "#f87171" }}>−{entry.sanCost}</b> · {entry.castingTime}
                        </div>
                        {entry.notes && <div style={{ fontSize: "0.65rem", color: "var(--text-subtle)", marginTop: 1, lineHeight: 1.4 }}>{entry.notes}</div>}
                      </div>
                      <button
                        onClick={() => learnFromGrimoire(entry)}
                        disabled={already}
                        style={{ ...pillBtn, fontSize: "0.72rem", opacity: already ? 0.5 : 1, cursor: already ? "default" : "pointer", color: already ? "var(--text-muted)" : ACCENT_LIGHT, borderColor: already ? "var(--border)" : ACCENT_BORD, background: already ? "transparent" : ACCENT_DIM }}
                      >
                        {already ? "Aprendido" : "+ Aprender"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {spellOpen === "manual" && (
            <div style={{ padding: "14px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="cth-spell-form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Nome do Feitiço
                  <input value={spellForm.name} onChange={(e) => setSpellForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Chamar Cthulhu" style={{ ...editInput }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Custo PM
                  <input type="number" min={0} value={spellForm.mpCost} onChange={(e) => setSpellForm((f) => ({ ...f, mpCost: Math.max(0, Number(e.target.value)) }))} style={{ ...editInput }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Perda SAN
                  <input value={spellForm.sanCost} onChange={(e) => setSpellForm((f) => ({ ...f, sanCost: e.target.value }))} placeholder="Ex: 1d6" style={{ ...editInput }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Tempo
                  <input value={spellForm.castingTime} onChange={(e) => setSpellForm((f) => ({ ...f, castingTime: e.target.value }))} placeholder="Ex: 1 rodada" style={{ ...editInput }} />
                </label>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Notas / Efeito
                <textarea value={spellForm.notes} onChange={(e) => setSpellForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Descrição do efeito, requisitos especiais..." rows={2} style={{ ...editInput, resize: "vertical", lineHeight: 1.5 }} />
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setSpellOpen("closed")} style={{ ...pillBtn }}>Cancelar</button>
                <button onClick={addSpell} style={{ ...pillBtn, background: ACCENT, color: "#06090f", border: "none" }}>Adicionar Feitiço</button>
              </div>
            </div>
          )}
          {spellOpen === "closed" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSpellOpen("grimoire")} style={{ ...pillBtn, padding: "7px 16px", color: ACCENT_LIGHT, borderColor: ACCENT_BORD, background: ACCENT_DIM }}>📖 Do Grimório</button>
              <button onClick={() => setSpellOpen("manual")} style={{ ...pillBtn, padding: "7px 16px" }}>+ Personalizado</button>
            </div>
          )}
        </Section>

        {/* Background */}
        {(Object.keys(background).length > 0 || editMode) && (
          <Section title="Antecedentes">
            {editMode ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {Object.keys(bgLabels).map((k) => (
                  <label key={k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{bgLabels[k]}</span>
                    <textarea
                      value={editBg[k] ?? ""}
                      onChange={(e) => setEditBg((prev) => ({ ...prev, [k]: e.target.value }))}
                      rows={3}
                      style={{ ...editInput, resize: "vertical", lineHeight: 1.5 }}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {Object.entries(background).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {bgLabels[k] ?? k}
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </main>

      {devOpen && (
        <div
          onClick={() => setDevOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 460, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}
          >
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>Fase de Desenvolvimento</span>
              <button onClick={() => setDevOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {devResults === null ? (
                <>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginTop: 0 }}>
                    Para cada perícia marcada como usada, rola-se 1D100. Se o resultado for <b>maior</b> que o valor atual, ela sobe <b>1D10</b> pontos (máx. 99).
                  </p>
                  {marked.length === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Nenhuma perícia marcada. Marque ◻ as perícias usadas com sucesso durante o jogo.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {marked.map((id) => {
                        const sk = SKILLS.find((x) => x.id === id);
                        return <span key={id} style={{ fontSize: "0.74rem", padding: "3px 10px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-full)", color: ACCENT_LIGHT }}>{sk?.name ?? id}</span>;
                      })}
                    </div>
                  )}
                  <button
                    onClick={runDevelopment}
                    disabled={marked.length === 0}
                    style={{ ...pillBtn, width: "100%", padding: "10px", background: marked.length ? ACCENT : "var(--surface-2)", color: marked.length ? "#06090f" : "var(--text-subtle)", border: "none", cursor: marked.length ? "pointer" : "default" }}
                  >
                    🎲 Rolar Desenvolvimento
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {devResults.map((r) => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: r.improved ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${r.improved ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>{r.name}</span>
                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                          rolou {r.roll} vs {r.from}% · {r.improved ? <b style={{ color: ACCENT_LIGHT }}>+{r.gain} → {r.to}%</b> : <span style={{ color: "var(--text-subtle)" }}>sem ganho</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setDevOpen(false)} style={{ ...pillBtn, width: "100%", padding: "10px", background: ACCENT, color: "#06090f", border: "none" }}>
                    Concluir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <RollPanel log={log} onClear={() => setLog([])} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tracker({
  label, current, temp = 0, max, pct, barColor, onDelta, onTemp, stepLabel, onRoll,
}: {
  label: string; current: number; temp?: number; max: number; pct: number;
  barColor: string; onDelta: (d: number) => void; onTemp?: (d: number) => void;
  stepLabel?: string; onRoll?: () => void;
}) {
  const step = stepLabel === "±5" ? 5 : 1;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        {onRoll && (
          <button onClick={onRoll} title={`Rolar teste de ${label}`} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>🎲</button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <button onClick={() => onDelta(-step)} style={btnStyle}>−</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{current}</span>
          {temp > 0 && <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#5aa9e6" }}> +{temp}</span>}
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}> / {max}</span>
        </div>
        <button onClick={() => onDelta(step)} style={btnStyle}>+</button>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, transition: "width 0.25s ease" }} />
      </div>
      {onTemp ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Temp.</span>
          <button onClick={() => onTemp(-1)} style={miniBtn}>−</button>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: temp > 0 ? "#5aa9e6" : "var(--text-subtle)", minWidth: 16, textAlign: "center" }}>{temp}</span>
          <button onClick={() => onTemp(1)} style={miniBtn}>+</button>
        </div>
      ) : (
        stepLabel && <div style={{ fontSize: "0.66rem", color: "var(--text-subtle)", textAlign: "center", marginTop: 6 }}>{stepLabel}</div>
      )}
    </div>
  );
}

function EditableStat({ label, value, editMode, onChange }: { label: string; value: number; editMode: boolean; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</span>
      {editMode ? (
        <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} style={{ ...editInput, width: 70, textAlign: "center" }} />
      ) : (
        <span style={{ fontSize: "1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{value}</span>
      )}
    </div>
  );
}

const editInput: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  padding: "7px 10px", color: "var(--text)", fontSize: "0.86rem", outline: "none",
};

const miniBtn: React.CSSProperties = {
  width: 22, height: 22, borderRadius: 5, background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center",
};

const btnStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "50%",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text-muted)", cursor: "pointer",
  fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
};

const pillBtn: React.CSSProperties = {
  flexShrink: 0, padding: "5px 12px", borderRadius: "var(--radius-full)",
  background: "var(--surface)", border: "1px solid var(--border)",
  color: "var(--text)", cursor: "pointer", fontSize: "0.74rem", fontWeight: 700,
  whiteSpace: "nowrap",
};

function RollPanel({ log, onClear }: { log: RollEntry[]; onClear: () => void }) {
  if (!log.length) return null;
  return (
    <div style={{
      position: "fixed", right: 18, bottom: 18, zIndex: 60,
      width: 320, maxWidth: "calc(100vw - 36px)",
      background: "rgba(12,14,20,0.97)", backdropFilter: "blur(14px)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-xl)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rolagens</span>
        <button onClick={onClear} style={{ background: "none", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "0.72rem" }}>limpar</button>
      </div>
      <div style={{ maxHeight: 340, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        {log.map((e, i) => <RollRow key={i} entry={e} latest={i === 0} />)}
      </div>
    </div>
  );
}

function RollRow({ entry, latest }: { entry: RollEntry; latest: boolean }) {
  const base: React.CSSProperties = {
    padding: "8px 10px", borderRadius: "var(--radius)",
    background: latest ? "rgba(125,156,62,0.08)" : "var(--surface)",
    border: `1px solid ${latest ? "rgba(125,156,62,0.25)" : "rgba(255,255,255,0.05)"}`,
  };
  if (entry.kind === "check") {
    const c = entry.check;
    const color = LEVEL_COLOR[c.level];
    return (
      <div style={base}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: "0.76rem", color: "var(--text)", flex: 1 }}>{entry.label}</span>
          <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color }}>{c.roll}</span>
        </div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color, marginTop: 2 }}>
          {CHECK_LABELS[c.level]} {c.success ? "✓" : "✗"}
        </div>
      </div>
    );
  }
  if (entry.kind === "damage") {
    return (
      <div style={base}>
        <div style={{ fontSize: "0.76rem", color: "var(--text)", marginBottom: 4 }}>{entry.label}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {entry.segments.map((sg, i) => (
            <span key={i} style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              {sg.label ? `${sg.label}: ` : ""}
              <b style={{ color: "#e0b94e", fontSize: "0.95rem" }}>{sg.total}</b>
              <span style={{ color: "var(--text-subtle)" }}> ({sg.expr})</span>
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={base}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: "0.76rem", color: "var(--text)" }}>{entry.label}</span>
        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#e0b94e" }}>{entry.total}</span>
      </div>
      <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{entry.expr} → [{entry.rolls.join(", ")}]</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}
