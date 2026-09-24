# Arquitetura do RPG Lab

Documento de referência técnica do TCC. Cobre as decisões de projeto, o modelo
de dados, o fluxo de criação de ficha e — a parte mais importante para a
avaliação — **como as regras de cada sistema de RPG foram adaptadas**, incluindo
o que foi simplificado e por quê.

> Escopo em números: ~74.000 linhas de TypeScript em `src/` (fora o client gerado
> pelo Prisma), 5 sistemas de RPG, 56 modelos no banco, 204 testes automatizados
> mais uma suíte ponta a ponta.

---

## 1. O problema e a decisão central

Criar um personagem de RPG exige ler dezenas de páginas de regras antes de tomar
a primeira decisão. O objetivo do trabalho é remover esse pré-requisito: o
usuário deve conseguir montar uma ficha **válida e jogável** sem ter lido o
livro.

Isso impõe duas exigências que guiaram toda a arquitetura:

1. **As regras precisam viver no código, não na cabeça do usuário.** Cada
   escolha do assistente carrega a explicação da regra no ponto da decisão.
2. **O sistema precisa impedir fichas inválidas.** Se o usuário não conhece as
   regras, ele não tem como perceber que errou — a validação é obrigação do
   software.

A consequência arquitetural: **regras são dados tipados, não código
imperativo**. Uma raça de D&D é um objeto `Race`; uma classe é um objeto
`DndClass`. Adicionar conteúdo é adicionar um item a um array, e o compilador
recusa um item malformado.

```ts
// src/lib/dnd/races.ts
{
  id: "anao",
  name: "Anão",
  baseBonus: { con: 2 },
  speed: 7.5,
  traits: ["Visão no Escuro", "Resiliência Anã", …],
  subraces: [{ id: "anao-colina", bonus: { wis: 1 }, … }],
}
```

---

## 2. Camadas

```
src/app/dashboard/<sistema>/    UI  — assistente, ficha, área do Mestre
src/app/api/                    HTTP — autenticação, validação, persistência
src/components/play/            UI  — moldura comum das cinco áreas de Jogar
src/lib/<sistema>/              REGRAS — dados e funções puras, sem I/O
src/lib/campaign/               INFRA compartilhada da área do Mestre
src/lib/party/                  VÍNCULO ficha→campanha e visão do Mestre
prisma/schema.prisma            BANCO
```

A regra que sustenta a testabilidade: **`src/lib/<sistema>/` não faz I/O**. Não
importa Prisma, não faz `fetch`, não lê `window`. São funções puras sobre dados
— por isso os 204 testes rodam em milissegundos, sem banco e sem servidor.

As cinco áreas de Jogar compartilham `src/components/play/`: `PlayShell`
(faixa de vitais em largura cheia + duas colunas `1.4fr / 1fr`), `PlayCard`,
`VitalBar`, `StatChip`, `RollHistory`, `DicePanel` e `ConditionPicker`. A
divisão é sempre a mesma — **à esquerda o que o personagem faz** (atributos,
perícias, ações, recursos, inventário), **à direita a mesa** (dados, histórico,
condições, descanso, dinheiro, referência).

A cor de cada sistema é híbrida por necessidade. `PlayShell` sobrescreve
`--accent`, `--accent-light`, `--accent-dim`, `--border-accent` e
`--accent-glow` na própria subárvore, então qualquer estilo inline lê a cor
certa sem prop nem contexto. Mas `Dice3D` repassa a cor direto ao material do
three.js, e `new THREE.Color("var(--accent)")` não funciona — por isso
`PLAY_THEME` existe **em TypeScript como fonte de verdade**, e é o literal que
vai para `RollResultDie`, `RollToast` e `DieSvg`.

Cada sistema escreve um adaptador curto do seu tipo de rolagem para
`PlayRollEntry`. É o que deixa os níveis de sucesso do Cthulhu e o "maior/pior"
da Ordem sobreviverem sem poluir o componente comum. Inventário, descanso,
dinheiro, espaços de magia e listas de perícia **não** viraram componentes
compartilhados: os cinco formatos de dados são genuinamente diferentes, e
compartilhar a moldura já entrega a padronização.

O cálculo e a persistência são separados de propósito. O padrão aparece no
level-up: uma função pura monta o *plano*, e a rota apenas o aplica numa
transação.

```ts
// lib: puro, testável
const plan = buildLevelUpPlan(cls.id, sheet.path, sheet.level);

// rota: aplica o plano atomicamente
await prisma.$transaction([ … ]);
```

---

## 3. Modelo de dados

### 3.1 Núcleo agnóstico + ficha por sistema

`Character` guarda o que todo personagem tem, independente de sistema: dono,
nome, retrato, sistema. Cada sistema tem sua própria tabela de ficha, ligada por
**chave primária compartilhada** (`DndSheet.id` *é* `Character.id`).

```prisma
model Character {
  id       String @id @default(cuid())
  userId   String
  systemId String
  name     String

  dndSheet      DndSheet?
  tormentaSheet TormentaSheet?
  cthulhuSheet  CthulhuSheet?
  ordemSheet    OrdemSheet?
  starWarsSheet StarWarsSheet?
}
```

**Por que não uma tabela única com todos os campos?** Porque os sistemas não
compartilham atributos: D&D tem Força/Destreza/…, Cthulhu tem percentuais
(FOR/CON/TAM/POD/EDU), Ordem tem cinco atributos numa escala curta. Uma tabela
única seria uma colcha de colunas nulas. **Por que não JSON puro?** Porque
perderia tipagem e integridade referencial. A chave compartilhada dá o melhor
dos dois: um núcleo comum consultável e uma ficha fortemente tipada por sistema.

### 3.2 Trade-off assumido: relacional em D&D, JSON nos demais

Esta é a inconsistência mais visível do schema, e é **deliberada**:

| Sistema | Estratégia | Motivo |
|---|---|---|
| D&D 5e | Relacional — `DndClass`, `DndSkill`, `DndSpell`, `DndEquipment`, `DndFeature` | Primeiro sistema implementado; multiclasse exige consultar classes individualmente; grimório cresce e é filtrado |
| Tormenta, Cthulhu, Ordem, Star Wars | Colunas `Json` | Sempre lidos e gravados como bloco inteiro junto com a ficha; nenhuma consulta filtra por perícia ou item isolado |

O custo é real: as fichas em JSON não podem ser consultadas por campo interno
(“quantos personagens têm a perícia Furtividade?”). O benefício é que
adicionar um sistema novo custa **uma tabela**, não seis — o que viabilizou
chegar a cinco sistemas no prazo.

**Limite da escolha:** se o trabalho evoluir para relatórios ou busca por
conteúdo de ficha, os quatro sistemas precisarão migrar para o formato
relacional de D&D.

### 3.3 `Json` nativo, não texto

As colunas de bloco usam o tipo `Json` do Prisma (JSONB no Postgres), não
`String` com JSON serializado. Isso dá validação no banco, evita
`JSON.parse`/`stringify` espalhados pela aplicação e abre a porta para operadores
JSONB no futuro.

O acesso é centralizado em dois helpers ([`characterTransfer.ts`](../src/lib/characterTransfer.ts)):

```ts
parseJsonField<T>(raw, fallback)   // leitura tolerante a dado corrompido
toJsonFieldOrNull(v, maxBytes)     // escrita com teto de tamanho
```

`parseJsonField` ainda aceita `string` por compatibilidade com linhas anteriores
à migração `20260917120000_json_columns`, que converteu 48 colunas com
`ALTER … USING ::jsonb` preservando os dados.

> **Armadilha registrada:** o `prisma migrate` gera `DROP COLUMN` + `ADD COLUMN`
> para essa mudança de tipo, o que **apagaria todos os dados**. A migration foi
> escrita à mão com cast `USING`.

### 3.4 Campanhas: configuração como dado

A área do Mestre tem a mesma mecânica nos cinco sistemas (listar, criar, editar,
gerenciar sub-recursos) e varia só na configuração. Essa variação vive em
[`registry.ts`](../src/lib/campaign/registry.ts):

```ts
export const CAMPAIGNS: Record<SystemKey, CampaignConfig> = {
  cthulhu: {
    slug: "cthulhu",
    storyRelation: "cthulhuStory",
    enumFields: { era: ["1920s", "modern", "outro"] },
    resources: {
      npcs:     { delegate: "cthulhuNpc", relation: "cthulhuNpcs", fields: [...] },
      insanity: { delegate: "cthulhuInsanityRecord", relation: "cthulhuInsanity", … },
      …
    },
  },
  …
};
```

Com isso, **4 rotas genéricas** em `/api/campaigns/[system]/…` atendem os cinco
sistemas, no lugar das 20 rotas duplicadas anteriores. O campo `fields` é uma
*whitelist*: só o que está listado pode ser gravado, o que fecha a porta para
escrita de campos arbitrários.

A resposta da API é **normalizada** — o front recebe `npcs`, `combatants`,
`story`, nunca `dndNpcs` ou `ordemStory`. A UI não conhece os nomes de relação
do Prisma.

**Dívida reconhecida:** o banco ainda tem seis tabelas por sistema (`DndNpc`,
`TormentaNpc`, …) onde caberiam seis tabelas com uma coluna discriminadora. A
camada de aplicação já está unificada; a do banco não.

---

## 4. Fluxo de criação de ficha

Três caminhos, atendendo perfis diferentes de usuário:

```
                    ┌─ Deixe-me Criar ──→ assistente passo a passo
/dashboard/<s>/new ─┼─ Crie Para Mim ──→ geração automática
                    └─ Importar JSON ──→ ficha exportada antes
```

### 4.1 Assistente passo a passo

Etapas por sistema (o vocabulário acompanha o sistema — “origem” em Ordem,
“planeta” em Star Wars):

| Sistema | Etapas |
|---|---|
| D&D 5e | Raça → Classe → Antecedente → Atributos → Descrição → Equipamento → Magias → Revisão |
| Tormenta 20 | Raça → Classe → Origem → Atributos → Magias → Equipamento → Descrição → Revisão |
| Ordem Paranormal | Atributos → Origem → Classe → *(Rituais)* → Perícias → Equipamento → Conceito → Revisão |
| Call of Cthulhu | Atributos → Perícias → Antecedentes → Equipamento → Revisão |
| Star Wars | Espécie → Planeta → Classe → Atributos → Perícias → Caminho → Descrição → Revisão |

A ordem não é a mesma em todos porque acompanha a **dependência das regras de
cada sistema**: em D&D a raça define bônus de atributo, então vem antes dos
Atributos; em Ordem os atributos são comprados livremente e vêm primeiro. A
etapa *Rituais* da Ordem é **condicional** — só aparece quando a classe
escolhida é Ocultista:

```ts
const steps = useMemo<StepDef[]>(() => {
  if (data.classId === "ocultista") {
    return [...STEPS_BASE.slice(0, 3), STEP_RITUAIS, ...STEPS_BASE.slice(3)];
  }
  return STEPS_BASE;
}, [data.classId]);
```

O estado vive num único objeto `WizardData` no componente do assistente; cada
etapa recebe uma fatia e devolve um `patch`. O avanço é bloqueado por
`canAdvance`, que checa as exigências da etapa — é aqui que o software impede a
ficha inválida.

**O conteúdo didático fica no ponto da decisão**, não num manual à parte:
descrição de cada atributo, mapa das 18 perícias e seus atributos governantes,
custo de compra por pontos, idade adulta e longevidade de cada raça, progressão
nível a nível de cada classe.

### 4.2 Geração automática

`generateLevel1Build()` sorteia todas as escolhas respeitando as restrições da
classe e da raça; `buildAutoLevelPlan()` aplica a progressão até o nível pedido.

A garantia de que o resultado é sempre jogável é **testada**, não afirmada:
[`tests/auto-generate.test.ts`](../tests/auto-generate.test.ts) roda a geração 60
vezes por asserção e verifica que a raça existe, a classe existe, os atributos
seguem o array padrão, as perícias pertencem à lista da classe e não se repetem.

### 4.3 Importação

Ficha exportada em JSON (`rpglab.<sistema>.v1`). Como o arquivo vem do usuário,
[`characterImport.ts`](../src/lib/characterImport.ts) valida em camadas: sessão →
tamanho do corpo → formato do envelope → **domínio de cada campo**.

```ts
level: intIn(s.level, 1, MAX_LEVEL, 1),   // recusa 99999
str:   intIn(s.str, 1, 30, 10),           // recusa 999999
skills: toJsonFieldOrNull(s.skills ?? {}) // recusa payload inflado
```

Valor fora da faixa é **recusado com 400 e mensagem explicativa**, não truncado
em silêncio — o usuário precisa saber que o arquivo tem problema.

---

## 5. Adaptação das regras, sistema a sistema

Esta seção é o núcleo acadêmico: o que foi implementado, o que foi simplificado,
e o critério.

**Critério geral aplicado:** implementar integralmente tudo que afeta a
**criação e a evolução da ficha**; representar de forma assistida o que afeta o
**jogo em mesa** (rolagens, condições); omitir o que pertence à **narrativa do
Mestre** e não tem representação na ficha.

### 5.1 Dungeons & Dragons 5e

**Base:** SRD 5.1 (CC BY 4.0), revisão de **2014** — não a de 2024. A diferença
importa: nesta versão os bônus de atributo vêm da raça, não do antecedente.

Conteúdo: 9 raças (9 sub-raças), 12 classes (41 subclasses), 13 antecedentes,
206 magias, 217 monstros no bestiário do Mestre.

Implementado fielmente:

- Bônus de proficiência pela tabela de Avanço de Personagem (+2 a +6)
- PV por nível pelo valor fixo (média do Dado de Vida arredondada para cima)
- Compra por pontos e array padrão `[15,14,13,12,10,8]`
- Defesa sem Armadura de Bárbaro (10+DES+CON) e Monge (10+DES+SAB)
- Tenacidade Anã (+1 PV por nível para o Anão da Colina)
- Melhoria de Valor de Habilidade com teto 20, incluindo os níveis extras de
  Guerreiro (6, 14) e Ladino (10)
- Espaços de magia por círculo, inclusive a tabela de multiclasse
- Constituição não governa perícia alguma (regra explícita do livro)

**Simplificações assumidas:**

| Item | Decisão | Motivo |
|---|---|---|
| **Talentos (Feats)** | Não implementados — no ASI, só distribuição de atributo | Regra opcional no livro; cada talento é um caso especial com efeito próprio, e o conjunto multiplicaria a superfície de regras sem ampliar a cobertura de criação |
| **Multiclasse** | Implementada na **evolução** (escolher classe nova ao subir de nível, com pré-requisito de atributo, proficiências parciais e espaços de magia combinados). Não oferecida na **criação** | O assistente atende quem não conhece o sistema; multiclassear no 1º nível é decisão avançada e não existe na regra oficial |
| **Magias** | 206 magias catalogadas, não o SRD inteiro | Priorizadas as de círculo baixo, as mais usadas na faixa de nível típica de mesa |
| **Conjuração detalhada** | Componentes e ritual exibidos como texto, sem simulação | Pertencem à mesa, não à ficha |

### 5.2 Tormenta 20

Conteúdo: 17 raças, 14 classes, 35 origens, 227 magias, 20 deuses.

Implementado: PV/PM por classe e nível, atributo-chave de conjuração por caminho
do Arcanista (Mago/Bruxo → INT, Feiticeiro → CAR), Paladino usando Carisma pelo
poder Abençoado, perícias fixas e escolhidas de classe e origem, poderes por
nível, escolas do Bardo e do Druida, Defesa com armadura e escudo.

> ### ⚠ Divergência consciente do livro: escala de atributos
>
> O Tormenta 20 oficial usa o valor do atributo **já como modificador**, numa
> faixa curta (−1 a +4). Esta implementação adota a **escala 3–20 com modificador
> derivado**, `floor((valor − 10) / 2)` — a convenção de D&D.
>
> **Por que:** D&D foi o primeiro sistema implementado e definiu o vocabulário da
> UI (compra por pontos, distribuição de array, exibição “valor / modificador”).
> Reaproveitar essa convenção em Tormenta manteve um único modelo mental de
> atributos no site inteiro.
>
> **Consequência:** a adaptação é **internamente consistente** — criação, evolução,
> cálculo de PV/PM e exibição usam a mesma convenção, e uma ficha gerada aqui é
> coerente consigo mesma. Mas os **valores de atributo não são transcritíveis
> diretamente** para uma ficha oficial de Tormenta 20 sem conversão.
>
> Registrado em teste, para não se perder de vista:
> [`tests/tormenta-ordem-rules.test.ts`](../tests/tormenta-ordem-rules.test.ts).

**Modo Jogar** (`tormenta/[id]/PlayMode.tsx`): teste de ataque como teste de Luta
ou Pontaria, dano somando Força no corpo a corpo e no arremesso mas não no
disparo, crítico pela margem de ameaça e multiplicador da arma (só os dados
multiplicam), magias debitando PM pelo círculo — com o +1 da condição
alquebrado —, as 33 condições do Apêndice, descanso recuperando PV e PM pelo
nível e pela qualidade do pernoite, e o sangramento de 0 PV com teste de
Constituição CD 15 e limiar de morte em −10 ou metade dos PV totais.

Outras simplificações: poderes de Tormenta e itens mágicos presentes como
catálogo, sem automação de efeito; sem regras de perseguição e de construção de
reinos.

### 5.3 Call of Cthulhu 7e

Conteúdo: 52 perícias, 20 ocupações; eras 1920, moderna e livre.

Implementado com fidelidade alta — é o sistema mais mecanicamente autocontido:

- Atributos percentuais, com `3d6×5` e `(2d6+6)×5` conforme o atributo
- Perícias com valor cheio, metade e um quinto
- PV = (CON+TAM)/10, PM = POD/5
- Bônus de Dano e Corpo pela tabela FOR+TAM
- MOV comparando FOR e DES com TAM, com penalidade por idade a partir dos 40
- Modificadores de idade, incluindo a redução do investigador jovem
- Níveis de sucesso (normal / bom / extremo), crítico e falha crítica
- Sanidade, com registro de fobias e manias na área do Guardião

Os **dados de bônus e de penalidade** (pág. 91) são a forma como o Guardião
ajusta um teste: um dado de dezenas a mais por nível, com um único dado de
unidades valendo para todas as leituras — o bônus fica com a menor, a penalidade
com a maior, e um de cada se anula. Por isso a ficha representa a regra inteira
num número só, de −2 a +2.

**Simplificações:** sem evolução por marcação de perícia entre sessões (o
sistema não tem “subir de nível”, e o ganho é decidido em mesa); combate tático
não simulado — a ficha oferece as rolagens, a resolução é do Guardião.

### 5.4 Ordem Paranormal

Conteúdo: 82 rituais, 26 origens, 3 classes com trilhas.

Implementado: progressão por **NEX** (5% a 99%) com os marcos oficiais — aumento
de atributo em 20/50/80/95, poder de classe em 15/30/45/60/75/90, grau de
treinamento em 35 (veterano) e 70 (expert), trilha em 10 com poderes automáticos
em 40/65/99, Versatilidade em 50, e liberação de círculo de ritual em 25/55/85
para o Ocultista. A quantidade de perícias melhoradas escala com Intelecto.

Também: PV/PE/Sanidade por classe e NEX, Defesa, patente, prestígio, e a
mecânica de **Membrana** na área do Mestre com os cinco estados e seus efeitos.

**Simplificações:** rituais catalogados com custo e descrição, sem automação de
efeito; itens com modificações e maldições como dados, sem cálculo automático de
categoria.

### 5.5 Star Wars: Além da Fronteira (autoral)

Sistema **de autoria própria**, criado para este trabalho. Regras completas em
[`StarWars-Teste/`](../StarWars-Teste/) (18 documentos).

Conteúdo: 35 espécies, 18 classes, 28 planetas, 26 perícias, 50 poderes gerais,
129 criaturas no bestiário.

Mecânicas próprias implementadas:

- **Pool de dados por atributo** — atributo ≥2 rola N dados pegando o maior;
  ≤0 rola com desvantagem, pegando o menor
- **Três pools de recurso**: PV, PE (Energia da Força) e PP (Pontos de Poder)
- **Graus de perícia** em seis níveis (inexperiente → mestre), em vez de
  proficiência binária
- **Habilidade Natal** por planeta, com escolha do jogador quando há mais de uma
  opção
- **Multiclasse real**, com teto por classe e pré-requisito de perícias expert
- **Caminho da Força** (luz / neutro / sombrio) e formas de sabre
- **Classes de Profecia** desbloqueáveis por senha, como conteúdo secreto que o
  Mestre libera

Por ser autoral, aqui não há questão de fidelidade — a implementação **é** a
especificação. O risco correspondente é o oposto: não existe fonte externa para
conferir o balanceamento.

---

## 6. Vínculo Mestre↔Jogador

A ficha do jogador e a mesa do Mestre eram dois mundos separados: o Mestre
redigitava os personagens à mão. O vínculo fecha essa lacuna **pelo link**, sem
convite e sem cadastro de membro.

O fluxo tem três passos e uma direção só:

1. O jogador liga o compartilhamento na própria ficha e recebe um link
   (`/s/<token>`). Pode regerar o token — o link anterior para de resolver — ou
   desligar o compartilhamento.
2. Quem abrir o link, **logado**, escolhe uma campanha **sua, do mesmo sistema**,
   e anexa a ficha.
3. A ficha aparece na aba *Grupo* da campanha, **somente leitura**.

```ts
// src/lib/party/service.ts — nada aqui escreve na ficha do jogador,
// apenas na tabela de vínculo.
await prisma.campaignCharacter.upsert({
  where: { campaignId_characterId: { campaignId, characterId: character.id } },
  create: { campaignId, characterId: character.id },
  update: {},
});
```

**Por que link e não convite.** `CampaignMember` modelava convite de usuário à
campanha e nunca foi usado (0 linhas em produção). O que o Mestre precisa é da
*ficha*, não do *usuário* — que é exatamente o que `CampaignCharacter` já
modelava. A migração `20260917180000_party_link` removeu `CampaignMember`, deu a
`Campaign.ownerId` a chave estrangeira que faltava, e acrescentou `linkedAt` mais
os índices das duas direções de consulta.

**Uma ficha, cinco sistemas, uma tela.** O Mestre vê fichas dos cinco sistemas na
mesma aba. Em vez de renderizar cinco fichas completas,
[`party/summary.ts`](../src/lib/party/summary.ts) reduz cada sistema a uma forma
comum — vitais, atributos, estatísticas, perícias — e a UI é uma só.

**Garantias do compartilhamento** (todas no servidor, não na tela):

| Risco | Guarda |
|---|---|
| Link adivinhado | Token é `randomUUID()`; ficha não pública devolve 404 |
| Enumeração de fichas | Token inválido e ficha fechada devolvem **a mesma** resposta — não revelamos qual dos dois é |
| Ficha em campanha alheia | `campaign.ownerId !== viewerId → 404` |
| Ficha em sistema errado | `campaign.systemId !== character.systemId → 409`, checado no servidor e não só na lista de campanhas |
| Mestre editando ficha alheia | A rota do grupo é **só GET**; desvincular apaga o vínculo, nunca a ficha |
| Revogação | Desligar o link para a resolução; vínculos já criados permanecem — o link **concede** o acesso, não o mantém |

---

## 7. Segurança

Três invariantes, todas verificadas em teste ou em smoke test:

**1. Identidade nunca vem do cliente.** `userId` sai da sessão e `systemId` é
resolvido pelo slug no servidor ([`apiAuth.ts`](../src/lib/apiAuth.ts)). O corpo
da requisição não é fonte de identidade.

```ts
const ctx = await authedSystemContext("dnd");
if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
// ctx.userId / ctx.systemId — confiáveis
```

**2. Escrita sempre por whitelist.** Nem nome de campo nem nome de tabela vêm do
cliente sem passar pelo registro (`pickFields`, `cfg.delegate`).

**3. Toda leitura confere dono.** `character.userId !== session.user.id → 403`.
A única exceção é deliberada e estreita: a ficha compartilhada por link, lida
pelo Mestre em modo somente leitura, sob as guardas da seção 6.

Senhas com bcrypt (custo 12). E-mail normalizado para minúsculas tanto no
cadastro quanto no login — caso contrário `Pedro@x.com` cria um registro que o
próprio dono não consegue acessar.

---

## 8. Acessibilidade

A meta adotada é **WCAG 2.1 nível AA**, e a estratégia é a mesma das regras de
RPG: o que pode ser verificado por máquina fica sob verificação automática, para
não depender de inspeção manual a cada tela nova.

**Markup — ESLint.** `eslint-config-next` registra o plugin `jsx-a11y` mas liga
só um punhado de regras; a configuração do projeto ativa o conjunto recomendado
inteiro — rótulo em controle, alternativa textual, papel ARIA válido, elemento
interativo alcançável por teclado.

```js
// eslint.config.mjs — só as regras: redeclarar o plugin quebra a configuração
{ rules: jsxA11y.flatConfigs.recommended.rules },
```

Uma regra foi desligada com justificativa registrada no próprio arquivo:
`jsx-a11y/no-autofocus`. Ela mira o autofoco no carregamento da página, que rouba
o contexto de quem usa leitor de tela; aqui os 25 usos estão em formulários e
diálogos montados **depois** de um clique explícito, onde levar o foco ao
primeiro campo é o que a WCAG 2.4.3 (Ordem de Foco) pede.

**Cor — teste.** Lint lê markup e não enxerga cor, então o contraste é verificado
por cálculo em `tests/contraste.test.ts` (seção 9).

**Teclado.** Controles clicáveis viraram `<button>`, com uma exceção estrutural:
cabeçalhos de painel que já contêm botões dentro — botão dentro de botão é markup
inválido. Nesses casos o padrão é `role="button"` + `tabIndex={0}` + o handler de
[`a11y.ts`](../src/lib/a11y.ts), que dá ao teclado o que o mouse já tinha
(WCAG 2.1.1):

```ts
export function activateOnKey(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Espaço rolaria a página
    action();
  };
}
```

Os `<div onClick>` restantes são `role="presentation"` que apenas interrompem a
propagação do clique — não são alvos interativos e não precisam de foco.

**O que não está coberto:** navegação com leitor de tela real e a experiência das
cenas 3D não foram auditadas manualmente; a verificação automática cobre markup e
contraste, não fluxo percebido.

---

## 9. Testes

204 testes em 9 arquivos, sem banco e sem servidor (`npm test`).

| Arquivo | Cobre |
|---|---|
| `dnd-leveling.test.ts` | Proficiência, PV por nível, XP, ASI com teto, espaços de magia |
| `cthulhu-rules.test.ts` | PV/PM, bônus de dano, MOV, modificadores de idade, faixa das rolagens, dados de bônus e penalidade |
| `tormenta-ordem-rules.test.ts` | Vitais T20, atributo-chave, bônus racial; marcos de NEX da Ordem |
| `starwars-rules.test.ts` | Pool de dados, atributos por espécie, vitais, Habilidade Natal |
| `auto-generate.test.ts` | Geração automática produz ficha válida nos 5 sistemas (60 execuções por asserção) |
| `character-transfer.test.ts` | Guardas de importação: faixa, tamanho, tipo, JSON corrompido |
| `party-summary.test.ts` | Normalização da ficha para a visão do Mestre nos 5 sistemas |
| `tormenta-play.test.ts` | Mesa do T20: crítico por margem/multiplicador, dano por tipo de arma, descanso, limiar de morte, pontos temporários, custo de magia |
| `contraste.test.ts` | Contraste dos tokens de cor de `globals.css` contra os limiares da WCAG 2.1 AA |

A ênfase é deliberada: **testar as regras**, que é onde um erro passa
despercebido — um bônus de proficiência errado não quebra a tela, só entrega um
personagem inválido.

Dois casos fogem desse molde de propósito:

- **`contraste.test.ts`** existe porque *lint* de acessibilidade lê markup e não
  enxerga cor. O teste lê os tokens do próprio `globals.css` — não uma cópia — e
  recusa qualquer combinação abaixo de 4,5:1 (texto normal) ou 3,0:1 (texto
  grande e componentes). Escurecer um token quebra o teste antes de chegar ao
  usuário.
- **`scripts/e2e-party.test.ts`** percorre o fluxo do vínculo ponta a ponta —
  gerar link → vincular → ler o grupo → desvincular —, com as tentativas
  indevidas no meio (campanha alheia, sistema errado, link desligado). Exige
  servidor no ar e banco real, então fica **fora** do `npm test`, em configuração
  separada e sem paralelismo (as etapas são encadeadas).

```bash
npm test                                    # 204 testes de regra, sem infraestrutura

npx next start -p 3100                      # e2e: precisa do servidor e do banco
npm run test:e2e
```

---

## 10. Limitações conhecidas

Registradas de propósito — são o roteiro de continuidade, não omissões
esquecidas.

| Limitação | Situação |
|---|---|
| **Vínculo só por link, sem convite** | O Mestre não convida um jogador nem o encontra por e-mail: depende do jogador gerar e enviar o link (seção 6). Foi a troca consciente por um fluxo que não exige cadastro de membro. |
| **Mestre não acompanha a ficha ao vivo** | A aba *Grupo* lê a ficha no momento da requisição; não há atualização em tempo real nem notificação de mudança. |
| **Tabelas de campanha duplicadas** | Aplicação unificada pelo registro de configuração, banco ainda com um conjunto de tabelas por sistema — 56 modelos no total. |
| **Fichas em JSON não são consultáveis** | Trade-off da seção 3.2. |
| **Export em PDF do visual desativado** | Só o layout estruturado de D&D exporta (`DndPrintSheet.tsx`). |
| **Responsividade desigual** | Existe folha responsiva própria para D&D, Tormenta, Ordem e Cthulhu; **Star Wars não tem**. |
| **Estilos inline** | 6.556 objetos `style={{…}}`; Tailwind está instalado e praticamente não é usado. |
| **Componentes monolíticos** | O modo Jogar do D&D saiu para `dnd/[id]/PlayMode.tsx`, mas `HomeClient.tsx` e os `SheetClient` de Ordem, Star Wars e Cthulhu seguem passando de mil linhas. |

---

## 11. Stack e execução

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript 5 |
| Framework | Next.js 16.2 (App Router, Turbopack, React 19.2) |
| Banco | PostgreSQL + Prisma 7 (adapter `@prisma/adapter-pg`) |
| Autenticação | NextAuth v5 (credenciais, JWT, bcrypt custo 12) |
| 3D | Three.js / React Three Fiber / drei |
| Testes | Vitest 4 |
| Acessibilidade | ESLint 9 + `eslint-plugin-jsx-a11y` (conjunto recomendado) |
| Produção | Vercel + Neon Postgres |

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

**O build não toca no banco.** Ele só gera o client e compila:

```json
"build": "prisma generate && next build",
"migrate:deploy": "prisma migrate deploy"
```

A migração é um passo à parte, rodado quando existe migration nova:

```bash
DATABASE_URL="<string do Neon>" npm run migrate:deploy
```

**Por quê.** O `migrate deploy` já morou dentro do `build`, o que parecia
conveniente: um push sincronizava código e banco. Mas o Neon do plano grátis
dorme por inatividade, e a primeira conexão precisa acordá-lo. Quando a máquina
de build da Vercel tentou conectar num banco adormecido, o Prisma estourou o
timeout, devolveu `P1001: Can't reach database server` e derrubou o deploy
inteiro — de um commit que não mexia no schema. Separar os dois tira o deploy da
dependência de um banco serverless estar acordado: o que falha, quando falha, é
só a migração, e ela é reexecutável.

> Para rodar o build de produção localmente (`npm run start`), é preciso
> `AUTH_TRUST_HOST=true` no `.env` — fora da Vercel o NextAuth recusa o host e o
> login falha com `UntrustedHost`.

Detalhes de instalação e variáveis de ambiente: [README](../README.md).
