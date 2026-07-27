"use client";

import { useState, useMemo } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import "../../../cthulhu-responsive.css";

interface Props { api: CthulhuApi; }

interface CthulhuCreature {
  name: string;
  type: string;
  origin: string;
  str: number;
  con: number;
  siz: number;
  dex: number;
  int: number;
  pow: number;
  hp: number;
  san: string;
  mov: string;
  attacks: string;
  description: string;
  special: string;
}

const BESTIARY: CthulhuCreature[] = [
  { name: "Deep One", type: "Criatura do Mythos", origin: "Raça Ancestral", str: 80, con: 80, siz: 65, dex: 50, int: 60, pow: 50, hp: 14, san: "0/1d6", mov: "8 / 10 nadando", attacks: "Garra (30%, 1d6+1d4 DB) ou Mordida (30%, 1d4+1d4 DB)", description: "Seres anfíbios humanoides que servem a Dagon e Hidra. Vivem nas profundezas dos oceanos e podem se passar por humanos em suas formas juvenis.", special: "Podem se comunicar telepaticamente com outros Deep Ones e com Cthulhu adormecido." },
  { name: "Ghoul", type: "Inumano", origin: "Subterrâneo", str: 80, con: 70, siz: 65, dex: 60, int: 70, pow: 55, hp: 13, san: "0/1d6", mov: "9", attacks: "Garra (35%, 1d4+1d4 DB) ou Mordida (30%, 1d6+1d4 DB)", description: "Humanoides canibais que vivem nas catacumbas e cemitérios. Antiguamente foram humanos que degeneraram ao adotar hábitos ghouls.", special: "Imunes a doenças. Regeneram 1 PV por turno. Conhecem túneis secretos sob as cidades." },
  { name: "Shoggoth", type: "Criatura do Mythos", origin: "Antártica", str: 200, con: 200, siz: 300, dex: 40, int: 40, pow: 60, hp: 100, san: "1d6/1d20", mov: "10", attacks: "Pseudópodo (80%, 3d6+3d6 DB) — múltiplos ataques por rodada", description: "Massa proteoplásmica criada pelos Anciões como servos. Após revolta, são agora selvagens e destrutivos. Tamanho variável, com olhos e bocas que surgem e desaparecem.", special: "Quase invulnerável a danos normais. Fogo e eletricidade causam dano normal. Pode imitar sons e vozes." },
  { name: "Mi-Go", type: "Alienígena", origin: "Plutão/Além", str: 60, con: 70, siz: 50, dex: 70, int: 140, pow: 80, hp: 12, san: "0/1d6", mov: "11 / 14 voando", attacks: "Garra (40%, 1d6+1d4 DB)", description: "Fungos-crustáceos extraterrestres com asas que operam minas secretas nos montes Apalaches e Himalaias em busca de minerais raros.", special: "Tecnologia avançada incluindo cilindros de preservação cerebral. Podem se tornar invisíveis com certas frequências de luz." },
  { name: "Byakhee", type: "Criatura do Mythos", origin: "Espaço Interestelar", str: 70, con: 80, siz: 80, dex: 60, int: 50, pow: 70, hp: 15, san: "0/1d3", mov: "8 / 16 voando", attacks: "Garra (30%, 1d3+1d4 DB) e Mordida (30%, 1d6+1d4 DB)", description: "Criaturas que viajam pelo espaço interestelar e podem ser invocadas por cultistas de Hastur. Usadas como montarias no espaço profundo.", special: "Podem viajar pelo espaço e não precisam respirar. Imunes ao vácuo espacial." },
  { name: "Dimensional Shambler", type: "Criatura do Mythos", origin: "Entre Dimensões", str: 80, con: 90, siz: 80, dex: 50, int: 30, pow: 90, hp: 17, san: "1d3/1d10", mov: "10", attacks: "Garra (35%, 1d6+1d4 DB) — carrega vítimas para outra dimensão", description: "Criaturas que existem parcialmente em outras dimensões. Seu toque pode transportar vítimas para dimensões hostis.", special: "Podem desaparecer e reaparecer. Vítima tocada deve resistir com POD ou é transportada para outra dimensão." },
  { name: "Cultista Humano", type: "Humano", origin: "Mortal", str: 60, con: 60, siz: 60, dex: 60, int: 70, pow: 60, hp: 12, san: "0/0", mov: "8", attacks: "Faca (30%, 1d4+2+DB) ou Revólver .38 (30%, 1d10)", description: "Seres humanos que veneram entidades do Mythos. Podem variar de fanáticos ingênuos a magistas experientes.", special: "Variam enormemente. Alguns conhecem feitiços do Mythos. Motivados por promessas de poder ou imortalidade." },
  { name: "Dark Young of Shub-Niggurath", type: "Criatura do Mythos", origin: "Floresta", str: 140, con: 100, siz: 120, dex: 60, int: 60, pow: 80, hp: 22, san: "1d6/1d20", mov: "8", attacks: "Tentáculo (35%, 1d6+3d6 DB) — até 4 tentáculos por rodada", description: "Descendentes da Cabra Negra das Mil Crias. Árvores-demônio que adoram e guardam bosques sagrados de Shub-Niggurath.", special: "Presença causa perda de SAN. Imunes a armas normais exceto fogo. Fogo causa dano dobrado." },
  { name: "Fire Vampire", type: "Criatura do Mythos", origin: "Espaço", str: 50, con: 0, siz: 10, dex: 70, int: 30, pow: 80, hp: 5, san: "0/1d6", mov: "10 voando", attacks: "Toque de Fogo (70%, 1d6 calor por rodada — contato contínuo)", description: "Seres de fogo que desceram das estrelas junto a Cthugha. Atacam em enxames e são atraídos por calor.", special: "Só podem ser feridos por magia ou por serem privados de calor/oxigênio. Imunes a armas normais." },
  { name: "Nightgaunt", type: "Inumano", origin: "Terras do Sonho", str: 80, con: 80, siz: 70, dex: 80, int: 60, pow: 80, hp: 15, san: "0/1d3", mov: "9 / 15 voando", attacks: "Garra (40%, 1d3+1d4 DB) — pode carregar vítimas para o ar", description: "Seres voadores e faceless que habitam as Terras do Sonho e servem a Nodens. Silenciosos e perturbadores.", special: "Completamente silenciosos. Podem carregar humanos vivos. Servem a Nodens e às vezes ajudam quem tem sua graça." },
  { name: "Rat Thing", type: "Inumano", origin: "Bruxaria", str: 50, con: 70, siz: 30, dex: 100, int: 60, pow: 60, hp: 10, san: "0/1d3", mov: "12", attacks: "Mordida (50%, 1d4+1d4 DB)", description: "Transformações de bruxas em formas de rato com mãos humanas. Familiares e espiões.", special: "Velocidade extraordinária. Podem comunicar com sua bruxa criadora. Morreram se a bruxa morre." },
  { name: "Serpent Person", type: "Raça Ancestral", origin: "Lemúria Antiga", str: 70, con: 70, siz: 65, dex: 70, int: 100, pow: 80, hp: 13, san: "0/1d3", mov: "8", attacks: "Faca Ritual (40%, 1d4+1d4 DB) ou Hipnose (especial)", description: "Raça reptiliana antiga que dominou a Terra na era pré-humana. Ainda existem em bolsões ocultos.", special: "Hipnose: POD vs POD. Podem se disfarçar como humanos. Praticam magia antiga e poderosa." },
  { name: "Flying Polyp", type: "Raça Ancestral", origin: "Espaço", str: 150, con: 0, siz: 130, dex: 90, int: 70, pow: 100, hp: 50, san: "1d6/1d20", mov: "10 / 16 voando", attacks: "Vento (80%, 2d6 sufocamento) — invisível", description: "Seres parcialmente materiais que constroem cidades de torres sem janelas. Foram aprisionados pela Grande Raça mas algumas escaparam.", special: "Podem se tornar completamente invisíveis. Controlam vento. Invulneráveis a armas normais." },
  { name: "Lama de Nyarlathotep", type: "Avatar do Mythos", origin: "Avatar", str: 90, con: 90, siz: 100, dex: 50, int: 160, pow: 180, hp: 19, san: "1d10/1d100", mov: "8", attacks: "Toque (60%, 2d6 + efeito especial)", description: "Uma das muitas formas de Nyarlathotep, o Caos Rastejante. Aparece como homem egípcio negro de três lóbulos.", special: "Pode lançar qualquer feitiço. Presença causa perda massiva de SAN. Serve os Grandes Antigos." },
  { name: "Chthoniano", type: "Criatura do Mythos", origin: "Subterrâneo", str: 260, con: 200, siz: 260, dex: 35, int: 90, pow: 90, hp: 46, san: "1d6/1d20", mov: "6 / 1 escavando", attacks: "Tentáculo (70%, 6d6+5d6 DB) — pode prender vítima; Terremoto (especial)", description: "Vermes gigantescos que vivem nas profundezas da Terra e servem a Shudde M'ell. Causam terremotos ao se mover.", special: "Podem causar terremotos e colapsar estruturas. Imunes a fogo e explosões. Comunicam-se com outros chthonianos telepaticamente. Vulneráveis ao fogo intenso." },
  { name: "Cor que Caiu do Espaço", type: "Alienígena", origin: "Além das Estrelas", str: 10, con: 35, siz: 5, dex: 90, int: 50, pow: 35, hp: 4, san: "0/1d6", mov: "12 derramando / 20 voando", attacks: "Toque (70%, drena 1d3 de cada atributo por rodada)", description: "Entidade de cor indefinível que caiu em um meteoro. Drena vitalidade de tudo ao redor gradualmente, deixando uma região cinzenta e murcha.", special: "Invulnerável a armas normais. Drena atributos (não PV). Expansão gradual que corrompe uma área inteira. Só pode ser destruída com calor intenso ou no espaço." },
  { name: "Ghast", type: "Inumano", origin: "Terras do Sonho", str: 95, con: 80, siz: 95, dex: 50, int: 35, pow: 50, hp: 17, san: "0/1d8", mov: "9", attacks: "Lutar 45% (1d6+1d4 DB) ou Mordida 35% (1d6+1d4 DB)", description: "Predadores bípedes das Terras do Sonho que habitam o Submundo. Rosto quase humano sem nariz ou testa, pulam em longas patas traseiras.", special: "Morrem rapidamente exposta à luz do sol ou equivalente. Excelente olfato. Vivem em bandos nas cavernas mais profundas das Terras do Sonho." },
  { name: "Ser Ancestral", type: "Raça Ancestral", origin: "Antártica / Oceanos", str: 210, con: 130, siz: 320, dex: 50, int: 100, pow: 65, hp: 45, san: "0/1d6", mov: "7", attacks: "Tentáculo (50%, 1d6+6d6 DB)", description: "Criadores dos Shoggoths. Seres estreliformes de cinco pontas com tentáculos, barbatanas e asas. A civilização mais antiga da Terra, precedendo os humanos em centenas de milhões de anos.", special: "Inteligência prodigiosa e tecnologia avançada. Podem sobreviver no fundo do oceano. Alguns dormem em cidades subaquáticas e podem ser despertados." },
  { name: "Gnoph-Keh", type: "Criatura do Mythos", origin: "Ártico", str: 155, con: 110, siz: 155, dex: 70, int: 75, pow: 105, hp: 26, san: "0/1d8", mov: "12 / 8 nadando", attacks: "Garra (50%, 1d6+3d6 DB) — até 3 garras por rodada; Uivo (especial)", description: "Ursos polares gigantescos e mutantes do Ártico que às vezes andam em duas, quatro ou seis pernas. Servem a Ithaqua.", special: "Uivo causa pânico: teste de POD ou fuga por 1d6 rodadas. Resistentes ao frio extremo. Nadadores excelentes em águas geladas." },
  { name: "Grande Raça de Yith", type: "Alienígena", origin: "Além do Tempo", str: 50, con: 50, siz: 50, dex: 65, int: 80, pow: 65, hp: 10, san: "0/1d6", mov: "8", attacks: "Pistola Elétrica (60%, 1d8+paralisia) ou Garra (30%, 1d6)", description: "Seres cônicos que viajam pelo tempo trocando mentes com outras entidades. Coletam conhecimento de toda a história. Controlam raios elétricos.", special: "Podem trocar mentes com qualquer ser inteligente (POD vs POD). Possuem conhecimento de toda a história passada e futura. Pistolas elétricas causam paralisia." },
  { name: "Habitante da Areia", type: "Inumano", origin: "Desertos", str: 45, con: 70, siz: 65, dex: 35, int: 65, pow: 100, hp: 13, san: "0/1d3", mov: "8", attacks: "Faca Ritual (40%, 1d4+1d4 DB)", description: "Humanoides com rosto de coala distorcido que habitam desertos profundos. Adoram divindades do Mythos e possuem conhecimento de feitiços arcanos.", special: "Podem chamar ventos de areia para cegar e desorientar. Conhecem feitiços do Mythos. Vivem em comunidades subterrâneas sob os desertos." },
  { name: "Hunting Horror", type: "Criatura do Mythos", origin: "Convocado", str: 145, con: 50, siz: 205, dex: 65, int: 75, pow: 105, hp: 25, san: "1d3/1d10", mov: "7 / 11 voando", attacks: "Constrição (50%, 3d6+3d6 DB — prende e aperta até a morte)", description: "Serpentes voadoras enegrecidas e retorcidas que servem a Nyarlathotep. Viajam pelo espaço e são invocados para caçar alvos específicos, dos quais nunca desistem.", special: "Perseguem um alvo designado sem parar. Imunes a armas normais. Constrição prende a vítima automaticamente no primeiro turno de contato. Vulneráveis à luz solar." },
  { name: "Lloigor", type: "Alienígena", origin: "Espaço Interestelar", str: 200, con: 140, siz: 250, dex: 50, int: 100, pow: 70, hp: 39, san: "1d6/1d20", mov: "7 / 3 imaterial através de rocha", attacks: "Mordida (50%, 2d6+5d6 DB); Raio de Energia (60%, 1d10 + drena FOR/CON)", description: "Vórtices de energia que podem assumir forma reptiliana. Seres imateriais que drenam energia vital dos humanos próximos simplesmente por existirem na área.", special: "Em forma imaterial, invulneráveis a ataques físicos. Drenam atributos de humanos ao redor. Podem controlar animais e humanos fracos de mente. Lançam feitiços com facilidade." },
  { name: "Besta Lunar", type: "Criatura do Mythos", origin: "Lua", str: 50, con: 65, siz: 80, dex: 65, int: 50, pow: 50, hp: 14, san: "0/1d3", mov: "8 / 12 voando", attacks: "Garra (35%, 1d4+1d4 DB) — 4 garras rosadas", description: "Sapos enormes cor-de-rosa com tentáculos rosados ao redor do focinho. Habitam a Lua e as Terras do Sonho, onde comercializam em escravos.", special: "Traficantes de escravos. Podem hipnotizar com seu focinho tentaculado. Viajam entre a Lua e a Terra através das Terras do Sonho. Conhecem magias alienígenas." },
  { name: "Shantak", type: "Inumano", origin: "Yuggoth / Espaço", str: 110, con: 70, siz: 130, dex: 65, int: 15, pow: 50, hp: 20, san: "0/1d3", mov: "6 / 12 voando", attacks: "Bico (50%, 1d8+2d6 DB) ou Garra (35%, 1d6+2d6 DB)", description: "Pássaros-répteis com escamas repulsivas e cabeça semelhante a um cavalo. Podem viajar pelo espaço e são usados como montarias por Mi-Gos e cultistas.", special: "Terrorizados por Nightgaunts. Podem viajar pelo espaço profundo sem necessidade de ar. Inteligência animal, mas amedrontados e obedientes com cultistas experientes." },
  { name: "Vampiro Estelar", type: "Criatura do Mythos", origin: "Espaço", str: 10, con: 10, siz: 5, dex: 80, int: 80, pow: 85, hp: 1, san: "1d3/1d6", mov: "4 / 20 voando", attacks: "Sucção de Sangue (90%, 1d6 PV por rodada — invisível até alimentar)", description: "Invisíveis exceto quando cheios de sangue, onde aparecem como massas de tentáculos e garras vermelhas pulsantes. Atraídos por certos feitiços do Mythos.", special: "Completamente invisíveis quando sem sangue. Tornam-se visíveis ao se alimentar, aparecendo como massa vermelha horrenda. Virtualmente imunes a dano físico enquanto invisíveis." },
  { name: "Tcho-Tcho", type: "Humano", origin: "Sudeste Asiático", str: 50, con: 50, siz: 45, dex: 50, int: 50, pow: 50, hp: 9, san: "0/1d3", mov: "8", attacks: "Lutar 45% (1d3+DB) ou Espada (45%, 1d6+1+DB)", description: "Tribo de homenzinhos degenerados com olhos pequenos em cabeças convexas. Adoram os Grandes Antigos e praticam rituais sangrentos. Encontrados no Sudeste Asiático.", special: "Sacerdotes conhecem pelo menos 3 feitiços. Furtividade excepcional. Extremamente perigosos em grupos. Adultos reduzem SAN máxima dos que encontrá-los a 0." },
  { name: "Zumbi", type: "Morto-Vivo", origin: "Magia Negra", str: 70, con: 80, siz: 100, dex: 80, int: 85, pow: 95, hp: 18, san: "0/1d6", mov: "7", attacks: "Soco (50%, 1d6+1d6 DB) ou Mordida (30%, 1d4+1d6 DB)", description: "Corpos humanos reanimados por feitiços do Mythos. Obedecem cegamente ao criador. Não sentem dor nem medo, mas retêm memórias e habilidades da vida anterior.", special: "Imunes a efeitos de moral e medo. Não sentem dor — dano só importa quando PV chegam a 0. Criados pelo feitiço Criar Zumbi. Continuam obedecendo mesmo gravemente feridos." },
  { name: "Fantasma", type: "Horror Tradicional", origin: "Morto-Vivo", str: 0, con: 0, siz: 0, dex: 65, int: 65, pow: 65, hp: 0, san: "0/1d6", mov: "10 imaterial", attacks: "Toque Frio (60%, 1d6 PM drenados) ou Possessão (POD vs POD)", description: "Manifestação espiritual de um morto que não consegue descansar. Pode variar de orbes de luz a aparições completamente visíveis e aterrorizantes.", special: "Imaterial — a maioria das armas físicas não têm efeito. Vulnerável a feitiços, armas bêntas e locais sagrados. Possessão exige POD vs POD; sucesso = controla corpo da vítima por 1d6 horas. Banimento possível com rituais adequados." },
  { name: "Lobisomem", type: "Horror Tradicional", origin: "Maldição", str: 120, con: 100, siz: 90, dex: 80, int: 45, pow: 50, hp: 19, san: "0/1d8", mov: "12", attacks: "Garra (60%, 1d6+1d6 DB) ou Mordida (50%, 1d8+1d6 DB) — infecção!", description: "Ser humano amaldiçoado que se transforma em lobo-humanoide nas noites de lua cheia. Em forma humana é completamente normal. A transformação é involuntária.", special: "Vulnerável apenas a prata e magia — armas normais causam metade do dano. Mordida transmite a maldição (resistir com CON). Em forma humana, não há como distingui-lo de um humano normal. Regenera 1 PV/rodada exceto dano de prata." },
  { name: "Múmia", type: "Horror Tradicional", origin: "Egito Antigo / Oriente", str: 100, con: 85, siz: 75, dex: 45, int: 80, pow: 90, hp: 18, san: "0/1d10", mov: "6", attacks: "Soco (50%, 1d6+1d6 DB) ou Estrangulamento (40%, 1d8+1d6 DB por rodada)", description: "Morto reanimado por rituais de preservação egípcia ou similares. Geralmente guarda tumbas ou cumpre vingança contra os que perturbaram seu descanso eterno.", special: "Vulnerável ao fogo (dano dobrado). Imune a venenos e doenças. Pode lançar feitiços do Mythos egípcio. Presença emite mau-olhado: falhar em SAN pode causar paralisia temporária por medo ancestral." },
  { name: "Vampiro", type: "Horror Tradicional", origin: "Europa Oriental", str: 90, con: 80, siz: 70, dex: 80, int: 80, pow: 80, hp: 15, san: "0/1d6", mov: "9 / 14 como névoa ou morcego", attacks: "Mordida (60%, 1d6+drenar 1d6 de CON) ou Hipnose (POD vs POD)", description: "Morto-vivo que se alimenta do sangue dos vivos. Aparência aristocrática enganosa. Precisa dormir em terra de sua pátria durante o dia.", special: "Vulnerável a luz solar (1d6/rodada), prata, estacas no coração, alho, símbolos sagrados. Pode se transformar em névoa ou morcego. Hipnose: vítima se deixa morder voluntariamente. Drenar toda CON = nova vítima se torna vampiro em 1d3 dias." },
];

const TYPES = [...new Set(BESTIARY.map((c) => c.type))];
const HP_OPTIONS = [
  { id: "Todos" },
  { id: "1-10", min: 0, max: 10 },
  { id: "11-20", min: 11, max: 20 },
  { id: "21-50", min: 21, max: 50 },
  { id: "51+", min: 51, max: Infinity },
];

export function CthulhuBestiary({ api }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [hpFilter, setHpFilter] = useState("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [addDex, setAddDex] = useState("");

  async function addToInitiative(creature: CthulhuCreature) {
    const dex = addDex !== "" ? Number(addDex) : creature.dex;
    await api.addChild("combatants", {
      name: creature.name, dex, hp: creature.hp, maxHp: creature.hp,
      san: null, maxSan: null, mp: null, maxMp: null, conditions: "[]", isPlayer: false,
      order: api.campaign.cthulhuCombatants.length,
    });
    setAddTarget(null);
    setAddDex("");
  }

  const filtered = useMemo(() => {
    return BESTIARY.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "Todos" && c.type !== typeFilter) return false;
      const hp = HP_OPTIONS.find((h) => h.id === hpFilter);
      if (hp && "min" in hp && hp.min !== undefined && hp.max !== undefined && (c.hp < hp.min || c.hp > hp.max)) return false;
      return true;
    });
  }, [search, typeFilter, hpFilter]);

  const sanColor = (san: string) => {
    const match = san.match(/(\d+)/);
    if (!match) return "var(--text-muted)";
    const n = Number(match[1]);
    return n >= 6 ? "#f87171" : n >= 3 ? "#fbbf24" : "#a3b86c";
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar criatura..."
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", background: "var(--surface)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}
        >
          <option value="Todos">Todos os Tipos</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={hpFilter}
          onChange={(e) => setHpFilter(e.target.value)}
          style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}
        >
          {HP_OPTIONS.map((h) => <option key={h.id} value={h.id}>{h.id === "Todos" ? "Todos os PV" : `PV ${h.id}`}</option>)}
        </select>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 16 }}>
        {filtered.length} criatura{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Creature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((creature) => {
          const isOpen = expanded === creature.name;
          return (
            <div key={creature.name} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? "rgba(125,156,62,0.32)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : creature.name)}
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  {/* San indicator */}
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sanColor(creature.san), boxShadow: `0 0 6px ${sanColor(creature.san)}88`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{creature.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {creature.type} · {creature.origin}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                      PV {creature.hp}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: sanColor(creature.san), background: "var(--surface-2)", border: `1px solid ${sanColor(creature.san)}44`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                      SAN {creature.san}
                    </span>
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setAddTarget(addTarget === creature.name ? null : creature.name); setAddDex(""); }}
                  title="Adicionar à Ordem de Ação"
                  style={{ margin: "0 12px", padding: "6px 12px", background: addTarget === creature.name ? "rgba(125,156,62,0.22)" : "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Ordem
                </button>
              </div>

              {/* Add to initiative popover */}
              {addTarget === creature.name && (
                <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(125,156,62,0.32)", background: "rgba(125,156,62,0.08)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    DEX para ordem <span style={{ color: "var(--text-subtle)" }}>(vazio = {creature.dex})</span>
                  </p>
                  <input
                    type="number"
                    value={addDex}
                    onChange={(e) => setAddDex(e.target.value)}
                    placeholder={String(creature.dex)}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && addToInitiative(creature)}
                    style={{ width: 80, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem" }}
                  />
                  <button onClick={() => addToInitiative(creature)} style={{ padding: "6px 14px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                    + Adicionar
                  </button>
                  <button onClick={() => setAddTarget(null)} style={{ padding: "6px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}>
                    Cancelar
                  </button>
                </div>
              )}

              {/* Expanded stats */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  {/* Attributes grid */}
                  <div className="cth-bestiary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, margin: "16px 0 14px" }}>
                    {[["FOR", creature.str], ["CON", creature.con], ["TAM", creature.siz], ["DES", creature.dex], ["INT", creature.int], ["POD", creature.pow], ["PV", creature.hp]].map(([label, val]) => (
                      <div key={label} style={{ textAlign: "center", padding: "8px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Movimento</p>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>{creature.mov}</p>
                    </div>
                    <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.06)", borderRadius: "var(--radius)", border: "1px solid rgba(248,113,113,0.2)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Perda de Sanidade</p>
                      <p style={{ fontSize: "0.84rem", color: sanColor(creature.san), fontWeight: 700 }}>{creature.san}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Ataques</p>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{creature.attacks}</p>
                  </div>

                  <div style={{ marginBottom: creature.special ? 12 : 0 }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Descrição</p>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{creature.description}</p>
                  </div>

                  {creature.special && (
                    <div style={{ padding: "10px 14px", background: "rgba(125,156,62,0.14)", borderRadius: "var(--radius)", border: "1px solid rgba(125,156,62,0.32)", marginTop: 12 }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#a3b86c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Habilidades Especiais</p>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{creature.special}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-subtle)", fontSize: "0.9rem", padding: "48px 0" }}>
          Nenhuma criatura encontrada com esses filtros.
        </p>
      )}
    </div>
  );
}
