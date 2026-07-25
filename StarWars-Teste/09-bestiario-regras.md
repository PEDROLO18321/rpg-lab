# Star Wars: Além da Fronteira
## Bestiário Oficial de Mestre — Livro 0: Framework e Regras

> Suplemento de Mestre. Cobre toda criatura, NPC, facção e ameaça que um grupo pode encontrar nas Regiões Desconhecidas, do bicho de estimação ao Sith lendário. Tudo aqui usa **exatamente** as mesmas regras da ficha de jogador — mesmos atributos, mesma rolagem de dado, mesmos graus de perícia, mesma tabela de custo/dano/DT das habilidades de classe. Nada de subsistema paralelo.

### Índice do Bestiário

| Arquivo | Conteúdo |
|---|---|
| **09-bestiario-regras.md** | Este arquivo — framework, fórmulas, como estatuir e improvisar qualquer inimigo novo. |
| [10-bestiario-criaturas.md](10-bestiario-criaturas.md) | Fauna genérica: predadores, herbívoros, marinhas, voadoras, parasitas, criaturas da Força, lendárias, espécies inteligentes hostis e neutras. |
| [11-bestiario-jedi.md](11-bestiario-jedi.md) | As 8 patentes Jedi + 9 especializações. |
| [12-bestiario-sith.md](12-bestiario-sith.md) | As 9 patentes Sith + 9 especializações. |
| [13-bestiario-sensitivos.md](13-bestiario-sensitivos.md) | Bruxas de Dathomir, monges, Guardiões dos Whills, ordens antigas, cultos da Força. |
| [14-bestiario-mandalorianos.md](14-bestiario-mandalorianos.md) | 9 patentes Mandalorianas + loadouts. |
| [15-bestiario-militares.md](15-bestiario-militares.md) | República, Separatistas, Império, outras facções militares. |
| [16-bestiario-civis.md](16-bestiario-civis.md) | Mercenários, piratas, contrabandistas, criminosos, profissionais civis. |
| [17-bestiario-fauna-planetas.md](17-bestiario-fauna-planetas.md) | Fauna própria de 17 planetas centrais do cenário. |

---

## 1. Filosofia do bestiário

Três regras guiam toda entrada deste livro:

1. **Nada de número solto.** Toda estatística nasce de uma fórmula ligada ao **Nível** da criatura e ao seu **Grau de Ameaça**. Se você quiser criar uma criatura nova amanhã, as tabelas deste arquivo bastam — você nunca precisa "chutar" um valor.
2. **Mesmo motor da ficha de jogador.** Dano de ataque usa a mesma escala de dados (1d6 → 18d6) das habilidades de classe. Custo de poder usa a mesma escala de PE (1 → 8). DT usa a mesma escala (15 → 36). Um Mestre que já conhece a ficha do jogador já sabe ler qualquer statblock deste livro.
3. **Nível da criatura ≈ nível de desafio para um grupo do mesmo nível.** Uma criatura "Média" de nível 20 é um combate justo contra um personagem nível 20 sozinho, ou um desafio tranquilo pra um grupo de 4. Ajuste com o Grau de Ameaça (seção 3) pra mooks e chefes.

---

## 2. Atributos, perícias e o dado — recapitulando

Seis atributos: **AGI, INT, FOR (Força/força física), VIG, PRE, SEN**. Regra de dado (idêntica à do jogador):

- Atributo **positivo N** → rola **Nd20**, mantém o **maior**.
- Atributo **0** → rola **1d20**.
- Atributo **negativo N** → rola **(|N|+1)d20**, mantém o **menor**.

Perícias (as mesmas 25 da ficha) somam um bônus fixo por grau de treinamento:

| Grau | Bônus |
|---|---|
| Inexperiente | +0 |
| Iniciante | +5 |
| Treinado | +10 |
| Expert | +15 |
| Veterano | +20 |
| Mestre | +25 |

Uma criatura "usa" uma perícia normalmente: rola o dado do atributo vinculado + bônus do grau. Este livro atribui grau de perícia por narrativa/papel (um filhote é Inexperiente, um caçador ancestral é Mestre) — não existe fórmula rígida de grau por nível, porque perícia representa treino específico, não poder bruto.

---

## 3. Nível e Grau de Ameaça — os dois eixos

**Nível** (1–99, igual à progressão do jogador) define o *poder bruto* da criatura. **Grau de Ameaça** é um multiplicador de papel: duas criaturas de nível 40 podem ter o mesmo nível e ser completamente diferentes em mesa — um mook nível 40 morre num golpe, um Chefe Lendário nível 40 aguenta o grupo inteiro sozinho.

### 3.1 Tabela de Grau de Ameaça

| Grau de Ameaça | Mult. PV | Mult. Atributos | Ações/rodada | Regra especial |
|---|---|---|---|---|
| **Muito Fraco** | ×0,5 | −2 | 1 ação | Mook. Costuma vir em grupos de 3+. |
| **Fraco** | ×0,75 | −1 | 1 ação | Ainda risco em número. |
| **Médio** | ×1,0 | +0 | 1 ação | Baseline — equivale a um PJ do mesmo nível. |
| **Forte** | ×1,5 | +1 | 2 ações | Combate individual sério. |
| **Elite** | ×2,0 | +2 | 2 ações + 1 reação | Guarda-costas, tenente de facção. |
| **Chefe** | ×3,5 | +3 | 3 ações | Ganha **Segunda Fase** abaixo de 50% PV (veja 3.2). |
| **Chefe Lendário** | ×5,0 | +4 | 3 ações + 1 ação lendária fora do turno | Imune a condições de controle de criaturas de nível menor. |
| **Ameaça Planetária** | ×8,0 | +5 | 4 ações + 1 ação lendária | Afeta uma região/cidade inteira; ataques em área alcançam dezenas de metros. |
| **Ameaça Galáctica** | ×12,0 | +6 | 4 ações + 2 ações lendárias | Evento de campanha. Raramente enfrentada em combate direto — geralmente é derrotada por um objetivo, não por dano. |

### 3.2 Segunda Fase (Chefe+)

Ao cruzar 50% do PV máximo, todo Chefe (ou grau acima) ativa gratuitamente:
- +1 ação extra na rodada seguinte (uma vez só);
- Um Poder ou Passiva marcado **"Fase 2"** no statblock (quando existir) é destravado;
- Recupera **PE igual a 2 × Nível/10** (arredondado pra baixo), representando adrenalina/fúria.

---

## 4. Fórmulas de estatística por Nível (baseline "Médio")

Aplique o multiplicador da tabela 3.1 por cima destes valores baseline.

| Estatística | Fórmula (N = Nível) |
|---|---|
| **PV base** | 14 + 3 × N |
| **PE base** | 2 + 2 × N |
| **Defesa** | ver tabela 4.1 (mesma curva de DT das habilidades de classe) |
| **Iniciativa** | Atributo AGI + ⌊N ÷ 10⌋ |
| **Deslocamento** | 9m (padrão humanoide/médio) — ver tabela 4.2 por Tamanho |

### 4.1 Defesa por faixa de nível

Idêntica à tabela de DT das habilidades de classe do jogador — reaproveitada de propósito, pra manter tudo no mesmo eixo de dificuldade.

| Nível | Defesa |
|---|---|
| 1–3 | 15 |
| 4–8 | 17 |
| 9–12 | 19 |
| 13–16 | 21 |
| 17–20 | 23 |
| 21–29 | 26 |
| 30–34 | 27 |
| 35–39 | 29 |
| 40–49 | 30 |
| 50–69 | 32 |
| 70–98 | 34 |
| 99 | 36 |

**Resolução de ataque:** o atacante rola o dado do atributo relevante (regra da seção 2) + bônus de perícia. Se o total ≥ Defesa do alvo, o ataque acerta. Isso vale tanto pra PJs atacando criaturas deste livro quanto pra criaturas atacando PJs (nesse caso, a "Defesa" do PJ é 10 + metade do nível, arredondado pra baixo, salvo regra futura da ficha).

### 4.2 Deslocamento por Tamanho

| Tamanho | Deslocamento base |
|---|---|
| Minúsculo | 4,5m (ou voo/salto conforme espécie) |
| Pequeno | 6m |
| Médio | 9m |
| Grande | 12m |
| Enorme | 15m |
| Colossal | 18m+ (frequentemente ignora terreno) |

### 4.3 Dano de ataque por Nível

Mesma escala das habilidades de classe (peCost/damageDice do jogador) — um golpe de uma criatura nível 20 dói como uma habilidade de círculo 5 de um PJ nível 20.

| Nível | Dano | DT de poderes (não-combate) | Custo em PE (se usar poder) |
|---|---|---|---|
| 1–3 | 1d6 | 15 | 1 |
| 4–8 | 2d6 | 17 | 2 |
| 9–12 | 3d6 | 19 | 2 |
| 13–16 | 4d6 | 21 | 3 |
| 17–20 | 5d6 | 23 | 3 |
| 21–29 | 7d6 | 26 | 4 |
| 30–34 | 8d6 | 27 | 4 |
| 35–39 | 9d6 | 29 | 5 |
| 40–49 | 10d6 | 30 | 5 |
| 50–69 | 12d6 | 32 | 6 |
| 70–98 | 15d6 | 34 | 7 |
| 99 | 18d6 | 36 | 8 |

Ataques marcados como **Sabre de Luz** ignoram esta tabela e seguem a regra fixa do jogador: **6d6 × maior entre AGI/FOR/SEN + perícia Sabres de Luz**.

Criaturas **Forte** ou acima costumam ter um segundo ataque uma faixa de dano abaixo (ataque secundário mais fraco, mas sem recarga) — indicado no statblock.

### 4.4 Atributos por Nível (baseline "Médio", antes do modificador de Ameaça)

| Faixa de nível | Atributo Primário | Atributo(s) Secundário(s) | Atributo(s) Fraco(s) |
|---|---|---|---|
| 1–5 | 2 | 1 | 0 |
| 6–10 | 3 | 1 | 0 |
| 11–15 | 4 | 2 | 0 |
| 16–20 | 5 | 2 | −1 |
| 21–30 | 6 | 3 | −1 |
| 31–45 | 8 | 4 | −1 |
| 46–60 | 10 | 5 | −2 |
| 61–80 | 13 | 6 | −2 |
| 81–99 | 16 | 8 | −3 |

"Primário" é o atributo que define o papel da criatura (FOR pra um predador brutal, SEN pra uma criatura da Força, INT pra um droide tático). "Secundário" cobre 1–2 atributos de suporte ao papel. "Fraco" é o dump stat narrativo (uma fera não tem PRE de diplomacia). Atributos não listados ficam em 0.

---

## 5. Papel em Combate — vocabulário fixo

Use sempre um destes rótulos, pra manter previsibilidade tática:

- **Dano** — foco em maximizar dano por rodada.
- **Tanque** — PV/Defesa altos, segura linha de frente, protege aliados.
- **Controle** — impõe condições, imobiliza, atrapalha ações do grupo.
- **Suporte** — cura, buffa aliados, remove condições.
- **Furtivo/Assassino** — foco em alvo isolado, ataques surpresa, alto dano single-target.
- **Artilheiro à Distância** — dano consistente de longe, baixa mobilidade.
- **Enxame** — muitas unidades fracas, perigosas em grupo.
- **Comandante** — buffa/coordena outras criaturas da mesma facção.

---

## 6. Vocabulário fixo dos outros campos

- **Tamanho:** Minúsculo, Pequeno, Médio, Grande, Enorme, Colossal.
- **Tipo:** Fauna, Humanoide, Droide, Criatura da Força, Besta Lendária, Enxame, Vegetal/Fungo, Sensitivo.
- **Inteligência:** Animal, Instintiva, Baixa, Média, Alta, Sobre-humana.
- **Tendência:** Agressiva, Territorial, Furtiva, Oportunista, Leal, Selvagem, Calculista, Fanática, Protetora.

---

## 7. Template obrigatório de cada entrada

```
### Nome — *epíteto/título opcional*
Categoria · Facção · Nível N · Ameaça [grau] · Papel [papel] · Tamanho [tam] ·
Tipo [tipo] · Planeta [planeta] · Ambiente [bioma] · Inteligência [int] · Tendência [tend]

PV X · PE X · Defesa X · Iniciativa +X · Deslocamento Xm

| AGI | INT | FOR | VIG | PRE | SEN |
|---|---|---|---|---|---|
| x | x | x | x | x | x |

Perícias: lista com grau

Ataques:
| Nome | Alcance | Acerto | Dano | Tipo | Custo | Recarga | Efeito |
|---|---|---|---|---|---|---|---|

Poderes: nome — descrição — regra — recarga — duração — interações

Passiva: nome — efeito

IA de Combate: comportamento, prioridade de alvo, retirada, trabalho em equipe

Loot: itens / materiais / recursos

Lore: parágrafo curto
```

Todas as entradas dos arquivos 10 a 17 seguem este template à risca.

---

## 8. Classificação por faixa de nível (visão geral do bestiário completo)

| Faixa | Uso recomendado |
|---|---|
| Nível 1–5 | Primeiras sessões, ameaças locais |
| Nível 6–10 | Fim do 1º arco |
| Nível 11–15 | Vilão regional, primeira classe avançada rival |
| Nível 16–20 | Fim do 2º arco, primeiro Chefe Lendário |
| Nível 21–30 | Campanha de meia-carreira, marco 25/30 |
| Nível 31–45 | Ameaças com apoio institucional (Império, Ordem Sith) |
| Nível 46–60 | Marco 50 — lendas vivas, generais, Mestres do Conselho |
| Nível 61–80 | Fim de campanha longa |
| Nível 81–99 | Ápice — Darths, Grão-Mestres, Ameaças Galácticas |

---

## 9. Como improvisar uma criatura nova em 2 minutos

1. Escolha **Nível** (poder) e **Grau de Ameaça** (papel/dificuldade).
2. PV = fórmula da seção 4 × multiplicador da seção 3.1.
3. Atributos = tabela 4.4 + modificador de Ameaça da seção 3.1, distribuído por papel.
4. Defesa e Dano = tabelas 4.1 e 4.3 pela faixa de nível.
5. Dê 1–2 Ataques únicos (nunca "ataque corpo a corpo" genérico — dê nome e efeito).
6. Se for Forte+, dê 1 Poder (reaproveite a lista de Poderes Gerais do jogador — [07-poderes-gerais.md](07-poderes-gerais.md) — como banco de opções prontas).
7. Escreva 2–3 linhas de IA de Combate.
8. Pronto — já é uma entrada completa e balanceada.
