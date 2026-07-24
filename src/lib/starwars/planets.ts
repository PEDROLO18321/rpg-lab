// Star Wars: Além da Fronteira — os 28 planetas de origem, cada um com uma Habilidade Natal (+5 em perícias)

export interface Planet {
  id: string;
  name: string;
  description: string;
  naturalAbility: { name: string; description: string; skills: string[] };
}

export const PLANETS: Planet[] = [
  { id: "coruscant", name: "Coruscant", description: "Capital da República e centro político da galáxia, totalmente urbanizado.", naturalAbility: { name: "Cidadão da Capital", description: "+5 em Diplomacia ou Conhecimento Galáctico ao lidar com instituições e governos.", skills: ["diplomacia", "conhecimento_galactico"] } },
  { id: "alderaan", name: "Alderaan", description: "Mundo pacífico, conhecido por sua cultura, diplomacia e educação refinada.", naturalAbility: { name: "Diplomata Nato", description: "+5 em Diplomacia e Persuasão durante negociações pacíficas.", skills: ["diplomacia", "persuasao"] } },
  { id: "corellia", name: "Corellia", description: "Planeta industrial famoso por seus pilotos, engenheiros e fabricantes de naves.", naturalAbility: { name: "Sangue Corelliano", description: "+5 em Pilotagem Espacial e Mecânica envolvendo naves.", skills: ["pilotagem_espacial", "mecanica"] } },
  { id: "chandrila", name: "Chandrila", description: "Mundo de tradição política e grande influência no Senado Galáctico.", naturalAbility: { name: "Influência Política", description: "+5 em Diplomacia e Persuasão com autoridades e oficiais.", skills: ["diplomacia", "persuasao"] } },
  { id: "anaxes", name: "Anaxes", description: "Um dos maiores centros militares da República, formação de oficiais.", naturalAbility: { name: "Treinamento Militar", description: "+5 em Liderança durante combate ou comando de tropas.", skills: ["lideranca"] } },
  { id: "naboo", name: "Naboo", description: "Mundo de beleza exuberante, equilíbrio entre natureza e tecnologia.", naturalAbility: { name: "Elegância Naboo", description: "+5 em Persuasão e Diplomacia com educação e protocolo.", skills: ["persuasao", "diplomacia"] } },
  { id: "cato_neimoidia", name: "Cato Neimoidia", description: "Centro comercial extremamente rico, lar dos neimoidianos.", naturalAbility: { name: "Instinto Comercial", description: "+5 em Diplomacia e Persuasão em compras, vendas e acordos.", skills: ["diplomacia", "persuasao"] } },
  { id: "rendili", name: "Rendili", description: "Importante polo naval e de construção de cruzadores da República.", naturalAbility: { name: "Engenharia Naval", description: "+5 em Mecânica e Computação em grandes naves espaciais.", skills: ["mecanica", "computacao"] } },
  { id: "bothawui", name: "Bothawui", description: "Planeta dos Bothans, conhecidos pela inteligência e espionagem.", naturalAbility: { name: "Rede de Informações", description: "+5 em Investigação e Enganação ao obter ou esconder informações.", skills: ["investigacao", "enganacao"] } },
  { id: "kashyyyk", name: "Kashyyyk", description: "Mundo florestal dos Wookiees, repleto de fauna perigosa.", naturalAbility: { name: "Filho da Selva", description: "+5 em Sobrevivência e Percepção em ambientes naturais.", skills: ["sobrevivencia", "percepcao"] } },
  { id: "dantooine", name: "Dantooine", description: "Mundo agrícola tranquilo, antigo local de treinamento Jedi.", naturalAbility: { name: "Mente Serena", description: "+5 em Percepção e Conhecimento da Força em reflexão ou meditação.", skills: ["percepcao", "conhecimento_forca"] } },
  { id: "ithor", name: "Ithor", description: "Planeta exuberante, reverenciado por seu equilíbrio ecológico.", naturalAbility: { name: "Guardião da Natureza", description: "+5 em Ciências e Sobrevivência envolvendo fauna e flora.", skills: ["ciencias", "sobrevivencia"] } },
  { id: "malastare", name: "Malastare", description: "Conhecido por suas corridas de Pods e intensa atividade industrial.", naturalAbility: { name: "Piloto Competitivo", description: "+5 em Pilotagem Atmosférica em corridas e manobras de alta velocidade.", skills: ["pilotagem_atmosferica"] } },
  { id: "tatooine", name: "Tatooine", description: "Mundo desértico, hostil e dominado por criminosos e Hutts.", naturalAbility: { name: "Sobrevivente do Deserto", description: "+5 em Sobrevivência e Atletismo em ambientes hostis.", skills: ["sobrevivencia", "atletismo"] } },
  { id: "mandalore", name: "Mandalore", description: "Mundo natal dos Mandalorianos, marcado pela guerra e honra.", naturalAbility: { name: "Espírito Guerreiro", description: "+5 em Armas de Energia e Intimidação durante combates.", skills: ["armas_energia", "intimidacao"] } },
  { id: "mon_cala", name: "Mon Cala", description: "Planeta oceânico dos Mon Calamari, mestres da engenharia naval.", naturalAbility: { name: "Mestre das Naves", description: "+5 em Pilotagem Espacial e Mecânica em espaçonaves.", skills: ["pilotagem_espacial", "mecanica"] } },
  { id: "ryloth", name: "Ryloth", description: "Mundo dos Twi'leks, conhecido por sua resistência e adaptação.", naturalAbility: { name: "Resiliência", description: "+5 em Atletismo e Sobrevivência para resistir a ambientes extremos.", skills: ["atletismo", "sobrevivencia"] } },
  { id: "rodia", name: "Rodia", description: "Planeta de caçadores, onde sobreviver exige habilidade e precisão.", naturalAbility: { name: "Instinto de Caçador", description: "+5 em Percepção e Investigação durante rastreamentos.", skills: ["percepcao", "investigacao"] } },
  { id: "geonosis", name: "Geonosis", description: "Mundo árido de fábricas e gigantescas colmeias industriais.", naturalAbility: { name: "Engenheiro Industrial", description: "+5 em Computação e Mecânica para construir ou reparar máquinas.", skills: ["computacao", "mecanica"] } },
  { id: "felucia", name: "Felucia", description: "Planeta selvagem coberto por flora e fauna exóticas e perigosas.", naturalAbility: { name: "Adaptação Selvagem", description: "+5 em Sobrevivência e Ciências em ambientes alienígenas.", skills: ["sobrevivencia", "ciencias"] } },
  { id: "christophsis", name: "Christophsis", description: "Mundo cristalino frequentemente marcado por conflitos militares.", naturalAbility: { name: "Veterano de Guerra", description: "+5 em Liderança e Intimidação em confrontos militares.", skills: ["lideranca", "intimidacao"] } },
  { id: "ord_mantell", name: "Ord Mantell", description: "Planeta conhecido pelo comércio, mercenários e sucata tecnológica.", naturalAbility: { name: "Improvisador", description: "+5 em Computação e Mecânica usando recursos limitados.", skills: ["computacao", "mecanica"] } },
  { id: "lothal", name: "Lothal", description: "Mundo agrícola em expansão, rico em vida selvagem.", naturalAbility: { name: "Espírito Explorador", description: "+5 em Percepção e Investigação ao explorar novos locais.", skills: ["percepcao", "investigacao"] } },
  { id: "jedha", name: "Jedha", description: "Antigo mundo sagrado para diversas tradições ligadas à Força.", naturalAbility: { name: "Eco da Força", description: "+5 em Conhecimento da Força e Percepção relacionados à Força.", skills: ["conhecimento_forca", "percepcao"] } },
  { id: "ilum", name: "Ilum", description: "Planeta gelado onde os Jedi buscavam seus cristais kyber.", naturalAbility: { name: "Sintonia Kyber", description: "+5 em Conhecimento da Força e Domínio da Força envolvendo cristais kyber.", skills: ["conhecimento_forca", "dominio_forca"] } },
  { id: "onderon", name: "Onderon", description: "Mundo de florestas densas e cidades fortificadas, guerreiros natos.", naturalAbility: { name: "Guerreiro Nato", description: "+5 em Atletismo e Intimidação em confrontos físicos.", skills: ["atletismo", "intimidacao"] } },
  { id: "dxun", name: "Dxun", description: "Lua selvagem de Onderon, repleta de predadores e perigos naturais.", naturalAbility: { name: "Predador", description: "+5 em Furtividade e Sobrevivência em caçadas.", skills: ["furtividade", "sobrevivencia"] } },
  { id: "ossus", name: "Ossus", description: "Antigo centro do conhecimento Jedi, repleto de ruínas e história.", naturalAbility: { name: "Erudito Jedi", description: "+5 em Conhecimento Galáctico e Conhecimento da Força ao estudar ruínas.", skills: ["conhecimento_galactico", "conhecimento_forca"] } },
];

export const PLANET_BY_ID: Record<string, Planet> = Object.fromEntries(
  PLANETS.map((p) => [p.id, p])
);
