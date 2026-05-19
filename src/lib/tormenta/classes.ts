export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

export interface TormentaClass {
  id: string;
  name: string;
  icon: string;
  description: string;
  flavor: string;
  primaryAbilities: string[];
  hitDie: number;
  baseHP: number;
  startingMana: number;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: string[];
  skillCount: number;
  keyFeatures: string[];
  spellcasting: boolean;
  spellcastingAbility: string | null;
}

export const classes: TormentaClass[] = [
    {
        id: "Arcanista",
        name: "Arcanista",
        icon: "🧙",
        description: "Focados em magias, aqueles nascidos, aqules que se venderão a demonios e até os grandes estudiosos",
        flavor: "O Arcanista é o usuário máximo das magias de Arton",
        primaryAbilities: ["Inteligência"],
        hitDie: 6,
        baseHP: 8,
        startingMana: 6,
        armorProficiencies: ["Nenhuma"],
        weaponProficiencies:["Nenhuma"],
        toolProficiencies:[],
        skillChoices: ["Conhecimento", "Iniciativa", "Oficio", "Percepção"],
        skillCount: 1,
        keyFeatures: [
          "Caminho do Arcanista: Escolha entre bruxo, mago e feiticeiro",
          "Magias: Circulo 1",
          "Poder de Arcanista (2º)",
          "Poder de Arcanista (3º)",
          "Poder de Arcanista (4º)",
          "Magias: Circulo 2 (5º)",
          "Poder de Arcanista (5º)",
          "Poder de arcanista (6º)",
          "Poder de arcanista (7º)",
          "Poder de arcanista (8º)",
          "Poder de arcanista (9º)",
          "Magias (3º círculo) (9º)",
          "Poder de arcanista (10º)",
          "Poder de arcanista (11º)",
          "Poder de arcanista (12º)",
          "Poder de arcanista (13º)",
          "Magias (4º círculo) (13º)",
          "Poder de arcanista (14º)",
          "Poder de arcanista (15º)",
          "Poder de arcanista (16º)",
          "Poder de arcanista (17º)",
          "Magias (5º círculo) (17º)",
          "Poder de arcanista (18º)",
          "Poder de arcanista (19º)",
          "Poder de arcanista (20º)",
          "Alta arcana (20º)"
        ],
        spellcasting: true,
        spellcastingAbility: "Inteligência"
    },
]