// Star Wars: Além da Fronteira — as 35 espécies jogáveis

import type { AttrKey } from "./data";

export type PvPeTier = "robusto" | "robusto_extremo" | "equilibrado" | "sensivel" | "sensivel_extremo";

export const TIER_BONUS: Record<PvPeTier, { pv: number; pe: number }> = {
  robusto: { pv: 4, pe: 0 },
  robusto_extremo: { pv: 6, pe: 0 },
  equilibrado: { pv: 2, pe: 1 },
  sensivel: { pv: 0, pe: 3 },
  sensivel_extremo: { pv: 0, pe: 4 },
};

export const TIER_LABEL: Record<PvPeTier, string> = {
  robusto: "Robusto",
  robusto_extremo: "Robusto Extremo",
  equilibrado: "Equilibrado",
  sensivel: "Sensível",
  sensivel_extremo: "Sensível Extremo",
};

export const TIER_DESCRIPTION: Record<PvPeTier, string> = {
  robusto: "Espécie fisicamente resistente: +4 PV (Pontos de Vida) na criação.",
  robusto_extremo: "Biologia excepcionalmente resistente: +6 PV (Pontos de Vida) na criação.",
  equilibrado: "Nem tanque nem místico: +2 PV e +1 PE (Energia da Força) na criação.",
  sensivel: "Afinidade natural com a Força: +3 PE (Energia da Força) na criação.",
  sensivel_extremo: "Ligação profunda e definidora com a Força: +4 PE (Energia da Força) na criação.",
};

export interface Species {
  id: string;
  name: string;
  description: string;
  /** Descrição física — como a espécie se parece. Mostrada na criação de personagem. */
  appearance: string;
  initialSkills: string[]; // 2 ids de SKILLS
  attrBonus: Partial<Record<AttrKey, number>>;
  /** Só o Humano: escolha livre de +2/+2/+1/+1/+1/-1 entre os 6 atributos. */
  attrFreeChoice?: { plus2: number; plus1: number; minus1: number };
  tier: PvPeTier;
}

export const SPECIES: Species[] = [
  { id: "anzat", name: "Anzat", description: "Espécie rara e misteriosa, discreta, manipuladora e especialista em agir nas sombras.", appearance: "Humanoides altos e magros, de pele pálida e feições austeras; escondem na boca dois longos tentáculos labiais retráteis, usados para se alimentar.", initialSkills: ["furtividade", "enganacao"], attrBonus: { agi: 2, pre: 1, vig: -1 }, tier: "equilibrado" },
  { id: "arkanian", name: "Arkanian", description: "Cientistas brilhantes e pesquisadores renomados, dedicados ao avanço do conhecimento.", appearance: "Pele muito clara, quase albina, com cabelo branco e olhos em tons de rosa ou vermelho; orelhas levemente pontudas e postura refinada.", initialSkills: ["ciencias", "medicina"], attrBonus: { int: 2, pre: 1, forca: -1 }, tier: "equilibrado" },
  { id: "besalisk", name: "Besalisk", description: "Espécie robusta de múltiplos braços, reconhecida pela força e habilidade manual.", appearance: "Corpo grande e corpulento, pele grossa e enrugada, quatro braços musculosos e cabeça careca marcada por pregas de gordura, sem pescoço aparente.", initialSkills: ["medicina", "mecanica"], attrBonus: { forca: 2, vig: 1, agi: -1 }, tier: "robusto" },
  { id: "bothan", name: "Bothan", description: "Mestres da espionagem, informação e política, capazes de manipular situações discretamente.", appearance: "Baixos e cobertos por pelagem densa em tons de marrom, cinza ou preto; rosto alongado como o de um mustelídeo, com orelhas pontudas sempre eretas.", initialSkills: ["investigacao", "enganacao"], attrBonus: { int: 2, pre: 1, forca: -1 }, tier: "equilibrado" },
  { id: "cathar", name: "Cathar", description: "Felinos humanoides de espírito guerreiro, rápidos, orgulhosos e excelentes rastreadores.", appearance: "Felinos humanoides bípedes, corpo coberto de pelagem dourada, alaranjada, preta ou malhada; rosto felino, cauda longa e garras retráteis.", initialSkills: ["percepcao", "atletismo"], attrBonus: { agi: 2, forca: 1, int: -1 }, tier: "robusto" },
  { id: "cerean", name: "Cerean", description: "Intelectuais de raciocínio avançado, conhecidos por sua sabedoria e capacidade analítica.", appearance: "Altos e magros, com crânio alongado verticalmente em formato cônico (abrigando um cérebro binário) e olhos grandes e atentos.", initialSkills: ["ciencias", "investigacao"], attrBonus: { int: 3, forca: -1 }, tier: "sensivel_extremo" },
  { id: "chagrian", name: "Chagrian", description: "Conhecidos por sua disciplina, postura diplomática e talento para liderar.", appearance: "Pele em tons de azul-esverdeado, dois cornos curvos no topo da cabeça e tresku (tentáculos finos) pendendo do queixo.", initialSkills: ["diplomacia", "lideranca"], attrBonus: { pre: 2, int: 1, agi: -1 }, tier: "equilibrado" },
  { id: "devaronian", name: "Devaronian", description: "Aventureiros por natureza, impulsivos e confiantes, sempre em busca de novos desafios.", appearance: "Machos possuem chifres curvos e pele avermelhada ou marrom, dando um ar quase demoníaco; fêmeas não têm chifres e lembram mais humanas.", initialSkills: ["intimidacao", "persuasao"], attrBonus: { forca: 2, agi: 1, pre: -1 }, tier: "robusto" },
  { id: "duros", name: "Duros", description: "Exploradores e navegadores lendários, entre os melhores pilotos e astrógrafos da galáxia.", appearance: "Pele lisa azul-esverdeada, cabeça alongada e sem cabelo, olhos grandes e vermelhos, corpo magro e adaptado ao voo espacial.", initialSkills: ["astrogacao", "computacao"], attrBonus: { int: 2, agi: 1, vig: -1 }, tier: "equilibrado" },
  { id: "echani", name: "Echani", description: "Mestres do combate corporal, acreditam que lutar é uma forma de comunicação e expressão.", appearance: "Aparência muito próxima da humana, com pele e cabelo naturalmente brancos ou prateados e físico atlético, marcado por treino marcial constante.", initialSkills: ["acrobacia", "percepcao"], attrBonus: { agi: 2, forca: 1, sen: -1 }, tier: "robusto" },
  { id: "falleen", name: "Falleen", description: "Mestres da manipulação social, conhecidos por seu charme e habilidade política.", appearance: "Pele escamosa e reptiliana em tons de verde, com brilho sutil; feições humanoides atraentes e capacidade de liberar feromônios pela pele.", initialSkills: ["persuasao", "enganacao"], attrBonus: { pre: 2, sen: 1, vig: -1 }, tier: "equilibrado" },
  { id: "gendai", name: "Gen'Dai", description: "Seres incrivelmente resistentes, capazes de sobreviver a ferimentos que matariam quase qualquer outra espécie.", appearance: "Seres colossais e quase gelatinosos, corpo segmentado sem esqueleto rígido fixo, capazes de se regenerar e até se dividir; forma amorfa e imponente.", initialSkills: ["atletismo", "medicina"], attrBonus: { vig: 3, agi: -1 }, tier: "robusto_extremo" },
  { id: "humano", name: "Humano", description: "Adaptáveis e extremamente diversos, os humanos estão presentes em praticamente toda a galáxia e se destacam por sua versatilidade.", appearance: "Aparência totalmente variável — altura, cor de pele, cabelo e traços mudam de indivíduo para indivíduo, sem um padrão fixo da espécie.", initialSkills: ["persuasao", "conhecimento_galactico"], attrBonus: {}, attrFreeChoice: { plus2: 2, plus1: 3, minus1: 1 }, tier: "equilibrado" },
  { id: "iktotchi", name: "Iktotchi", description: "Possuem uma forte intuição natural e, em alguns casos, leves percepções precognitivas.", appearance: "Pele em tons avermelhados ou marrons, dois chifres grossos e curvos na cabeça e rosto de traços angulosos e intensos.", initialSkills: ["percepcao", "sobrevivencia"], attrBonus: { sen: 2, pre: 1, forca: -1 }, tier: "sensivel_extremo" },
  { id: "kel_dor", name: "Kel Dor", description: "Sábios e disciplinados, utilizam máscaras respiratórias fora de seu planeta natal e possuem forte tradição Jedi.", appearance: "Pele alaranjada ou avermelhada, sem nariz visível; fora de seu planeta natal usam máscara respiratória e óculos escuros por causa da atmosfera diferente.", initialSkills: ["conhecimento_forca", "ciencias"], attrBonus: { sen: 2, int: 1, agi: -1 }, tier: "sensivel" },
  { id: "kiffar", name: "Kiffar", description: "Humanos com forte tradição tribal, alguns possuem dons raros ligados à percepção pela Força.", appearance: "Aparência humanoide muito próxima da humana, frequentemente com tatuagens tribais no rosto que marcam linhagem e clã.", initialSkills: ["investigacao", "percepcao"], attrBonus: { sen: 2, agi: 1, pre: -1 }, tier: "sensivel" },
  { id: "mirialan", name: "Mirialan", description: "Povo profundamente espiritual, conhecido por acreditar no destino e na conexão com a Força.", appearance: "Pele em tons de verde-oliva, olhos escuros e expressivos, com tatuagens rituais cobrindo rosto e mãos como marca espiritual.", initialSkills: ["conhecimento_forca", "percepcao"], attrBonus: { sen: 2, pre: 1, forca: -1 }, tier: "sensivel" },
  { id: "miraluka", name: "Miraluka", description: "Embora não possuam olhos, enxergam através da própria Força, percebendo o mundo de forma única.", appearance: "Aparência humanoide sem olhos funcionais — pele lisa onde estariam —, geralmente cobrem a região com uma faixa ou véu.", initialSkills: ["conhecimento_forca", "percepcao"], attrBonus: { sen: 3, agi: -1 }, tier: "sensivel_extremo" },
  { id: "mon_calamari", name: "Mon Calamari", description: "Mestres da engenharia e construção naval, reconhecidos por sua criatividade e inteligência.", appearance: "Cabeça em formato de peixe, com grandes olhos protuberantes; pele úmida em tons de salmão, rosa ou marrom, sem cabelo.", initialSkills: ["computacao", "mecanica"], attrBonus: { int: 2, vig: 1, agi: -1 }, tier: "equilibrado" },
  { id: "nautolan", name: "Nautolan", description: "Espécie anfíbia capaz de sentir emoções através da água e de seus tentáculos sensoriais.", appearance: "Pele em tons verde-azulados, cabeça coberta por tentáculos sensoriais no lugar de cabelo, grandes olhos negros; bem adaptados à água.", initialSkills: ["percepcao", "dominio_forca"], attrBonus: { sen: 2, vig: 1, int: -1 }, tier: "sensivel" },
  { id: "nikto", name: "Nikto", description: "Resistentes e disciplinados, adaptam-se facilmente aos mais diversos ambientes da galáxia.", appearance: "Pele reptiliana grossa em tons de verde ou cinza, rosto sem nariz protuberante, marcado por pregas e sulcos profundos, olhos pequenos.", initialSkills: ["atletismo", "sobrevivencia"], attrBonus: { vig: 2, forca: 1, pre: -1 }, tier: "robusto" },
  { id: "pantoran", name: "Pantoran", description: "Habitantes de mundos gelados, educados e acostumados à política e ao serviço público.", appearance: "Pele azul-clara, cabelo escuro e feições humanoides elegantes, adaptados aos climas frios de seu mundo natal.", initialSkills: ["diplomacia", "conhecimento_galactico"], attrBonus: { pre: 2, int: 1, forca: -1 }, tier: "equilibrado" },
  { id: "quarren", name: "Quarren", description: "Habitantes oceânicos de Mon Cala, independentes e acostumados à vida marítima e comercial.", appearance: "Cabeça em formato de lula, com tentáculos faciais no lugar da boca, pele acinzentada e úmida, grandes olhos redondos.", initialSkills: ["sobrevivencia", "persuasao"], attrBonus: { vig: 2, int: 1, pre: -1 }, tier: "equilibrado" },
  { id: "rattataki", name: "Rattataki", description: "Guerreiros agressivos e destemidos, frequentemente envolvidos em arenas e conflitos.", appearance: "Pele extremamente pálida, cabeça costumeiramente raspada, físico endurecido e frequentemente marcado por cicatrizes de combate.", initialSkills: ["armas_energia", "intimidacao"], attrBonus: { forca: 2, vig: 1, int: -1 }, tier: "robusto" },
  { id: "rodian", name: "Rodian", description: "Caçadores habilidosos que valorizam rastreamento, precisão e sobrevivência.", appearance: "Pele verde escamosa, grandes olhos compostos, focinho com fendas nasais no lugar de um nariz protuberante.", initialSkills: ["investigacao", "percepcao"], attrBonus: { agi: 2, sen: 1, pre: -1 }, tier: "equilibrado" },
  { id: "shistavanen", name: "Shistavanen", description: "Lupinos humanoides com sentidos extremamente aguçados e grande instinto de sobrevivência.", appearance: "Aparência lupina, corpo coberto de pelagem espessa, focinho alongado, orelhas pontudas eretas e olhos amarelados.", initialSkills: ["percepcao", "sobrevivencia"], attrBonus: { sen: 2, agi: 1, pre: -1 }, tier: "robusto" },
  { id: "sullustan", name: "Sullustan", description: "Especialistas em mineração, cavernas e navegação espacial, famosos por seu excelente senso de direção.", appearance: "Pele acinzentada, bochechas caídas e enrugadas, orelhas grandes e pendentes, olhos escuros grandes e expressivos.", initialSkills: ["astrogacao", "mecanica"], attrBonus: { int: 2, agi: 1, forca: -1 }, tier: "equilibrado" },
  { id: "togruta", name: "Togruta", description: "Caçadores natos que utilizam seus montrals para perceber o ambiente ao redor com precisão impressionante.", appearance: "Pele em padrões listrados (laranja, azul ou vermelho), cabeça sem cabelo com montrals ocos no topo e lekku (head-tails) trançados nas costas.", initialSkills: ["percepcao", "sobrevivencia"], attrBonus: { sen: 2, agi: 1, int: -1 }, tier: "equilibrado" },
  { id: "twilek", name: "Twi'lek", description: "Originários de Ryloth, são conhecidos por sua inteligência, carisma e grande capacidade de adaptação.", appearance: "Cabeça sem cabelo com dois lekku — longos tentáculos cerebrais — pendendo da nuca; pele em variadas cores, do azul ao vermelho.", initialSkills: ["persuasao", "enganacao"], attrBonus: { pre: 2, agi: 1, vig: -1 }, tier: "equilibrado" },
  { id: "umbaran", name: "Umbaran", description: "Originários de Umbara, vivem em um mundo sombrio e possuem grande afinidade com furtividade e tecnologia.", appearance: "Pele acinzentada ou roxo-pálida, olhos totalmente negros sem esclera visível, aparência magra e quase etérea.", initialSkills: ["furtividade", "computacao"], attrBonus: { agi: 2, int: 1, pre: -1 }, tier: "equilibrado" },
  { id: "voss", name: "Voss", description: "Espécie profundamente conectada aos mistérios da Força e às tradições espirituais.", appearance: "Pele pálida azulada, feições delicadas e quase élficas, olhos claros e penetrantes que refletem sua ligação com a Força.", initialSkills: ["conhecimento_forca", "dominio_forca"], attrBonus: { sen: 3, forca: -1 }, tier: "sensivel_extremo" },
  { id: "weequay", name: "Weequay", description: "Sobreviventes endurecidos por ambientes hostis, frequentemente encontrados entre mercenários e piratas.", appearance: "Pele extremamente enrugada e curtida como couro, cabeça careca, aparência dura e envelhecida mesmo em indivíduos jovens.", initialSkills: ["sobrevivencia", "armas_energia"], attrBonus: { vig: 2, forca: 1, int: -1 }, tier: "robusto" },
  { id: "wookiee", name: "Wookiee", description: "Gigantes fortes e leais de Kashyyyk, conhecidos por sua coragem e senso de honra.", appearance: "Gigantes de até 2,3 metros, corpo inteiramente coberto por pelagem longa e densa em tons de marrom, preto, ruivo ou branco, com garras e presas visíveis.", initialSkills: ["atletismo", "sobrevivencia"], attrBonus: { forca: 3, int: -1 }, tier: "robusto_extremo" },
  { id: "zabrak", name: "Zabrak", description: "Guerreiros determinados, famosos por sua resistência física e força de vontade inabalável.", appearance: "Pele em tons variados, fileira de pequenos chifres ósseos ao longo do crânio e, com frequência, tatuagens faciais tradicionais.", initialSkills: ["atletismo", "intimidacao"], attrBonus: { forca: 2, vig: 1, sen: -1 }, tier: "robusto" },
  { id: "zeltron", name: "Zeltron", description: "Espécie extremamente carismática, capaz de perceber emoções com grande facilidade.", appearance: "Aparência muito próxima da humana, pele em tons rosados ou avermelhados, com expressões faciais vivas e emocionalmente intensas.", initialSkills: ["persuasao", "percepcao"], attrBonus: { pre: 2, sen: 1, forca: -1 }, tier: "sensivel" },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s])
);
