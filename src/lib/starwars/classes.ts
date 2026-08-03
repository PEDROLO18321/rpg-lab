// Star Wars: Além da Fronteira — as 25 classes (20 comuns + 3 de Caminho + 2 de Profecia)

export type Archetype = "marcial" | "especialista" | "sensivel";

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  marcial: "Marcial",
  especialista: "Especialista",
  sensivel: "Sensível à Força",
};

export const ARCHETYPE_DESCRIPTION: Record<Archetype, string> = {
  marcial: "Focado em combate físico e tático. Especialista em armas, armaduras, atletismo e enfrentamento direto. Excelente em combates convencionais.",
  especialista: "Mestre em conhecimento técnico, perícias avançadas e resolução de problemas. Ideal para hacking, mecânica, investigação, pilotagem e suporte.",
  sensivel: "Conectado profundamente à Força. Acesso privilegiado a poderes, Domínio da Força e perícias relacionadas à Sensitividade. Caminho dos Jedi, Sith e outros usuários da Força.",
};

export const ARCHETYPE_FORMULA: Record<Archetype, { pv1: number; pvPerLevel: number; pe1: number; pePerLevel: number; skillMultiplier: number }> = {
  marcial: { pv1: 20, pvPerLevel: 4, pe1: 2, pePerLevel: 1, skillMultiplier: 1.5 },
  especialista: { pv1: 16, pvPerLevel: 3, pe1: 4, pePerLevel: 2, skillMultiplier: 3 },
  sensivel: { pv1: 14, pvPerLevel: 2, pe1: 6, pePerLevel: 3, skillMultiplier: 2 },
};

export interface StarWarsClass {
  id: string;
  name: string;
  description: string;
  archetype: Archetype;
  ppModifier: number;
  /** Só as 3 ligadas à Força: aprendem Formas de Sabre. */
  isForceBase?: boolean;
  /** As 3 classes de Caminho: mais poderosas que as comuns, progressão própria de 30 habilidades (nível 1 a 30). */
  isPathClass?: boolean;
  /** As 2 classes de Profecia: só disponíveis depois que o personagem descobre a profecia correspondente (toda ficha tem uma de Luz e uma de Escuridão); 10 habilidades, só em níveis pares (2 a 20). Mais poderosas que as de Caminho. */
  isPropheticClass?: boolean;
}

export const CLASSES: StarWarsClass[] = [
  { id: "acolito_sith", name: "Acólito Sith", description: "Aprendiz do Lado Sombrio, treinado por um Lorde Sith para dominar a Força e seus ensinamentos.", archetype: "sensivel", ppModifier: 0, isForceBase: true },
  { id: "andarilho_forca", name: "Andarilho da Força", description: "Sensível à Força nascido fora das ordens Jedi ou Sith — lutador nato, Caminho Neutro por natureza.", archetype: "sensivel", ppModifier: 1, isForceBase: true },
  { id: "arqueologo", name: "Arqueólogo", description: "Especialista em civilizações antigas, ruínas e artefatos espalhados pela galáxia.", archetype: "especialista", ppModifier: 2 },
  { id: "cacador_recompensas", name: "Caçador de Recompensas", description: "Rastreia, captura ou elimina alvos em troca de créditos.", archetype: "marcial", ppModifier: 1 },
  { id: "cantico_alvorecer", name: "O Cântico do Alvorecer", description: "Classe de profecia do Lado da Luz — só desbloqueada quando o personagem descobre sua profecia luminosa.", archetype: "sensivel", ppModifier: 2, isPropheticClass: true },
  { id: "cientista", name: "Cientista", description: "Pesquisador dedicado ao avanço da tecnologia, biologia, física ou outras áreas da ciência.", archetype: "especialista", ppModifier: 2 },
  { id: "comerciante", name: "Comerciante", description: "Especialista em negociações, rotas comerciais, compra, venda e administração de recursos.", archetype: "especialista", ppModifier: 2 },
  { id: "contrabandista", name: "Contrabandista", description: "Transporta cargas e passageiros por rotas clandestinas, evitando autoridades e criminosos rivais.", archetype: "especialista", ppModifier: 2 },
  { id: "diplomata", name: "Diplomata", description: "Atua como negociador entre governos, organizações e diferentes povos da galáxia.", archetype: "especialista", ppModifier: 2 },
  { id: "engenheiro", name: "Engenheiro", description: "Constrói, repara e aprimora naves, droides, armas e equipamentos tecnológicos.", archetype: "especialista", ppModifier: 2 },
  { id: "equilibrio", name: "O Equilíbrio", description: "Classe de definição do caminho do meio — harmonia, dualidade, adaptação e poder neutro da Força.", archetype: "sensivel", ppModifier: 1, isPathClass: true },
  { id: "espiao", name: "Espião", description: "Especialista em infiltração, espionagem e obtenção de informações sigilosas.", archetype: "especialista", ppModifier: 3 },
  { id: "explorador", name: "Explorador", description: "Desbrava regiões desconhecidas, rastreia caminhos e sobrevive em ambientes hostis.", archetype: "marcial", ppModifier: 1 },
  { id: "guarda_planetario", name: "Guarda Planetário", description: "Responsável por manter a ordem e proteger uma cidade, planeta ou sistema.", archetype: "marcial", ppModifier: 1 },
  { id: "lado_da_luz", name: "O Lado da Luz", description: "Classe de definição do caminho luminoso — proteção, cura, serenidade, justiça e poder puro da Luz.", archetype: "sensivel", ppModifier: 1, isPathClass: true },
  { id: "lado_negro", name: "O Lado Negro", description: "Classe de definição do caminho sombrio — poder, medo, raiva, domínio e destruição.", archetype: "sensivel", ppModifier: 1, isPathClass: true },
  { id: "litania_queda", name: "A Litania da Queda", description: "Classe de profecia do Lado Negro — só desbloqueada quando o personagem descobre sua profecia sombria.", archetype: "sensivel", ppModifier: 2, isPropheticClass: true },
  { id: "mandaloriano", name: "Mandaloriano", description: "Guerreiro treinado nas tradições de Mandalore, famoso por sua disciplina e armadura.", archetype: "marcial", ppModifier: 0 },
  { id: "medico", name: "Médico", description: "Especialista em medicina, primeiros socorros, cirurgias e uso de bacta.", archetype: "especialista", ppModifier: 1 },
  { id: "mercenario", name: "Mercenário", description: "Combatente independente que presta serviços militares ou de segurança para quem pagar melhor.", archetype: "marcial", ppModifier: 1 },
  { id: "padawan_jedi", name: "Padawan Jedi", description: "Aprendiz Jedi que busca aperfeiçoar sua conexão com a Força sob a orientação de um Mestre.", archetype: "sensivel", ppModifier: 0, isForceBase: true },
  { id: "piloto", name: "Piloto", description: "Especialista na condução de naves espaciais e veículos de diversos tipos.", archetype: "especialista", ppModifier: 1 },
  { id: "pirata_espacial", name: "Pirata Espacial", description: "Fora da lei que vive de saques, ataques a cargueiros e atividades criminosas no espaço.", archetype: "marcial", ppModifier: 1 },
  { id: "soldado_republica", name: "Soldado da República", description: "Militar treinado para cumprir missões de combate, defesa e manutenção da paz.", archetype: "marcial", ppModifier: 0 },
  { id: "vigilante", name: "Vigilante", description: "Justiceiro independente que protege pessoas ou comunidades sem responder a governos ou facções.", archetype: "marcial", ppModifier: 1 },
];

export const CLASS_BY_ID: Record<string, StarWarsClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c])
);

/** As 3 classes-base ligadas à Força não podem ser multiclassadas entre si. */
export const FORCE_BASE_CLASS_IDS = ["acolito_sith", "andarilho_forca", "padawan_jedi"];
