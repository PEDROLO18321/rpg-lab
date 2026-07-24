// Star Wars: Além da Fronteira — nomes sugeridos por espécie (masculino/feminino/sobrenome)

export interface SpeciesNames {
  male: string[];
  female: string[];
  family?: string[];
}

export const NAMES_BY_SPECIES: Record<string, SpeciesNames> = {
  anzat: { male: ["Vessk", "Thane", "Ordo", "Miren", "Cassiv", "Rethal", "Dostan", "Ilvex"], female: ["Sael", "Nyra", "Isvath", "Corina", "Meshel", "Adyra", "Voss", "Ilanya"] },
  arkanian: { male: ["Doryen", "Callus", "Nezmar", "Ivo", "Sethric", "Aldren", "Corvain", "Milov"], female: ["Selra", "Yvaine", "Cass", "Odalys", "Miraen", "Thessaly", "Vionne", "Aris"] },
  besalisk: { male: ["Groff", "Dugo", "Mokk", "Barnak", "Thoon", "Kelbo", "Ruskan", "Vozz"], female: ["Runa", "Bellik", "Sorra", "Ganne", "Dessik", "Molva", "Yerra", "Ossa"] },
  bothan: { male: ["Fen'dral", "Bor'sen", "Kael'tir", "Vash'ren", "Do'nari", "Elrik", "Sav'ka", "Trask"], female: ["Mira'sen", "Yssa'lin", "Kess'ra", "Vell'ora", "Sha'reen", "Nira", "Pell'ora", "Toka'ri"] },
  cathar: { male: ["Rawrk", "Sithan", "Jorrek", "Vael", "Thassan", "Korrin", "Behsyk", "Zannen"], female: ["Ashka", "Sythir", "Neela", "Vraan", "Tirsa", "Kessa", "Ravyn", "Mirsha"], family: ["Ka'thra", "Vor'kai", "Sun-Strider", "Longclaw"] },
  cerean: { male: ["Ky'val", "Ronhar", "Teyus", "Alvenn", "Dessar", "Yovan", "Menrik", "Sarrus"], female: ["Ilyara", "Venn", "Cassia", "Orinel", "Thysa", "Melira", "Auren", "Fennah"] },
  chagrian: { male: ["Dev'ren", "Katho", "Mors'kel", "Vandu", "Sel'rik", "Orondo", "Thanuk", "Bel'kar"], female: ["Ryn'dala", "Sevari", "Ondrys", "Mirai", "Talessa", "Vondrel", "Ishara", "Kelvara"] },
  devaronian: { male: ["Sinjir", "Vashek", "Morlan", "Rakan", "Duskan", "Theval", "Orrik", "Zaltis"], female: ["Kessa", "Nyrri", "Vahla", "Sorna", "Thessa", "Ildri", "Mavren", "Sylka"] },
  duros: { male: ["Rugor", "Vaas", "Neek", "Dallo", "Torbin", "Iggo", "Sennar", "Ossuk"], female: ["Ylena", "Corsa", "Vindra", "Nella", "Sethi", "Ambris", "Tolwen", "Reska"] },
  echani: { male: ["Teral", "Ashenn", "Corvus", "Ravel", "Dessin", "Ilvar", "Sethos", "Marrek"], female: ["Elara", "Vashti", "Corinne", "Isolde", "Serah", "Meridi", "Thalise", "Anwen"], family: ["Sil'dara", "Whitecrest", "Vael-lin"] },
  falleen: { male: ["Xarion", "Thessik", "Vandros", "Kellan", "Osric", "Malven", "Serath", "Draeko"], female: ["Sariel", "Yvane", "Lethia", "Corvassa", "Ilvina", "Zephira", "Mavrel", "Ondressa"] },
  gendai: { male: ["Korrath", "Bhun", "Vessik", "Torvane", "Dhurak", "Kelvorn", "Ossian", "Marrgul"], female: ["Vashani", "Thurra", "Kelvessa", "Ondrai", "Serresh", "Yavine", "Corrath", "Ithara"] },
  humano: { male: ["Adrian", "Kaelan", "Dorian", "Silas", "Marek", "Corin", "Talon", "Reven"], female: ["Elara", "Sienna", "Mira", "Aveline", "Talia", "Rhea", "Vesper", "Nadia"], family: ["Vantar", "Korr", "Solari", "Draven", "Ashwood"] },
  iktotchi: { male: ["Zeth", "Kravor", "Ombu", "Vashan", "Terrik", "Dessik", "Molran", "Ossek"], female: ["Ilya", "Vessa", "Korrina", "Thassil", "Ondra", "Serika", "Mavena", "Corith"] },
  kel_dor: { male: ["Plif", "Ithor", "Vandar", "Sennik", "Morath", "Dellak", "Ossan", "Threnn"], female: ["Ilana", "Vessari", "Cordis", "Selvana", "Tirana", "Modessa", "Yssaka", "Ondria"] },
  kiffar: { male: ["Kael", "Sifo", "Vondar", "Thren", "Dessal", "Orran", "Melkor", "Sarrus"], female: ["Vessia", "Ilraya", "Sonnah", "Kressel", "Marrisa", "Odara", "Tessik", "Yvenna"], family: ["Djinn", "Vos-Kai", "Thane-Ren"] },
  mirialan: { male: ["Bariss", "Luminen", "Serrik", "Onvar", "Kessad", "Devrik", "Malen", "Torvis"], female: ["Bariss", "Luminara", "Serel", "Ondara", "Kessia", "Devani", "Malorei", "Torvessa"] },
  miraluka: { male: ["Vhondar", "Serrik", "Ossian", "Kelthar", "Dravor", "Mennis", "Ilvath", "Sorrel"], female: ["Visas", "Serrena", "Ondrelle", "Kelvessa", "Dravena", "Mennisa", "Ilyara", "Sorrelia"] },
  mon_calamari: { male: ["Ackbar", "Nammo", "Verrin", "Toolan", "Dessik", "Korvath", "Ossen", "Melvar"], female: ["Vessia", "Nira", "Colvessa", "Torina", "Dessia", "Korvena", "Ossalia", "Melvara"] },
  nautolan: { male: ["Kit", "Voss'or", "Nahdar", "Tessik", "Ossan", "Melvor", "Dravik", "Korrath"], female: ["Ahsla", "Nira", "Vessana", "Tessia", "Ossalia", "Melvara", "Dravena", "Korressa"] },
  nikto: { male: ["Ghouk", "Rugor", "Vessik", "Molran", "Dothar", "Kessil", "Ombrek", "Sarrun"], female: ["Vashti", "Ossara", "Melvina", "Dothara", "Kessila", "Ombreka", "Sarruna", "Vessana"] },
  pantoran: { male: ["Riyo", "Vorrik", "Cassel", "Dennar", "Ossik", "Melvan", "Torrel", "Ilvane"], female: ["Riyala", "Vorrissa", "Cassia", "Dennara", "Ossika", "Melvana", "Torrela", "Ilvanea"] },
  quarren: { male: ["Tessek", "Nym", "Dossen", "Korrath", "Melvik", "Vashor", "Ossral", "Dranik"], female: ["Tessia", "Nyma", "Dossara", "Korressa", "Melvika", "Vashora", "Ossrala", "Dranika"] },
  rattataki: { male: ["Asajj", "Krellan", "Vossik", "Mordek", "Thrall", "Kessan", "Ombra", "Sarrek"], female: ["Asajj", "Krella", "Vossika", "Mordeka", "Thralla", "Kessana", "Ombraka", "Sarreka"] },
  rodian: { male: ["Greedo", "Wald", "Tessik", "Ombrek", "Vossan", "Korrik", "Melvor", "Dashan"], female: ["Vessia", "Tessika", "Ombreka", "Vossana", "Korrika", "Melvora", "Dashana", "Ossela"] },
  shistavanen: { male: ["Volk", "Ragnar", "Thessik", "Korvane", "Vashul", "Dessik", "Ombrath", "Sarrik"], female: ["Vessana", "Thessa", "Korvani", "Vashula", "Dessika", "Ombratha", "Sarrika", "Ilvara"] },
  sullustan: { male: ["Nien", "Dorrik", "Vossen", "Kessal", "Ombran", "Melvik", "Tessor", "Dranok"], female: ["Vessia", "Dorrika", "Vossena", "Kessala", "Ombrana", "Melvika", "Tessora", "Dranoka"] },
  togruta: { male: ["Reeva", "Kaeso", "Vondrik", "Dessan", "Korrath", "Melvor", "Tessik", "Ombrek"], female: ["Ahsoka", "Shaak", "Vondrika", "Dessana", "Korratha", "Melvora", "Tessika", "Ombreka"] },
  twilek: { male: ["Bib", "Gronn", "Vossik", "Korrath", "Melvan", "Dessik", "Ombrek", "Tessor"], female: ["Aayla", "Oola", "Vossika", "Korratha", "Melvana", "Dessika", "Ombreka", "Tessora"] },
  umbaran: { male: ["Sorrik", "Vandel", "Ombrath", "Kessan", "Dravor", "Melvik", "Tessan", "Korruk"], female: ["Sorrika", "Vandela", "Ombratha", "Kessana", "Dravora", "Melvika", "Tessana", "Korruka"] },
  voss: { male: ["Ithorel", "Vandar", "Sennik", "Dravos", "Kellan", "Ombreth", "Melvor", "Torrik"], female: ["Ithara", "Vandara", "Sennika", "Dravosa", "Kellana", "Ombretha", "Melvora", "Torrika"] },
  weequay: { male: ["Hondo", "Sarrek", "Dothan", "Vossik", "Krell", "Ombrath", "Melvor", "Tessan"], female: ["Sarreka", "Dothana", "Vossika", "Krella", "Ombratha", "Melvora", "Tessana", "Ossela"] },
  wookiee: { male: ["Chewbacca", "Tarrfu", "Gorrik", "Wullffwarro", "Attichitcuk", "Salporin", "Freetauwaa", "Dryanta"], female: ["Malla", "Lumpawarrump", "Mallatobuck", "Wyshka", "Sirrakuk", "Attaycca", "Grakchawwaa", "Ittawaa"], family: ["Bacca-clan", "Warro-clan"] },
  zabrak: { male: ["Maul", "Savage", "Feral", "Krellan", "Ombreth", "Dessik", "Vondrik", "Sarrek"], female: ["Kavara", "Sorrika", "Ombretha", "Dessika", "Vondrika", "Sarreka", "Talora", "Ilvessa"] },
  zeltron: { male: ["Dengar", "Vossik", "Kessan", "Ombrath", "Melvor", "Torrik", "Dravos", "Sennar"], female: ["Zara", "Vossika", "Kessana", "Ombratha", "Melvora", "Torrika", "Dravosa", "Sennara"] },
};

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
