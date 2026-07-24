# Star Wars: Além da Fronteira
## Vida, Energia e Atributos

### Índice
1. [PV e PE](#1-pv-e-pe)
2. [Perícias treinadas](#2-perícias-treinadas)
3. [Criação de atributos](#3-criação-de-atributos)
4. [Modificador de atributo por espécie](#4-modificador-de-atributo-por-espécie)
5. [Graus de treinamento em perícia](#5-graus-de-treinamento-em-perícia)

---

## 1. PV e PE

**PV (Pontos de Vida)** = resistência física. **PE (Pontos de Energia da Força)** = combustível pra habilidades fortes de qualquer classe (poderes da Força, golpes de marco, gadgets, etc.) — todo personagem tem PE, não só sensitivos à Força.

**Fórmula nível 1:**
```
PV = PV base da classe + bônus de PV da espécie + VIG
PE = PE base da classe + bônus de PE da espécie + SEN
```

**Por nível seguinte:**
```
+PV = ganho por nível da classe + VIG
+PE = ganho por nível da classe + SEN
```

### Arquétipos de classe (PV/PE)

| Arquétipo | PV nível 1 | PV/nível | PE nível 1 | PE/nível | Classes |
|---|---|---|---|---|---|
| **Marcial** | 20 | +4 | 2 | +1 | Mandaloriano, Soldado da República, Mercenário, Pirata Espacial, Guarda Planetário, Vigilante, Caçador de Recompensas, Explorador |
| **Especialista** | 16 | +3 | 4 | +2 | Engenheiro, Piloto, Espião, Contrabandista, Comerciante, Diplomata, Arqueólogo, Cientista, Médico |
| **Sensível à Força** | 14 | +2 | 6 | +3 | Padawan Jedi, Acólito Sith, Andarilho da Força (+ evoluções: O Lado da Luz, O Lado Negro, Xamã da Força) |

### Tiers de espécie (bônus PV/PE)

| Tier | Bônus | Espécies |
|---|---|---|
| **Robusto** | +4 PV | Besalisk, Cathar, Devaronian, Echani, Nikto, Rattataki, Shistavanen, Weequay, Zabrak |
| **Robusto Extremo** | +6 PV | Gen'Dai, Wookiee |
| **Equilibrado** | +2 PV, +1 PE | Anzat, Arkanian, Bothan, Chagrian, Duros, Falleen, Humano, Mon Calamari, Pantoran, Quarren, Rodian, Sullustan, Togruta, Twi'lek, Umbaran |
| **Sensível** | +3 PE | Kel Dor, Kiffar, Mirialan, Nautolan, Zeltron |
| **Sensível Extremo** | +4 PE | Cerean, Iktotchi, Miraluka, Voss |

### Exemplos

- **Wookiee** (Robusto Extremo) **Mandaloriano** (Marcial), VIG 3, SEN 1 → PV nível 1 = 20+6+3 = **29**; PE nível 1 = 2+0+1 = **3**; por nível: +7 PV, +2 PE.
- **Miraluka** (Sensível Extremo) **Padawan Jedi** (Sensível à Força), VIG 1, SEN 3 → PV nível 1 = 14+0+1 = **15**; PE nível 1 = 6+4+3 = **13**; por nível: +3 PV, +6 PE.

---

## 2. Perícias treinadas

**Fórmula:** perícias treinadas = arredondar para cima (INT final × multiplicador do arquétipo)

| Arquétipo | Multiplicador | Exemplo (INT 3) |
|---|---|---|
| **Marcial** | 1,5x | ceil(4,5) = **5** |
| **Especialista** | 3x | ceil(9) = **9** |
| **Sensível à Força** | 2x | ceil(6) = **6** |

INT usado é o **final** (base + pontos distribuídos + modificador de espécie).

---

## 3. Criação de atributos

O jogador distribui **7 pontos** livremente entre os 6 atributos (AGI, INT, FOR, VIG, PRE, SEN). Esse valor somado ao modificador de espécie forma o **atributo final**, usado em todas as fórmulas deste documento (PV, PE, perícias treinadas).

---

## 4. Modificador de atributo por espécie

Todas as espécies somam **net +2** nos modificadores (a maioria +2/+1/−1; algumas extremas puxam +3/−1) — exceto **Humano**, que é a exceção proposital de propósito: mais pontos totais em troca de não ter identidade fixa.

| Espécie | Modificadores |
|---|---|
| **Anzat** | +2 AGI, +1 PRE, −1 VIG |
| **Arkanian** | +2 INT, +1 PRE, −1 FOR |
| **Besalisk** | +2 FOR, +1 VIG, −1 AGI |
| **Bothan** | +2 INT, +1 PRE, −1 FOR |
| **Cathar** | +2 AGI, +1 FOR, −1 INT |
| **Cerean** | +3 INT, −1 FOR |
| **Chagrian** | +2 PRE, +1 INT, −1 AGI |
| **Devaronian** | +2 FOR, +1 AGI, −1 PRE |
| **Duros** | +2 INT, +1 AGI, −1 VIG |
| **Echani** | +2 AGI, +1 FOR, −1 SEN |
| **Falleen** | +2 PRE, +1 SEN, −1 VIG |
| **Gen'Dai** | +3 VIG, −1 AGI |
| **Humano** | +2 em 2 atributos, +1 em 3 atributos, −1 em 1 atributo — todos à escolha do jogador (cobre os 6 atributos) |
| **Iktotchi** | +2 SEN, +1 PRE, −1 FOR |
| **Kel Dor** | +2 SEN, +1 INT, −1 AGI |
| **Kiffar** | +2 SEN, +1 AGI, −1 PRE |
| **Mirialan** | +2 SEN, +1 PRE, −1 FOR |
| **Miraluka** | +3 SEN, −1 AGI |
| **Mon Calamari** | +2 INT, +1 VIG, −1 AGI |
| **Nautolan** | +2 SEN, +1 VIG, −1 INT |
| **Nikto** | +2 VIG, +1 FOR, −1 PRE |
| **Pantoran** | +2 PRE, +1 INT, −1 FOR |
| **Quarren** | +2 VIG, +1 INT, −1 PRE |
| **Rattataki** | +2 FOR, +1 VIG, −1 INT |
| **Rodian** | +2 AGI, +1 SEN, −1 PRE |
| **Shistavanen** | +2 SEN, +1 AGI, −1 PRE |
| **Sullustan** | +2 INT, +1 AGI, −1 FOR |
| **Togruta** | +2 SEN, +1 AGI, −1 INT |
| **Twi'lek** | +2 PRE, +1 AGI, −1 VIG |
| **Umbaran** | +2 AGI, +1 INT, −1 PRE |
| **Voss** | +3 SEN, −1 FOR |
| **Weequay** | +2 VIG, +1 FOR, −1 INT |
| **Wookiee** | +3 FOR, −1 INT |
| **Zabrak** | +2 FOR, +1 VIG, −1 SEN |
| **Zeltron** | +2 PRE, +1 SEN, −1 FOR |

---

## 5. Graus de treinamento em perícia

| Grau | Bônus |
|---|---|
| Inexperiente | +0 |
| Iniciante | +5 |
| Treinado | +10 |
| Expert | +15 |
| Veterano | +20 |
| Mestre | +25 |

Todas as perícias começam **Inexperiente (+0)**. Na criação, o número de perícias treinadas — calculado na [seção 2](#2-perícias-treinadas) (INT final × multiplicador do arquétipo, arredondado pra cima) — define quantas o jogador escolhe pra subir a **Iniciante (+5)**. Os graus acima (Treinado, Expert, Veterano, Mestre) evoluem por progressão de nível (regra a definir).
