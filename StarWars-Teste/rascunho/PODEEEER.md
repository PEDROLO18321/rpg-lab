# Star Wars: Além da Fronteira
## PODEEEER — Compêndio de Poderes (Classe + Gerais)

Documento único reunindo **todos os Poderes de Classe** (23 classes base, progressão nível 1-20 em 5 círculos + marcos 25/35/50/99, Formas de Sabre, e as 3 classes avançadas desbloqueadas no nível 30) e **todos os Poderes Gerais** (18 básicos + 32 avançados, universais a qualquer personagem).

### Sumário
- [Parte 1 — Poderes de Classe](#parte-1--poderes-de-classe)
- [Parte 2 — Poderes Gerais](#parte-2--poderes-gerais)

---

# Parte 1 — Poderes de Classe


Progressão de habilidades por nível (1-20, agrupados em 5 círculos) + marcos avançados (25, 35, 50, 99 — ou 25/30/35/40/50/99 nas 3 classes ligadas à Força, ver exceção abaixo).

**Regra fixa para todas as classes:** cada círculo (1º a 4º) tem no mínimo 1 habilidade ofensiva (combate), começando básica e escalando. Os marcos 25, 35, 50 e 99 são sempre habilidades de combate, e são muito mais fortes que as anteriores.

**Regra de visibilidade:** ao escolher a classe na criação de personagem, o jogador enxerga todas as habilidades dos 5 círculos (níveis 1-20) desde o início — isso ajuda no planejamento de build. As **habilidades de marco (25, 35, 50, 99)** ficam **ocultas** até o personagem completar o 5º círculo (atingir nível 20); só então são reveladas ao jogador.

**Regra das classes avançadas (nível 30):** três classes — **Xamã da Força**, **O Lado da Luz** e **O Lado Negro** — não existem na criação de personagem. Elas são desbloqueadas automaticamente ao **nível 30**, exigindo ter trilhado uma classe base ligada à Força até lá (Andarilho da Força → Xamã da Força; Padawan Jedi → O Lado da Luz; Acólito Sith → O Lado Negro). Diferente das outras classes, focadas em combate físico + habilidades utilitárias, essas três são **quase inteiramente poderes da Força** (canon + Legends), representando a maestria que a classe base só insinuava. Ver [04-caminho-classe.md §2.1](04-caminho-classe.md#21-classes-avançadas--despertar-no-nível-30).

**Exceção de marcos — Padawan Jedi, Acólito Sith e Andarilho da Força:** por serem as 3 classes-base ligadas à Força (as únicas com trilha de Formas de Sabre e caminho pra uma classe avançada no nível 30), elas têm **marcos extras em 30 e 40**, e **cada marco (25, 30, 35, 40, 50) concede 2 habilidades** em vez de 1. O nível 30 nelas marca justamente o ponto de virada onde a classe avançada correspondente se torna disponível. O marco 99 continua único (1 habilidade), igual às demais classes.

### Índice
1. [Arqueólogo](#1-arqueólogo)
2. [Caçador de Recompensas](#2-caçador-de-recompensas)
3. [Cientista](#3-cientista)
4. [Comerciante](#4-comerciante)
5. [Contrabandista](#5-contrabandista)
6. [Diplomata](#6-diplomata)
7. [Engenheiro](#7-engenheiro)
8. [Espião](#8-espião)
9. [Explorador](#9-explorador)
10. [Guarda Planetário](#10-guarda-planetário)
11. [Mandaloriano](#11-mandaloriano)
12. [Médico](#12-médico)
13. [Mercenário](#13-mercenário)
14. [Piloto](#14-piloto)
15. [Pirata Espacial](#15-pirata-espacial)
16. [Soldado da República](#16-soldado-da-república)
17. [Vigilante](#17-vigilante)
18. [Formas de Sabre de Luz](#18-formas-de-sabre-de-luz)
19. [Padawan Jedi](#19-padawan-jedi)
20. [Acólito Sith](#20-acólito-sith)
21. [Andarilho da Força](#21-andarilho-da-força)
22. [Classes avançadas — regra de progressão](#22-classes-avançadas--regra-de-progressão)
23. [O Lado da Luz](#23-o-lado-da-luz)
24. [O Lado Negro](#24-o-lado-negro)
25. [Xamã da Força](#25-xamã-da-força)

---

### Como ler os valores entre `**[ ]**`

Toda habilidade de classe tem um custo em **PE (Pontos de Energia da Força)** — o mesmo recurso de [06-vida-energia-atributos.md §1](06-vida-energia-atributos.md#1-pv-e-pe), que qualquer classe possui, não só sensitivos à Força — e um efeito mecânico: **Dano** (habilidades de combate) ou **DT** (habilidades utilitárias, a Dificuldade que o teste de perícia relevante precisa bater). O valor escala pelo nível/círculo da habilidade:

| Círculo / Marco | Níveis | Custo (PE) | Dano | DT |
|---|---|---|---|---|
| 1º círculo | 1-3 | 1 | 1d6 | 15 |
| 2º círculo | 4-8 | 2 | 2d6 | 17 |
| 3º círculo | 9-12 | 2 | 3d6 | 19 |
| 4º círculo | 13-16 | 3 | 4d6 | 21 |
| 5º círculo | 17-20 | 3 | 5d6 | 23 |
| Marco 25 | 25 | 4 | 7d6 | 26 |
| Marco 30 *(só classes-base da Força)* | 30 | 4 | 8d6 | 27 |
| Marco 35 | 35 | 5 | 9d6 | 29 |
| Marco 40 *(só classes-base da Força)* | 40 | 5 | 10d6 | 30 |
| Marco 50 | 50 | 6 | 12d6 | 32 |
| Marco 70 *(só classes avançadas)* | 70 | 7 | 15d6 | 34 |
| Ápice | 99 | 8 | 18d6 | 36 |

**Dano** de habilidades de combate soma **metade do grau de treinamento na perícia usada, arredondado pra baixo** (Iniciante +0, Treinado +2, Expert +5, Veterano +7, Mestre +10/+12 — ver [06 §5](06-vida-energia-atributos.md#5-graus-de-treinamento-em-perícia) pra grau completo). **DT** é a dificuldade fixa que o alvo (ou o próprio teste do usuário, se for auto-aplicada) precisa bater na perícia relevante pra habilidade funcionar.

**Regra dos marcos (25/35/50/99) das 17 classes sem ligação à Força:** são sempre habilidades de combate — por isso levam sempre valor de Dano, mesmo quando o texto descreve algo além de "atacar" (ex.: cura de emergência do Médico usa a mesma escala de dado, só que curando em vez de ferindo). Nas 3 classes-base ligadas à Força e nas 3 avançadas, cada marco/grau tem 2 habilidades — uma de combate (Dano) e uma utilitária (DT) — refletindo a tag *(combate)* de cada linha.

**Exceção — golpes de sabre de luz:** habilidades de Padawan Jedi, Acólito Sith e Andarilho da Força que envolvem o sabre (aprender/dominar uma Forma, ou qualquer golpe cujo texto menciona "sabre"/"lâmina") **não seguem a escala por círculo**. O dano delas é sempre **6d6 × atributo base usado (o maior entre AGI, FOR ou SEN) + valor total da perícia Sabres de Luz** — o sabre é a arma, então o dano vem da arma e da perícia de quem o empunha, não do "tamanho" da habilidade. Poderes puramente da Força (empurrão, relâmpago, drenar vida, arremessar objetos etc.) continuam na escala normal por círculo/marco, já que não passam pela lâmina.

---

## 1. Arqueólogo

**Função:** explorador de ruínas, caçador de relíquias e combatente tático que usa o ambiente, tecnologia antiga e conhecimentos esquecidos como arma.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe de Sucata** *(combate)* | Arremessa peças, ferramentas ou fragmentos de ruína para causar dano leve e atrapalhar o alvo. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Leitura de Campo** | Identifica estruturas ocultas, cavidades e pontos frágeis do terreno. **[1 PE · DT 15]** |
| 2 | **Ferramentas de Expedição** | Usa kit arqueológico como arma improvisada ou ferramenta de ataque de curta distância. **[1 PE · DT 15]** |
| 3 | **Impacto de Ruína** *(combate)* | Faz desabar pedras, vigas ou detritos sobre o inimigo, causando dano em área pequena. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Decifração Sob Pressão** | Lê painéis e inscrições durante combate para ativar mecanismos ofensivos antigos. **[2 PE · DT 17]** |
| 5 | **Desarme Reverso** | Converte uma armadilha antiga em ataque contra inimigos próximos. **[2 PE · DT 17]** |
| 6 | **Pulso de Análise** | Expõe fraquezas de armaduras, escudos e estruturas. **[2 PE · DT 17]** |
| 8 | **Estouro de Fragmentos** *(combate)* | Explode objetos, paredes frágeis ou sucata, causando dano e espalhando estilhaços. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Mapeamento Tático** | Marca linhas de tiro, emboscadas e pontos cegos no cenário para vantagem ofensiva. **[2 PE · DT 19]** |
| 10 | **Raio de Restauro** | Reativa parcialmente uma máquina antiga para que ela ataque ou defenda por um curto período. **[2 PE · DT 19]** |
| 11 | **Armadilha Revertida** *(combate)* | Redireciona dano e efeitos de armadilhas para atingir os inimigos. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 12 | **Cortina de Ruína** *(combate)* | Derruba poeira, escombros e detritos para ferir, cegar e desorientar. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Núcleo Recuperado** *(combate)* | Extrai energia de relíquias ou motores mortos e libera uma descarga ofensiva. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Arma Relíquia** *(combate)* | Usa um artefato antigo como arma de combate, com dano elevado e efeito único. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Fratura Estrutural** | Ataca pontos de suporte para causar colapso parcial ou total do ambiente. **[3 PE · DT 21]** |
| 16 | **Refúgio Hostil** | Ergue proteção improvisada que também serve como cobertura de contra-ataque. **[3 PE · DT 21]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Chave do Passado** | Abre sistemas antigos durante combate para liberar armadilhas, drones ou torres hostis. **[3 PE · DT 23]** |
| 18 | **Restauração Bélica** | Devolve função ofensiva a uma relíquia, torre ou droid antigo por tempo limitado. **[3 PE · DT 23]** |
| 19 | **Herança Cortante** *(combate)* | Invoca o poder de um artefato recuperado para atacar com dano raro ou energético. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 20 | **Descoberta Letal** *(combate)* | Revela uma estrutura, câmara ou mecanismo que vira o combate a seu favor de forma decisiva. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Ruína Explosiva** | Faz o cenário colapsar em cadeia, causando grande dano em área e controlando o campo. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Guardião do Templo** | Libera uma ofensiva antiga — droides, torres ou mecanismos de defesa — que atacam inimigos. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Cataclismo Arqueológico** | Provoca um colapso massivo ou ativação extrema de relíquia, causando dano devastador. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Relíquia do Fim dos Tempos** | Desperta uma arma ou artefato lendário capaz de alterar uma batalha inteira com um único uso. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 2. Caçador de Recompensas

**Função:** rastreador e combatente versátil, focado em captura, perseguição, tiroteio e controle de campo.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Tiro de Pressão** *(combate)* | Dispara para forçar o alvo a se abaixar, perder posição ou recuar. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Rastro Quente** | Segue sinais recentes de fuga, calor e movimento. **[1 PE · DT 15]** |
| 2 | **Golpe de Contenção** *(combate)* | Atinge para desarmar, derrubar ou imobilizar. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Leitura de Alvo** | Identifica postura, medo, agressividade e padrão de combate. **[1 PE · DT 15]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Armadilha de Captura** | Monta laços, fios, placas ou dispositivos para prender o inimigo. **[2 PE · DT 17]** |
| 5 | **Mira Brutal** *(combate)* | Aumenta o dano de tiros contra alvos marcados ou feridos. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Cobertura Instintiva** | Usa o terreno para reduzir dano e manter vantagem em tiroteios. **[2 PE · DT 17]** |
| 8 | **Intimidação Fria** | Abala a moral do inimigo, podendo forçar hesitação, erro ou rendição. **[2 PE · DT 17]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Rajada de Supressão** *(combate)* | Sequência de disparos que trava avanço inimigo e controla espaço. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 10 | **Rastreador Biométrico** | Encontra alvos por calor, sangue, assinatura corporal ou rastros digitais. **[2 PE · DT 19]** |
| 11 | **Captura Limpa** *(combate)* | Executa uma neutralização precisa sem matar, ideal para contratos vivos. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 12 | **Movimento Predatório** | Melhora reposicionamento, investida e perseguição em combate. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Ferramentas de Guerra** *(combate)* | Usa bombas, cabos, dardos e ganchos como ataque tático. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Emboscada Perfeita** *(combate)* | Ganha grande vantagem ao atacar de surpresa, de cima ou por flanco. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem de Operação** | Adapta a armadura para resistir a disparos, explosões e calor. **[3 PE · DT 21]** |
| 16 | **Interrogação de Campo** | Extrai informação de alvos capturados ou feridos sob pressão. **[3 PE · DT 21]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Alvo Marcado** | Escolhe um inimigo prioritário e passa a caçá-lo com eficiência extrema. **[3 PE · DT 23]** |
| 18 | **Execução Técnica** *(combate)* | Aplica um disparo ou golpe final com altíssima precisão e dano. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Caçada Sem Fim** | Mantém perseguição intensa sem perder o alvo. **[3 PE · DT 23]** |
| 20 | **Predador da Galáxia** *(combate)* | Entra em estado de caça total, unindo rastreamento, dano e contenção. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Caça Profissional** | Sua pressão ofensiva aumenta muito contra alvos contratados. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Arsenal Personalizado** | Seu equipamento de combate ganha modificações únicas e letais. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Lenda do Submundo** | Sua reputação faz inimigos hesitarem antes mesmo do primeiro tiro. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Predador Definitivo** | Executa uma caçada lendária com potencial de eliminar ou capturar alvos quase impossíveis. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 3. Cientista

**Função:** combate com tecnologia, análise ofensiva, experimentos de campo e manipulação de energia, venenos e dispositivos.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Pulso Analítico** | Identifica a fraqueza técnica de um alvo, armadura ou aparelho. **[1 PE · DT 15]** |
| 1 | **Reação Instável** *(combate)* | Cria uma pequena descarga, ácido, gás ou explosão controlada. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 2 | **Diagnóstico de Combate** | Detecta falhas em droides, escudos e armas inimigas. **[1 PE · DT 15]** |
| 3 | **Protocolo de Emergência** *(combate)* | Converte equipamentos científicos em defesa ou ataque improvisado. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Composto Hostil** *(combate)* | Cria substâncias que queimam, cegam, travam ou enfraquecem. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 5 | **Campo Experimental** | Altera uma pequena área para dificultar movimento, mira ou estabilidade. **[2 PE · DT 17]** |
| 6 | **Biorresposta** *(combate)* | Manipula venenos, sedativos e toxinas contra inimigos ou criaturas. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 8 | **Reação em Cadeia** *(combate)* | Faz um artefato, tanque ou material reagir violentamente em combate. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Sensor de Falha** | Detecta o momento ideal para interromper o funcionamento de um sistema inimigo. **[2 PE · DT 19]** |
| 10 | **Descarga Técnica** *(combate)* | Libera um ataque energético ou químico de médio alcance. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Protótipo de Guerra** *(combate)* | Cria um dispositivo ofensivo especializado para a missão. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 12 | **Estabilização Molecular** | Trava ou enfraquece matéria, estrutura ou equipamento do alvo. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Sabotagem Ativa** | Faz armas, motores, escudos ou droides falharem em combate. **[3 PE · DT 21]** |
| 14 | **Reação Dirigida** *(combate)* | Lança uma fórmula ou pulso que causa dano direto e efeito secundário. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Autópsia Tecnobiológica** | Explora fraquezas de organismos, clones e ciborgues para atacar melhor. **[3 PE · DT 21]** |
| 16 | **Queda de Sistema** *(combate)* | Derruba tecnologia inimiga por sobrecarga ou interferência. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Domínio da Hipótese** | Prevê o comportamento inimigo e escolhe a melhor forma de ataque. **[3 PE · DT 23]** |
| 18 | **Reconfiguração Total** *(combate)* | Transforma um equipamento em arma ou solução de combate imediata. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Síntese Avançada** | Produz compostos raros e extremamente perigosos para uso tático. **[3 PE · DT 23]** |
| 20 | **Descoberta Científica** *(combate)* | Cria uma solução inédita com efeito devastador em campo. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Laboratório Autônomo** | Passa a criar ofensivas e contramedidas mesmo sob pressão. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Criação Avançada** | Gera protótipos altamente letais ou decisivos. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mente de Fronteira** | Encontra soluções agressivas para problemas impossíveis. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Salto do Conhecimento** | Produz uma inovação de guerra capaz de mudar uma batalha inteira. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 4. Comerciante

**Função:** lucro, influência, negociação e guerra econômica; em combate, usa recursos, pressão e controle de território.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Leitura de Mercado** | Identifica valor, escassez e oportunidade antes dos outros. **[1 PE · DT 15]** |
| 1 | **Empurrão Comercial** | Usa conversa e presença para obter vantagem social e abrir espaço. **[1 PE · DT 15]** |
| 2 | **Cobrança Dura** *(combate)* | Pressiona uma dívida, acordo ou rival com ameaça econômica ou social. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Estoque Pronto** *(combate)* | Entra em combate com recursos, munição e equipamentos já organizados. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Rede Comercial** | Chama fornecedores, intermediários e contatos para apoiar a missão. **[2 PE · DT 17]** |
| 5 | **Troca de Pressão** *(combate)* | Oferece ou recusa recursos para enfraquecer a posição de um inimigo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Avaliação Rápida** | Reconhece falsificações, peças valiosas e pontos fracos de mercadorias. **[2 PE · DT 17]** |
| 8 | **Rotas Discretas** | Move carga ou equipe por caminhos que evitam emboscadas e bloqueios. **[2 PE · DT 17]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Barganha Hostil** *(combate)* | Transforma negociação em arma, forçando vantagem sobre o oponente. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 10 | **Logística de Guerra** | Mantém aliados abastecidos e o inimigo em desvantagem material. **[2 PE · DT 19]** |
| 11 | **Estoque de Emergência** *(combate)* | Libera recursos críticos no momento certo para sobreviver ou vencer. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 12 | **Mercado Cinza** | Compra, vende ou movimenta itens estratégicos fora das regras comuns. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Financiamento de Missão** *(combate)* | Converte crédito em poder real no campo. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Leilão Oportunista** | Lucra e enfraquece rivais em meio à crise, guerra ou caos. **[3 PE · DT 21]** |
| 15 | **Intermediação de Conflito** | Usa posição econômica para influenciar facções e decisões. **[3 PE · DT 21]** |
| 16 | **Carga Prioritária** *(combate)* | Protege o recurso mais valioso da operação com foco absoluto. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Monopólio Local** | Domina um setor, rota ou produto, sufocando concorrentes. **[3 PE · DT 23]** |
| 18 | **Crédito de Confiança** | Obtém recursos e favores antes mesmo de pagar. **[3 PE · DT 23]** |
| 19 | **Troca de Alto Valor** *(combate)* | Movimenta itens raros ou proibidos com enorme vantagem. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 20 | **Império de Lucro** *(combate)* | Transforma comércio em poder político, militar e logístico. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Rede de Distribuição** | Sua estrutura passa a sustentar a guerra de forma contínua. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Capital de Guerra** | Dinheiro vira vantagem ofensiva e defensiva imediata. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Senhor das Rotas** | Controla fluxos estratégicos e corta o inimigo de recursos. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Mão Invisível** | Manipula recursos e eventos de forma quase impossível de conter. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 5. Contrabandista

**Função:** infiltração, transporte ilegal, evasão e guerra de movimento; excelente para fugas, entradas e ataques rápidos.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Rota Clandestina** | Encontra caminhos discretos para mover pessoas ou carga. **[1 PE · DT 15]** |
| 1 | **Carga Oculta** | Esconde armas, mercadorias ou passageiros em veículos e compartimentos. **[1 PE · DT 15]** |
| 2 | **Despiste Rápido** *(combate)* | Rompe perseguições com curvas, iscas ou manobras curtas. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Leitura de Bloqueio** | Percebe patrulhas, pontos de controle e zonas de risco antes de entrar. **[1 PE · DT 15]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Documento Frio** | Falsifica ou adapta documentos, selos e registros básicos. **[2 PE · DT 17]** |
| 5 | **Negócio Sujo** | Vende, troca ou negocia mercadorias proibidas com vantagem. **[2 PE · DT 17]** |
| 6 | **Bunker Móvel** *(combate)* | Protege carga e tripulação dentro da nave ou veículo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 8 | **Fuga de Pista** *(combate)* | Reduz drasticamente as chances de ser seguido por sensores e rastreadores. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Corredor de Sombra** | Atravessa áreas perigosas sem chamar atenção. **[2 PE · DT 19]** |
| 10 | **Piloto de Risco** *(combate)* | Melhora manobras em perseguições, obstáculos e terreno apertado. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Carga Sensível** | Transporta itens frágeis, explosivos ou valiosos sem perder eficiência. **[2 PE · DT 19]** |
| 12 | **Blecaute Tático** *(combate)* | Corta luz, sinal ou comunicação para abrir caminho ou causar confusão. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Mercado Negro** | Acessa armas, peças, informações e contatos ilegais. **[3 PE · DT 21]** |
| 14 | **Falso Positivo** | Faz nave, carga ou equipe parecer sem importância para inspeções. **[3 PE · DT 21]** |
| 15 | **Contrabando Vivo** | Transporta pessoas, criaturas ou alvos de forma discreta e eficiente. **[3 PE · DT 21]** |
| 16 | **Saída de Emergência** *(combate)* | Cria rota de fuga mesmo quando tudo já está cercado. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Rede de Rotas** | Conhece múltiplas passagens, portos e contatos para mover qualquer coisa. **[3 PE · DT 23]** |
| 18 | **Carga Inexpugnável** *(combate)* | Protege mercadorias importantes contra roubo, dano e interceptação. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Pilha de Favores** | Usa dívidas, contatos e promessas como arma social e logística. **[3 PE · DT 23]** |
| 20 | **Fantasma da Rota** *(combate)* | Atravessa sistemas como se não existisse, quase impossível de rastrear. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Corredor Cego** | Atravessa bloqueios e inspeções com enorme facilidade. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Nave de Operação** | Transforma veículo ou nave em máquina ideal para fuga e transporte clandestino. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mestre do Submundo** | Domina esconderijos, rotas e contatos em grande escala. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Rota Impossível** | Abre um caminho secreto quase inacreditável entre mundos ou setores. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 6. Diplomata

**Função:** negociação, mediação, influência política e desescalada, mas também combate social e controle de conflito.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Voz Controlada** | Melhora presença, clareza e firmeza ao falar. **[1 PE · DT 15]** |
| 1 | **Leitura Social** | Identifica tensão, intenção e risco imediato em conversas. **[1 PE · DT 15]** |
| 2 | **Abertura de Diálogo** | Reduz hostilidade inicial e facilita o início de negociações. **[1 PE · DT 15]** |
| 3 | **Tom Adequado** *(combate)* | Adapta a abordagem ao tipo de cultura, autoridade ou facção — inclui coagir/desestabilizar um oponente na conversa. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Mediação Simples** | Impede uma discussão de virar combate. **[2 PE · DT 17]** |
| 5 | **Juramento Formal** | Sela pactos com maior dificuldade de quebra. **[2 PE · DT 17]** |
| 6 | **Status e Etiqueta** | Domina protocolos, títulos e rituais sociais. **[2 PE · DT 17]** |
| 8 | **Persuasão Direta** *(combate)* | Faz o alvo ouvir, ceder, esperar, recuar ou hesitar em pleno confronto. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Pressão Política** *(combate)* | Usa reputação, leis e alianças para ganhar vantagem — inclusive isolar um alvo antes do combate. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 10 | **Defesa Verbal** | Resiste a blefes, ameaças e manipulação. **[2 PE · DT 19]** |
| 11 | **Ponte Cultural** | Reduz conflitos entre povos com costumes diferentes. **[2 PE · DT 19]** |
| 12 | **Proposta Irrecusável** | Cria ofertas extremamente vantajosas para aliados ou autoridades. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Acordo Estratégico** | Transforma negociação em vantagem concreta de missão. **[3 PE · DT 21]** |
| 14 | **Desescalada** *(combate)* | Faz uma situação hostil perder força antes do combate, retirando inimigos do confronto. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Testemunho de Peso** | Sua palavra passa a pesar muito em decisões. **[3 PE · DT 21]** |
| 16 | **Fronteira Segura** | Garante passagem, abrigo ou tolerância em território hostil. **[3 PE · DT 21]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Mesa de Guerra** | Influencia líderes, capitães e conselhos inteiros. **[3 PE · DT 23]** |
| 18 | **Pacto de Longa Duração** | Cria alianças difíceis de romper e muito valiosas. **[3 PE · DT 23]** |
| 19 | **Voz de Autoridade** *(combate)* | Sua presença muda o peso de decisões sociais e políticas — pode forçar a rendição de um oponente. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 20 | **Harmonia de Facções** | Une lados opostos em torno de um objetivo comum. **[3 PE · DT 23]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Tratado Menor** | Formaliza um acordo duradouro com forte valor estratégico. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Embaixador de Campo** | Representa seu grupo com legitimidade em qualquer mundo ou facção. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Arquitetura da Paz** | Costura alianças amplas e evita guerras grandes. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Voz da Galáxia** | Sua diplomacia pode alterar o destino de uma guerra ou civilização. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 7. Engenheiro

**Função:** constrói, repara e modifica naves, droides, armas e equipamentos — em combate, transforma tecnologia e gadgets em vantagem ofensiva/defensiva imediata.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Carga Improvisada** *(combate)* | Monta uma pequena carga explosiva ou elétrica com peças do ambiente; dano leve em área curta. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Olho Técnico** | Identifica falhas, pontos fracos e valor de qualquer máquina, droide ou veículo. **[1 PE · DT 15]** |
| 2 | **Reparo de Campo** | Conserta rapidamente equipamento danificado, restaurando função parcial. **[1 PE · DT 15]** |
| 3 | **Choque Dirigido** *(combate)* | Descarrega energia de uma ferramenta ou bateria contra um alvo próximo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Modificação Rápida** | Adapta uma arma ou equipamento para ganhar um efeito extra temporário (mais dano, alcance, precisão). **[2 PE · DT 17]** |
| 5 | **Torreta Portátil** *(combate)* | Monta uma pequena torreta ou droide de defesa que atira automaticamente por um tempo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Blindagem Reforçada** | Reforça armadura própria ou de aliado, reduzindo dano recebido. **[2 PE · DT 17]** |
| 8 | **Sobrecarga** *(combate)* | Força um sistema, arma ou droide inimigo a sobrecarregar, causando dano e falha temporária. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Droide de Combate** *(combate)* | Ativa um droide de ataque previamente preparado para lutar ao seu lado. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 10 | **Hackeamento Tático** | Assume controle temporário de um sistema, droide ou torre inimiga. **[2 PE · DT 19]** |
| 11 | **Explosivo Direcionado** *(combate)* | Planta uma carga com detonação controlada, causando dano maior e mais preciso. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 12 | **Manutenção de Combate** | Repara e reenergiza equipamento aliado em pleno confronto. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Arsenal Modular** *(combate)* | Equipa arma própria com módulos intercambiáveis (fogo, choque, perfuração) no meio do combate. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Enxame de Drones** *(combate)* | Libera pequenos drones que atacam, distraem ou marcam alvos. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Escudo de Emergência** | Cria um campo de proteção temporário para si ou para o grupo. **[3 PE · DT 21]** |
| 16 | **Sabotagem Letal** *(combate)* | Reprograma uma arma, veículo ou droide inimigo para virar-se contra seus próprios aliados. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Fabricação de Guerra** | Monta um equipamento ofensivo especializado sob medida para a missão atual. **[3 PE · DT 23]** |
| 18 | **Rede de Combate** *(combate)* | Sincroniza droides, torretas e drones próprios para atacar em conjunto. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Núcleo Instável** *(combate)* | Transforma qualquer máquina ou veículo próximo numa bomba de tempo controlada. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 20 | **Máquina de Guerra** *(combate)* | Monta ou ativa uma unidade de combate pesada (droide, veículo blindado) para lutar ao seu lado por tempo prolongado. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Oficina de Combate** | Cria e mantém múltiplas unidades ofensivas simultâneas, sustentando a guerra tecnológica. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Protótipo Devastador** | Ativa uma arma ou veículo experimental de altíssimo poder de fogo. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mente Mecânica** | Controla, repara e comanda qualquer tecnologia em campo quase instantaneamente. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Singularidade Tecnológica** | Ativa uma criação lendária — arma, droide ou nave — capaz de decidir uma batalha inteira sozinha. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 8. Espião

**Função:** infiltração, sabotagem silenciosa e execução precisa — combate baseado em furtividade, veneno e ataques certeiros vindos das sombras.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Lâmina Silenciosa** *(combate)* | Dano bônus contra alvo desprevenido. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Passo Invisível** | Reduz detecção. **[1 PE · DT 15]** |
| 2 | **Disfarce Rápido** | Muda aparência/identidade por tempo curto. **[1 PE · DT 15]** |
| 3 | **Golpe Certeiro** *(combate)* | Ataque preciso em ponto vital, dano aumentado. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Acesso Forjado** | Falsifica credenciais/portas. **[2 PE · DT 17]** |
| 5 | **Toxina de Contato** *(combate)* | Veneno de ação lenta aplicado em arma corpo a corpo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Escuta Discreta** | Capta informação de longe. **[2 PE · DT 17]** |
| 8 | **Corte de Vigilância** *(combate)* | Neutraliza sentinela/câmera com ataque silencioso. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Sombra Dupla** | Cria distração/falsa presença. **[2 PE · DT 19]** |
| 10 | **Lâmina Envenenada** *(combate)* | Aumenta efeito e dano de venenos aplicados. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Infiltração Profunda** | Entra em áreas de alta segurança sem ser notado. **[2 PE · DT 19]** |
| 12 | **Execução Rápida** *(combate)* | Ataque combinado que ignora parte da defesa do alvo. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Rede de Sombras** *(combate)* | Coordena ataques furtivos simultâneos com aliados. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Disfarce Perfeito** | Se passa por qualquer figura conhecida. **[3 PE · DT 21]** |
| 15 | **Golpe Paralisante** *(combate)* | Imobiliza o alvo por um tempo curto. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 16 | **Fuga Fantasma** | Desaparece completamente após um ataque. **[3 PE · DT 21]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Mestre do Disfarce** | Infiltra-se em qualquer organização. **[3 PE · DT 23]** |
| 18 | **Assassinato Perfeito** *(combate)* | Ataque de altíssimo dano contra alvo isolado. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Rede de Contatos Sombrios** | Obtém qualquer informação através do submundo. **[3 PE · DT 23]** |
| 20 | **Sombra Letal** *(combate)* | Combina furtividade e dano extremo num único golpe decisivo. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Fantasma Operacional** | Infiltra e ataca sem deixar rastro algum. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Lâmina das Mil Faces** | Assume qualquer identidade e ataca com letalidade extrema. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mestre Assassino** | Um único golpe pode eliminar quase qualquer alvo. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **A Sombra Perfeita** | Executa uma operação letal que muda o destino de uma facção inteira. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 9. Explorador

**Função:** desbravador de regiões desconhecidas — combate usando terreno, criaturas selvagens e sobrevivência bruta a seu favor.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe de Trilha** *(combate)* | Usa bordão, faca ou ferramenta de exploração como arma. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Instinto Selvagem** | Percebe perigos e caminhos ocultos. **[1 PE · DT 15]** |
| 2 | **Passo Firme** | Movimento superior em terrenos difíceis. **[1 PE · DT 15]** |
| 3 | **Armadilha Simples** *(combate)* | Monta armadilha rústica que fere o inimigo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Leitura de Fauna** | Prevê comportamento de criaturas. **[2 PE · DT 17]** |
| 5 | **Investida Selvagem** *(combate)* | Ataque com impulso após corrida/salto. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Abrigo Improvisado** | Cria proteção temporária em qualquer ambiente. **[2 PE · DT 17]** |
| 8 | **Chamado da Natureza** *(combate)* | Atrai criatura local para atacar o inimigo. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Rota de Fuga** | Conhece sempre uma saída em qualquer terreno. **[2 PE · DT 19]** |
| 10 | **Golpe de Precisão Selvagem** *(combate)* | Ataque que explora ponto fraco de criaturas/terreno. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Resistência Extrema** | Ignora fadiga, clima e fome por período prolongado. **[2 PE · DT 19]** |
| 12 | **Cilada Natural** *(combate)* | Usa o ambiente (queda, água, fauna) para ferir o inimigo. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Faro de Perigo** | Detecta emboscadas antes que aconteçam. **[3 PE · DT 21]** |
| 14 | **Fúria da Trilha** *(combate)* | Sequência de golpes rápidos após se mover em combate. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Domínio do Terreno** | Transforma qualquer ambiente em vantagem tática. **[3 PE · DT 21]** |
| 16 | **Investida Predatória** *(combate)* | Ataque forte após emboscada ou surpresa. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Rastro Impossível** | Segue qualquer alvo por qualquer terreno. **[3 PE · DT 23]** |
| 18 | **Golpe da Terra Selvagem** *(combate)* | Dano aumentado ao lutar em ambiente natural hostil. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Aliado Selvagem** | Convoca apoio temporário de uma criatura local. **[3 PE · DT 23]** |
| 20 | **Fúria da Natureza** *(combate)* | Ataque devastador combinando terreno, força e velocidade. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Senhor da Trilha** | Domina completamente qualquer ambiente natural em combate. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Fera Desperta** | Luta com força e ferocidade sobre-humanas por tempo curto. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Guardião Selvagem** | Comanda o ambiente e criaturas ao seu favor em larga escala. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Ira da Fronteira Selvagem** | Desencadeia a força total da natureza contra os inimigos. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 10. Guarda Planetário

**Função:** protetor da ordem local — combate defensivo, controle de área e proteção de civis/aliados.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe de Contenção** *(combate)* | Ataque padrão para conter e derrubar. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Vigilância Constante** | Percebe ameaças a civis/área antes que ajam. **[1 PE · DT 15]** |
| 2 | **Escudo Padrão** | Melhora defesa própria e de quem protege. **[1 PE · DT 15]** |
| 3 | **Ordem de Parada** *(combate)* | Ataque de aviso que força recuo do alvo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Perímetro Seguro** | Estabelece zona de proteção temporária. **[2 PE · DT 17]** |
| 5 | **Golpe de Autoridade** *(combate)* | Dano aumentado contra quem ameaça civis. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Reforço Tático** | Chama apoio local (patrulha, unidade próxima). **[2 PE · DT 17]** |
| 8 | **Bloqueio de Área** *(combate)* | Impede avanço inimigo com força controlada. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Proteção Avançada** | Reduz dano sofrido por aliados próximos. **[2 PE · DT 19]** |
| 10 | **Golpe Decisivo** *(combate)* | Ataque forte contra alvo prioritário/perigoso. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Comando de Emergência** | Coordena civis e aliados em situação de crise. **[2 PE · DT 19]** |
| 12 | **Contenção Total** *(combate)* | Imobiliza ou neutraliza um alvo hostil sem matar. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Escudo do Distrito** | Proteção de área ampliada contra ataques. **[3 PE · DT 21]** |
| 14 | **Golpe da Lei** *(combate)* | Ataque que pune diretamente quem infringe a ordem. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Resposta Rápida** | Chega e age antes que o perigo se agrave. **[3 PE · DT 21]** |
| 16 | **Supressão Tática** *(combate)* | Neutraliza múltiplos alvos hostis em sequência. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Guardião do Setor** | Protege uma área inteira com eficiência máxima. **[3 PE · DT 23]** |
| 18 | **Golpe Final da Ordem** *(combate)* | Ataque de altíssimo impacto contra ameaça grave. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Autoridade Inquestionável** | Intimida e controla situações de crise instantaneamente. **[3 PE · DT 23]** |
| 20 | **Escudo Absoluto** *(combate)* | Protege e revida com força total contra qualquer ataque. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Lei Viva** | Torna-se a autoridade máxima e ofensiva do setor. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Muralha Inabalável** | Suporta e revida ataques em escala massiva. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Braço da Justiça** | Elimina ameaças graves com um só golpe decisivo. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **A Ordem Absoluta** | Impõe paz e proteção total, neutralizando qualquer ameaça ao seu redor. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 11. Mandaloriano

**Função:** guerreiro disciplinado com armadura e arsenal próprios — combate direto, versátil e extremamente resistente.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe de Beskar** *(combate)* | Ataque corpo a corpo com arma tradicional mandaloriana. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Instinto de Guerra** | Percebe ameaças e avalia inimigos rapidamente. **[1 PE · DT 15]** |
| 2 | **Armadura Ajustada** | Melhora proteção conforme a missão. **[1 PE · DT 15]** |
| 3 | **Disparo de Pulso** *(combate)* | Tiro de arma de punho embutida na armadura. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Jetpack Tático** | Melhora mobilidade vertical e reposicionamento. **[2 PE · DT 17]** |
| 5 | **Rajada de Flanco** *(combate)* | Ataque rápido após reposicionamento aéreo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Honra do Clã** | Ganha vantagem social/moral entre guerreiros e clãs. **[2 PE · DT 17]** |
| 8 | **Lança-Chamas de Pulso** *(combate)* | Ataque em área curta com fogo/energia. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Armadura Reforçada** | Resistência elevada a dano físico e energético. **[2 PE · DT 19]** |
| 10 | **Combo de Combate** *(combate)* | Sequência de golpes corpo a corpo e à distância. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Rastreador de Caça** | Localiza e persegue alvo marcado sem falhar. **[2 PE · DT 19]** |
| 12 | **Escudo de Punho** *(combate)* | Bloqueia e revida ataque com força extra. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Arsenal Completo** | Alterna entre armas de combate sem perder ritmo. **[3 PE · DT 21]** |
| 14 | **Fúria Mandaloriana** *(combate)* | Sequência de ataques com dano crescente. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem de Batalha** | Reduz drasticamente dano crítico recebido. **[3 PE · DT 21]** |
| 16 | **Investida Aérea** *(combate)* | Ataque de cima usando jetpack, dano em área de impacto. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Código de Mandalore** | Ganha respeito e autoridade entre guerreiros e facções. **[3 PE · DT 23]** |
| 18 | **Golpe do Guerreiro** *(combate)* | Ataque de altíssima precisão e dano. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Armadura Lendária** | Proteção quase impenetrável por tempo limitado. **[3 PE · DT 23]** |
| 20 | **Tempestade de Combate** *(combate)* | Combina armas, jetpack e força bruta num ataque devastador. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Caçador Implacável** | Torna-se imparável ao perseguir um alvo marcado. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Fúria de Beskar** | Ataques consecutivos de altíssimo dano sem pausa. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Lenda de Mandalore** | Combate com poder quase mítico, quase impossível de deter. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **O Último Guerreiro** | Desencadeia todo o arsenal e força em um ataque final devastador. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 12. Médico

**Função:** cura e suporte em combate — mas também usa ferramentas médicas e conhecimento anatômico para atacar com precisão cirúrgica.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe Cirúrgico** *(combate)* | Ataque preciso em ponto vital usando ferramenta médica. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Diagnóstico Rápido** | Identifica condição, ferimento e fraqueza física de alvo/aliado. **[1 PE · DT 15]** |
| 2 | **Primeiros Socorros** | Cura ferimentos leves rapidamente. **[1 PE · DT 15]** |
| 3 | **Injeção Neutralizante** *(combate)* | Aplica substância que enfraquece o alvo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Estabilização de Campo** | Recupera aliado caído em combate. **[2 PE · DT 17]** |
| 5 | **Toxina Cirúrgica** *(combate)* | Ataque com substância que causa dano contínuo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Kit Avançado** | Melhora eficiência de cura e tratamento. **[2 PE · DT 17]** |
| 8 | **Golpe Paralisante** *(combate)* | Ataque que afeta nervos/movimento do alvo. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Cura Sob Pressão** | Trata múltiplos aliados rapidamente em combate. **[2 PE · DT 19]** |
| 10 | **Bisturi Certeiro** *(combate)* | Ataque que ignora parte da resistência do alvo. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Antídoto Universal** | Neutraliza venenos e toxinas em si ou aliados. **[2 PE · DT 19]** |
| 12 | **Sedativo de Impacto** *(combate)* | Ataque que reduz drasticamente a ação do inimigo. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Cirurgia de Guerra** | Revive/estabiliza aliado gravemente ferido em pleno combate. **[3 PE · DT 21]** |
| 14 | **Golpe Anatômico** *(combate)* | Ataque de altíssima precisão contra ponto vital. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Imunização de Grupo** | Protege aliados contra efeitos negativos temporariamente. **[3 PE · DT 21]** |
| 16 | **Overdose Controlada** *(combate)* | Injeta substância que causa dano severo e progressivo. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Mestre da Cura** | Restaura completamente a condição de um aliado. **[3 PE · DT 23]** |
| 18 | **Golpe Fatal Preciso** *(combate)* | Ataque que explora fraqueza anatômica com dano altíssimo. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Equipe Estabilizada** | Todo o grupo recebe suporte médico contínuo. **[3 PE · DT 23]** |
| 20 | **Veneno Mortal** *(combate)* | Aplica substância letal de ação rápida em alvo único. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Anjo de Batalha** | Cura e sustenta o grupo inteiro em combates prolongados. **[4 PE · Cura 7d6 (área curta)]** |
| 35 | **Bisturi da Morte** | Ataques cirúrgicos que ignoram quase toda defesa do alvo. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mestre da Vida e da Morte** | Decide entre curar totalmente ou eliminar com precisão. **[6 PE · Cura ou Dano 12d6 + metade do grau treinado, à escolha]** |
| 99 | **Julgamento Clínico** | Um único procedimento que cura o grupo por completo ou elimina um alvo instantaneamente. **[8 PE · Cura ou Dano 18d6 + metade do grau treinado, à escolha]** |

---

## 13. Mercenário

**Função:** combatente independente e versátil — foco puro em dano, adaptação de armamento e eficiência em qualquer contrato.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe Contratado** *(combate)* | Ataque básico versátil, corpo a corpo ou à distância. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Avaliação de Alvo** | Identifica valor, perigo e fraqueza do contrato/inimigo. **[1 PE · DT 15]** |
| 2 | **Troca Rápida** | Alterna entre armas sem perder tempo. **[1 PE · DT 15]** |
| 3 | **Tiro de Abertura** *(combate)* | Ataque à distância com bônus de dano no primeiro golpe. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Equipamento Versátil** | Adapta arsenal para diferentes situações de contrato. **[2 PE · DT 17]** |
| 5 | **Golpe Duplo** *(combate)* | Ataque combinado corpo a corpo + arma de fogo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Rede de Contratos** | Acessa informações e ofertas de trabalho rapidamente. **[2 PE · DT 17]** |
| 8 | **Investida Paga** *(combate)* | Ataque com dano extra contra alvo com recompensa. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Instinto de Sobrevivência** | Reage a emboscadas com vantagem. **[2 PE · DT 19]** |
| 10 | **Rajada Mercenária** *(combate)* | Sequência de disparos rápidos contra um ou mais alvos. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Negociação sob Mira** | Força vantagem em negociação usando ameaça de combate. **[2 PE · DT 19]** |
| 12 | **Golpe Sem Piedade** *(combate)* | Dano aumentado contra alvo já ferido. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Arsenal Completo** | Equipamento adaptado para qualquer tipo de missão. **[3 PE · DT 21]** |
| 14 | **Fúria Contratada** *(combate)* | Sequência de ataques com dano crescente por combate. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem Paga** | Proteção temporária de alta qualidade. **[3 PE · DT 21]** |
| 16 | **Execução Eficiente** *(combate)* | Ataque de altíssima precisão contra alvo prioritário. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Reputação de Elite** | Contratos maiores e mais perigosos ficam acessíveis. **[3 PE · DT 23]** |
| 18 | **Golpe Sem Limites** *(combate)* | Ataque de dano máximo, sem restrições táticas. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Rede de Elite** | Acessa recursos e informações de alto nível. **[3 PE · DT 23]** |
| 20 | **Fúria Total** *(combate)* | Combina toda força, armamento e velocidade num ataque devastador. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Lenda dos Contratos** | Eficiência de combate aumenta drasticamente em qualquer missão paga. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Arsenal Lendário** | Acesso e domínio de armamento de altíssimo poder. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Mercenário Supremo** | Um dos combatentes mais temidos e eficientes da galáxia. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Contrato Final** | Executa o ataque mais letal de sua carreira, capaz de decidir qualquer conflito. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 14. Piloto

**Função:** ás dos céus e do espaço — combate aéreo/espacial e manobras que também funcionam como ataque direto.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Rasante de Combate** *(combate)* | Manobra que atinge inimigos no chão/próximos durante voo baixo. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Olho de Piloto** | Avalia rapidamente veículos, rotas e riscos. **[1 PE · DT 15]** |
| 2 | **Manobra Evasiva** | Reduz chance de ser atingido em perseguições. **[1 PE · DT 15]** |
| 3 | **Tiro de Cockpit** *(combate)* | Disparo rápido usando armamento do próprio veículo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Pilotagem Extrema** | Realiza manobras impossíveis para pilotos comuns. **[2 PE · DT 17]** |
| 5 | **Investida Aérea** *(combate)* | Colisão controlada ou rasante ofensivo contra alvo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Leitura de Rota** | Encontra o melhor caminho em perseguições e fugas. **[2 PE · DT 17]** |
| 8 | **Disparo em Movimento** *(combate)* | Ataque preciso mesmo em alta velocidade. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Domínio de Manobra** | Controla veículo com perfeição mesmo sob dano. **[2 PE · DT 19]** |
| 10 | **Rajada de Perseguição** *(combate)* | Sequência de disparos contra alvo em fuga/perseguição. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Piloto Fantasma** | Desaparece de sensores por curto período. **[2 PE · DT 19]** |
| 12 | **Ataque em Rasante** *(combate)* | Passa raspando sobre o alvo, causando dano direto. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Sincronia de Combate** | Coordena ataque aéreo com aliados em terra. **[3 PE · DT 21]** |
| 14 | **Manobra Suicida** *(combate)* | Ataque de altíssimo risco e dano contra alvo grande (nave, veículo pesado). **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem de Voo** | Reduz dano crítico ao veículo próprio. **[3 PE · DT 21]** |
| 16 | **Interceptação Perfeita** *(combate)* | Ataque que corta rota de fuga do inimigo com dano garantido. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Mestre dos Céus** | Controla qualquer veículo com perfeição absoluta. **[3 PE · DT 23]** |
| 18 | **Ataque Decisivo** *(combate)* | Manobra ofensiva de altíssimo impacto contra alvo prioritário. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Esquadrão Fantasma** | Coordena múltiplos veículos aliados numa manobra só. **[3 PE · DT 23]** |
| 20 | **Tempestade Aérea** *(combate)* | Ataque devastador combinando velocidade, precisão e armamento pesado. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Ás Lendário** | Torna-se praticamente intocável em combate aéreo/espacial. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Manobra Impossível** | Executa ataque que nenhum outro piloto conseguiria replicar. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Senhor dos Céus** | Domina completamente qualquer combate aéreo ou espacial. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Voo Final** | Executa a manobra ofensiva mais arriscada e poderosa já registrada. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 15. Pirata Espacial

**Função:** fora da lei violento e imprevisível — combate agressivo, saques e caos controlado.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe de Saque** *(combate)* | Ataque agressivo com arma improvisada ou branca. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Olho de Presa** | Identifica alvos vulneráveis e valiosos rapidamente. **[1 PE · DT 15]** |
| 2 | **Abordagem Rápida** | Invade veículos/naves com eficiência. **[1 PE · DT 15]** |
| 3 | **Tiro Sujo** *(combate)* | Disparo sem regras, ignora convenções de combate justo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Saque Relâmpago** | Rouba recursos/itens durante o próprio combate. **[2 PE · DT 17]** |
| 5 | **Fúria de Bordo** *(combate)* | Sequência de ataques ao invadir um veículo/nave. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Rede de Piratas** | Contata outros fora da lei para apoio ou informação. **[2 PE · DT 17]** |
| 8 | **Emboscada Selvagem** *(combate)* | Ataque surpresa com dano aumentado. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Terror da Rota** | Intimida tripulações inteiras a se renderem sem luta. **[2 PE · DT 19]** |
| 10 | **Corte Cruel** *(combate)* | Ataque que ignora parte da armadura do alvo. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Fuga com Butim** | Escapa com recursos roubados mesmo sob perseguição. **[2 PE · DT 19]** |
| 12 | **Caos Controlado** *(combate)* | Ataque em área que desorganiza grupo inimigo. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Bando de Saqueadores** *(combate)* | Coordena ataque com outros piratas/aliados. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 14 | **Fúria Sem Lei** *(combate)* | Sequência de golpes brutais sem limite tático. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem de Saque** | Proteção improvisada com itens roubados. **[3 PE · DT 21]** |
| 16 | **Abordagem Brutal** *(combate)* | Ataque de alto dano ao invadir veículo/base inimiga. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Rei dos Piratas** | Comanda respeito e medo em qualquer rota conhecida. **[3 PE · DT 23]** |
| 18 | **Golpe Sem Piedade** *(combate)* | Ataque de dano máximo contra alvo indefeso ou rendido. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Frota Pirata** | Convoca apoio de outros piratas em grande escala. **[3 PE · DT 23]** |
| 20 | **Tempestade de Saque** *(combate)* | Ataque devastador que combina caos, brutalidade e número. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Terror das Rotas** | Inimigos hesitam ou fogem só de reconhecê-lo. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Fúria Sem Lei Total** | Ataques consecutivos de altíssimo dano sem qualquer limite. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Lenda Pirata** | Comanda batalhas inteiras com brutalidade e carisma extremos. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Saque Final** | Executa o assalto mais violento e lucrativo de sua vida, devastador em combate. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 16. Soldado da República

**Função:** militar disciplinado e treinado — combate tático, trabalho em equipe e eficiência em batalha organizada.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Disparo Regulamentar** *(combate)* | Ataque padrão com arma de fogo militar. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Disciplina de Combate** | Mantém foco e desempenho mesmo sob pressão. **[1 PE · DT 15]** |
| 2 | **Cobertura Tática** | Melhora defesa própria e de aliados próximos. **[1 PE · DT 15]** |
| 3 | **Rajada Curta** *(combate)* | Sequência curta de disparos contra um alvo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Formação de Combate** | Coordena posicionamento com aliados para vantagem tática. **[2 PE · DT 17]** |
| 5 | **Tiro de Supressão** *(combate)* | Disparos que dificultam avanço/mira do inimigo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Comunicação Tática** | Troca informação de combate rapidamente com o esquadrão. **[2 PE · DT 17]** |
| 8 | **Investida Coordenada** *(combate)* | Ataque combinado com pelo menos um aliado. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Linha de Frente** | Resiste e sustenta posição sob fogo pesado. **[2 PE · DT 19]** |
| 10 | **Disparo Perfurante** *(combate)* | Ataque que ignora parte da blindagem do alvo. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Resgate sob Fogo** | Retira aliado ferido em pleno combate. **[2 PE · DT 19]** |
| 12 | **Avanço Blindado** *(combate)* | Ataque com proteção reforçada durante investida. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Comando de Esquadrão** | Melhora desempenho de todos os aliados próximos. **[3 PE · DT 21]** |
| 14 | **Rajada Pesada** *(combate)* | Sequência de disparos de alto dano contra múltiplos alvos. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem de Batalha** | Reduz drasticamente dano crítico recebido. **[3 PE · DT 21]** |
| 16 | **Ataque Sincronizado** *(combate)* | Ataque combinado com todo o esquadrão presente. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Veterano de Guerra** | Desempenho máximo mesmo em combates prolongados. **[3 PE · DT 23]** |
| 18 | **Disparo Decisivo** *(combate)* | Ataque de altíssima precisão e dano contra alvo prioritário. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Comando de Batalha** | Coordena esquadrão inteiro com eficiência máxima. **[3 PE · DT 23]** |
| 20 | **Ofensiva Total** *(combate)* | Ataque devastador combinando esquadrão, blindagem e armamento pesado. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Herói de Guerra** | Desempenho excepcional inspira e fortalece todo o esquadrão. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Tática Perfeita** | Executa manobra de combate quase impossível de contra-atacar. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Lenda Militar** | Comanda e vence batalhas praticamente sozinho quando necessário. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Última Linha de Defesa** | Um ataque final que pode decidir uma guerra inteira. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 17. Vigilante

**Função:** justiceiro independente — combate baseado em surpresa, intimidação e ataques decisivos contra alvos específicos.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Golpe da Justiça** *(combate)* | Ataque direto contra alvo claramente hostil/culpado. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 1 | **Olhar Vigilante** | Identifica ameaças e injustiças em curso. **[1 PE · DT 15]** |
| 2 | **Passo nas Sombras** | Movimento silencioso em áreas urbanas. **[1 PE · DT 15]** |
| 3 | **Intimidação Direta** *(combate)* | Ataque de aviso que abala moral do alvo. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Rede de Informantes** | Obtém pistas sobre alvos e crimes locais. **[2 PE · DT 17]** |
| 5 | **Golpe Surpresa** *(combate)* | Dano aumentado ao atacar de surpresa. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Disfarce Urbano** | Se mistura à população para observar sem ser notado. **[2 PE · DT 17]** |
| 8 | **Contenção Forçada** *(combate)* | Imobiliza alvo hostil sem matar. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Instinto de Justiceiro** | Prevê próximo movimento de criminosos/alvos. **[2 PE · DT 19]** |
| 10 | **Golpe Implacável** *(combate)* | Ataque de dano elevado contra alvo confirmado culpado. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Rede da Noite** | Coordena com outros vigilantes/informantes na região. **[2 PE · DT 19]** |
| 12 | **Emboscada Urbana** *(combate)* | Ataque surpresa em ambiente urbano com dano extra. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Presença Temida** | Intimida criminosos apenas com sua reputação. **[3 PE · DT 21]** |
| 14 | **Fúria da Justiça** *(combate)* | Sequência de golpes contra alvo especialmente cruel/perigoso. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 15 | **Blindagem Improvisada** | Proteção adaptada para combate urbano. **[3 PE · DT 21]** |
| 16 | **Captura Decisiva** *(combate)* | Ataque que neutraliza alvo de alto risco rapidamente. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Lenda das Sombras** | Reputação afasta criminosos comuns antes mesmo do confronto. **[3 PE · DT 23]** |
| 18 | **Golpe Final da Justiça** *(combate)* | Ataque de altíssimo dano contra alvo extremamente perigoso. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Guardião da Cidade** | Protege uma região inteira com eficiência conhecida. **[3 PE · DT 23]** |
| 20 | **Justiça Absoluta** *(combate)* | Ataque devastador contra o pior tipo de ameaça urbana. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Símbolo do Medo** | Criminosos hesitam ou fogem só ao saber que ele está por perto. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 35 | **Justiceiro Implacável** | Ataques consecutivos de altíssimo dano contra alvos confirmados. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 50 | **Lenda Urbana** | Torna-se figura quase mítica de justiça e combate. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Julgamento Final** | Executa o ataque mais decisivo contra a maior ameaça que a cidade já enfrentou. **[8 PE · Dano 18d6 + metade do grau treinado]** |

---

## 18. Formas de Sabre de Luz

As 3 classes-base ligadas à Força (Padawan Jedi, Acólito Sith, Andarilho da Força) aprendem as 7 formas clássicas de combate com sabre de luz ao longo dos 3 primeiros círculos. Nenhuma forma é superior no geral — o equilíbrio é circular: cada forma vence exatamente 3 outras e perde para exatamente 3, então em combate 1x1 no mesmo nível, quem lê a forma do oponente e responde com a forma certa leva vantagem, não quem "tem a classe mais forte".

| # | Forma | Estilo |
|---|---|---|
| I | **Shii-Cho** | Básica, ampla, contra múltiplos oponentes |
| II | **Makashi** | Precisão, duelo elegante, economia de movimento |
| III | **Soresu** | Defensiva pura, resistência, contra-ataque mínimo |
| IV | **Ataru** | Acrobática, agressiva, alta mobilidade |
| V | **Djem So / Shien** | Contra-ataque de força, converte defesa em ofensiva pesada |
| VI | **Niman** | Híbrida, eclética, combina sabre com outras técnicas |
| VII | **Juyo / Vaapad** | Agressão pura, imprevisível, ligada à emoção intensa |

### Matriz de vantagem (circular — vence as 3 seguintes, perde para as 3 anteriores)

| Forma | Vence | Perde para |
|---|---|---|
| I. Shii-Cho | II, III, IV | V, VI, VII |
| II. Makashi | III, IV, V | VI, VII, I |
| III. Soresu | IV, V, VI | VII, I, II |
| IV. Ataru | V, VI, VII | I, II, III |
| V. Djem So | VI, VII, I | II, III, IV |
| VI. Niman | VII, I, II | III, IV, V |
| VII. Vaapad | I, II, III | IV, V, VI |

### Progressão de aprendizado por classe

| Círculo | Padawan Jedi | Acólito Sith | Andarilho da Força |
|---|---|---|---|
| 1º (exclusivas, sem repetir entre as 3) | Shii-Cho, Soresu | Djem So, Vaapad | Ataru, Niman |
| 2º (pode repetir) | Makashi, Ataru | Makashi, Shii-Cho | Soresu, Djem So |
| 3º (fecha as 7 formas) | Djem So, Niman, Vaapad | Soresu, Ataru, Niman | Shii-Cho, Makashi, Vaapad |
| 4º (2 dominantes) | Soresu, Ataru | Djem So, Vaapad | Niman, Djem So |
| 5º (especialista) | Escolha livre do jogador — igual nas 3 classes | Escolha livre do jogador — igual nas 3 classes | Escolha livre do jogador — igual nas 3 classes |

---

## 19. Padawan Jedi

**Função:** aprendiz Jedi — sabre de luz, poderes de Força ligados à Luz, disciplina defensiva.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Primeiras Formas** *(combate)* | Aprende Shii-Cho (I) e Soresu (III).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 1 | **Sentir a Força** | Percebe perigo, emoções e presenças próximas. **[1 PE · DT 15]** |
| 2 | **Empurrão da Força** *(combate)* | Repele o inimigo com uma onda de energia. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Salto da Força** *(combate)* | Impulso que fecha distância com ataque de queda. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Segundas Formas** *(combate)* | Aprende Makashi (II) e Ataru (IV).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 5 | **Puxão da Força** *(combate)* | Arranca arma ou desequilibra o inimigo à distância. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Premonição** | Antecipa o próximo ataque inimigo (bônus defensivo). **[2 PE · DT 17]** |
| 8 | **Investida de Sabre** *(combate)* | Avanço rápido com golpe concentrado.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Formas Completas** *(combate)* | Aprende Djem So (V), Niman (VI) e Vaapad (VII) — domina as 7 formas.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 10 | **Onda de Choque** *(combate)* | Pulso de Força que derruba múltiplos inimigos próximos. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Salto Acrobático** | Mobilidade extrema em combate (paredes, saltos longos). **[2 PE · DT 19]** |
| 12 | **Corte Duplo** *(combate)* | Sequência de golpes de sabre em dois alvos.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Domínio: Soresu** *(combate)* | Soresu vira forma dominante — defesa quase impenetrável, contra-ataque garantido.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 14 | **Domínio: Ataru** *(combate)* | Ataru vira forma dominante — sequência acrobática de alto dano.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 15 | **Barreira da Força** | Escudo que bloqueia ataques físicos e de energia por um tempo. **[3 PE · DT 21]** |
| 16 | **Arremesso de Sabre** *(combate)* | Lança o sabre controlado pela Força e o retorna à mão.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Especialização de Forma** *(igual nas 3 classes)* | Escolhe 1 das 7 formas aprendidas como especialidade — bônus permanente de dano/defesa com ela. **[3 PE · DT 23]** |
| 18 | **Tempestade de Força** *(combate)* | Combina golpes de sabre com empurrões/puxões em sequência.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 19 | **Serenidade Jedi** | Recupera-se de efeitos negativos com foco mental. **[3 PE · DT 23]** |
| 20 | **Golpe da Luz** *(combate)* | Ataque final que une sabre e Força num só golpe decisivo.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Domínio Absoluto** *(igual nas 3, aplica à forma escolhida no 5º círculo)* | Maestria completa na forma especialista — reação quase automática nela. **[4 PE · DT 26]** |
| 25 | **Reflexo Perfeito** *(combate)* | Deflexão de sabre quase infalível contra disparos e golpes; pode revidar automaticamente.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 30 | **Chamado da Luz** | Sinal claro de que a conexão com o Lado da Luz amadureceu — abre caminho para se tornar **O Lado da Luz** ao completar o nível 30. **[4 PE · DT 27]** |
| 30 | **Consagração do Sabre** *(combate)* | O sabre brilha mais intenso; ataques causam dano extra contra alvos do Lado Sombrio.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 35 | **Tempestade da Luz** *(combate)* | Sequência de golpes de sabre e Força que atinge todos ao redor.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 35 | **Muralha de Luz** *(combate)* | Cria um campo de proteção que também empurra e fere inimigos que o tocam. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 40 | **Julgamento Sereno** *(combate)* | Ataque preciso que ignora parte da defesa do alvo, guiado por clareza mental total. **[5 PE · Dano 10d6 + metade do grau treinado]** |
| 40 | **Presença Inabalável** | Aura que fortalece a resolução dos aliados e enfraquece a moral dos inimigos próximos. **[5 PE · DT 30]** |
| 50 | **Guardião da Ordem** *(combate)* | Poder de sabre e Força em nível de Cavaleiro Jedi consagrado.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 50 | **Eco dos Mestres** *(combate)* | Canaliza a sabedoria de mestres Jedi passados num bônus temporário massivo de dano e defesa. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Iluminação Jedi** | Um momento de clareza total que resolve o combate com precisão quase sobrenatural. **[8 PE · DT 36]** |

---

## 20. Acólito Sith

**Função:** aprendiz do Lado Sombrio — sabre agressivo, poderes ofensivos da Força.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Primeiras Formas** *(combate)* | Aprende Djem So (V) e Vaapad (VII).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 1 | **Sentir a Raiva** | Percebe fraquezas emocionais do oponente. **[1 PE · DT 15]** |
| 2 | **Empurrão Sombrio** *(combate)* | Onda de Força carregada de raiva, mais bruta que a versão Jedi. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Salto da Força** *(combate)* | Impulso que fecha distância com ataque de queda. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Segundas Formas** *(combate)* | Aprende Makashi (II) e Shii-Cho (I).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 5 | **Relâmpago Menor** *(combate)* | Descarga elétrica de curto alcance. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Presença Sombria** | Intimida inimigos próximos com aura de poder. **[2 PE · DT 17]** |
| 8 | **Golpe Impiedoso** *(combate)* | Ataque de sabre que ignora parte da defesa do inimigo.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Formas Completas** *(combate)* | Aprende Soresu (III), Ataru (IV) e Niman (VI) — domina as 7 formas.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 10 | **Relâmpago da Força** *(combate)* | Descarga elétrica de alcance médio, dano elevado. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Salto Predatório** *(combate)* | Avanço agressivo com golpe de sabre ao aterrissar.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 12 | **Ilusão do Medo** | Faz o inimigo hesitar ou fugir por instantes. **[2 PE · DT 19]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Domínio: Djem So** *(combate)* | Djem So vira forma dominante — converte defesa em contra-ataque devastador.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 14 | **Domínio: Vaapad** *(combate)* | Vaapad vira forma dominante — sequência imprevisível de altíssimo dano.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 15 | **Estrangulamento** *(combate)* | Sufoca o alvo à distância, causando dano e imobilização parcial. **[3 PE · Dano 4d6 + metade do grau treinado]** |
| 16 | **Drenar Força** *(combate)* | Rouba energia/vitalidade do alvo para si. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Especialização de Forma** *(igual nas 3 classes)* | Escolhe 1 das 7 formas aprendidas como especialidade — bônus permanente de dano/defesa com ela. **[3 PE · DT 23]** |
| 18 | **Fúria Desencadeada** *(combate)* | Sequência devastadora de golpes de sabre com dano crescente.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 19 | **Máscara do Sombrio** | Esconde presença na Força de sensitivos inimigos. **[3 PE · DT 23]** |
| 20 | **Golpe da Escuridão** *(combate)* | Ataque final que une sabre, relâmpago e fúria num só golpe brutal.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Domínio Absoluto** *(igual nas 3, aplica à forma escolhida no 5º círculo)* | Maestria completa na forma especialista. **[4 PE · DT 26]** |
| 25 | **Fome de Poder** *(combate)* | Cada inimigo abatido em combate aumenta o dano dos próximos golpes. **[4 PE · Dano 7d6 + metade do grau treinado]** |
| 30 | **Chamado da Escuridão** | Sinal claro de que a entrega ao Lado Sombrio amadureceu — abre caminho para se tornar **O Lado Negro** ao completar o nível 30. **[4 PE · DT 27]** |
| 30 | **Onda de Dor** *(combate)* | Explosão de Força carregada de sofrimento que atinge todos ao redor. **[4 PE · Dano 8d6 + metade do grau treinado]** |
| 35 | **Fúria Absoluta** *(combate)* | Estado de combate onde cada golpe aumenta o próximo. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 35 | **Corrupção do Sabre** *(combate)* | A lâmina passa a causar dano adicional de energia sombria a cada golpe.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 40 | **Julgamento Cruel** *(combate)* | Ataque que ignora defesa e resistência do alvo, guiado por ódio puro. **[5 PE · Dano 10d6 + metade do grau treinado]** |
| 40 | **Domínio do Medo** | Aura que enfraquece a moral e a precisão dos inimigos próximos. **[5 PE · DT 30]** |
| 50 | **Senhor da Dor** *(combate)* | Drena vida e força do inimigo enquanto ataca sem piedade. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 50 | **Legado Sombrio** *(combate)* | Canaliza o poder de antigos Sith num bônus temporário massivo de dano. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 99 | **Ira do Lado Sombrio** | Libera todo o ódio acumulado num ataque capaz de arrasar um campo de batalha inteiro. **[8 PE · DT 36]** |

---

## 21. Andarilho da Força

**Função:** sensível à Força autodidata, fora de qualquer ordem — combate instintivo e eclético.

### 1º círculo (níveis 1-3)
| Nível | Habilidade | Efeito |
|---|---|---|
| 1 | **Primeiras Formas** *(combate)* | Aprende Ataru (IV) e Niman (VI).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 1 | **Instinto Aguçado** | Percebe perigo antes que aconteça, sem entender a Força conscientemente. **[1 PE · DT 15]** |
| 2 | **Empurrão Bruto** *(combate)* | Explosão de Força não refinada que arremessa o inimigo. **[1 PE · Dano 1d6 + metade do grau treinado]** |
| 3 | **Salto da Força** *(combate)* | Impulso que fecha distância com ataque de queda. **[1 PE · Dano 1d6 + metade do grau treinado]** |

### 2º círculo (níveis 4-8)
| Nível | Habilidade | Efeito |
|---|---|---|
| 4 | **Segundas Formas** *(combate)* | Aprende Soresu (III) e Djem So (V).  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 5 | **Arremesso Cru** *(combate)* | Atira objetos do ambiente com a Força contra o inimigo. **[2 PE · Dano 2d6 + metade do grau treinado]** |
| 6 | **Leitura Bruta** | Sente intenções hostis próximas, sem a precisão de um Jedi/Sith. **[2 PE · DT 17]** |
| 8 | **Golpe Ampliado** *(combate)* | Soco/chute com força física amplificada pela Força. **[2 PE · Dano 2d6 + metade do grau treinado]** |

### 3º círculo (níveis 9-12)
| Nível | Habilidade | Efeito |
|---|---|---|
| 9 | **Formas Completas** *(combate)* | Aprende Shii-Cho (I), Makashi (II) e Vaapad (VII) — domina as 7 formas.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 10 | **Golpe Duplo Instintivo** *(combate)* | Dois ataques corpo a corpo em sequência rápida. **[2 PE · Dano 3d6 + metade do grau treinado]** |
| 11 | **Barreira Improvisada** | Proteção instável com a Força, sem controle refinado. **[2 PE · DT 19]** |
| 12 | **Investida Selvagem** *(combate)* | Avanço com impacto de Força bruta no golpe final. **[2 PE · Dano 3d6 + metade do grau treinado]** |

### 4º círculo (níveis 13-16)
| Nível | Habilidade | Efeito |
|---|---|---|
| 13 | **Domínio: Niman** *(combate)* | Niman vira forma dominante — alterna estilos de forma imprevisível.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 14 | **Domínio: Djem So** *(combate)* | Djem So vira forma dominante — contra-ataque bruto e direto.  **[SABRE — dano sempre pela arma: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz, não pela escala do círculo]** |
| 15 | **Absorção de Impacto** | Reduz dano de ataques físicos e de energia usando a Força instintivamente. **[3 PE · DT 21]** |
| 16 | **Arremesso Devastador** *(combate)* | Lança um objeto pesado ou o próprio inimigo com força bruta. **[3 PE · Dano 4d6 + metade do grau treinado]** |

### 5º círculo (níveis 17-20)
| Nível | Habilidade | Efeito |
|---|---|---|
| 17 | **Especialização de Forma** *(igual nas 3 classes)* | Escolhe 1 das 7 formas aprendidas como especialidade — bônus permanente de dano/defesa com ela. **[3 PE · DT 23]** |
| 18 | **Golpe Imparável** *(combate)* | Sequência de ataques corpo a corpo amplificados sem padrão previsível. **[3 PE · Dano 5d6 + metade do grau treinado]** |
| 19 | **Eco da Força** | Sente combates e presenças a grande distância. **[3 PE · DT 23]** |
| 20 | **Fúria Desperta** *(combate)* | Ataque final onde corpo e Força bruta se fundem num só golpe devastador. **[3 PE · Dano 5d6 + metade do grau treinado]** |

### Marcos de combate
| Nível | Habilidade | Efeito |
|---|---|---|
| 25 | **Domínio Absoluto** *(igual nas 3, aplica à forma escolhida no 5º círculo)* | Maestria completa na forma especialista — reação quase automática nela. **[4 PE · DT 26]** |
| 25 | **Instinto Predatório Total** | Percepção quase onisciente de ameaças próximas, mesmo fora do campo de visão. **[4 PE · DT 26]** |
| 30 | **Despertar Latente** | Sinal claro de que o potencial bruto amadureceu — abre caminho para se tornar **Xamã da Força** ao completar o nível 30. **[4 PE · DT 27]** |
| 30 | **Fúria da Terra** *(combate)* | Libera uma onda de Força bruta em área ao redor, sem refinamento mas devastadora. **[4 PE · Dano 8d6 + metade do grau treinado]** |
| 35 | **Fúria Sem Controle** *(combate)* | Poder bruto cresce a cada golpe recebido ou desferido. **[5 PE · Dano 9d6 + metade do grau treinado]** |
| 35 | **Corpo Inquebrável** | Resistência extrema a dano físico e efeitos debilitantes por tempo curto. **[5 PE · DT 29]** |
| 40 | **Golpe do Destino** *(combate)* | Ataque guiado por puro instinto que atinge o ponto mais vulnerável do alvo. **[5 PE · Dano 10d6 + metade do grau treinado]** |
| 40 | **Eco Ancestral** | Canaliza a força de andarilhos que vieram antes dele, num impulso de percepção e poder. **[5 PE · DT 30]** |
| 50 | **Lenda Sem Nome** *(combate)* | Luta com poder equivalente a um mestre treinado, mas de forma completamente instintiva. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| 50 | **Vontade Selvagem** | Recupera-se de qualquer efeito negativo instantaneamente, por pura força de vontade. **[6 PE · DT 32]** |
| 99 | **Despertar Total** | Libera toda a Força latente acumulada a vida inteira num único ataque devastador. **[8 PE · DT 36]** |

---

## 22. Classes avançadas — regra de progressão

As 3 classes avançadas **substituem** a classe base a partir do nível 30 (quem vira **O Lado da Luz** deixa de evoluir como Padawan Jedi, e assim por diante). Isso significa: os marcos 35/40/50/99 da classe base só valem pra quem **não** avança — quem assume a classe avançada segue a progressão própria dela a partir daqui.

Estrutura das 3 (todas iguais): já que são "quase inteiramente poderes da Força" (regra fixada acima), abandonam o formato de círculos/combate físico das outras classes e passam a uma progressão de **graus**, com **2 habilidades por grau** (exceto o Ápice, que é única):

| Grau | Nível |
|---|---|
| 1º Grau | 30 (herdado do momento de transição) |
| 2º Grau | 40 |
| 3º Grau | 50 |
| 4º Grau | 70 |
| Ápice | 99 |

---

## 23. O Lado da Luz

**Função:** o Padawan que atravessou o limiar — deixa o treinamento de aprendiz para trás e se torna um canal quase puro do Lado da Luz. Poucos golpes de sabre novos; o poder agora vem quase todo da Força.

### 1º Grau (nível 30)
| Habilidade | Efeito |
|---|---|
| **Visão do Caminho** | Enxerga possibilidades e consequências próximas de uma decisão ou ação em combate — bônus de iniciativa/precisão baseado em premonição. **[4 PE · DT 27]** |
| **Cura da Força** *(combate/suporte)* | Canaliza a Força para restaurar vitalidade própria ou de um aliado em pleno combate. **[4 PE · Cura 8d6]** |

### 2º Grau (nível 40)
| Habilidade | Efeito |
|---|---|
| **Escudo de Luz Absoluto** *(combate)* | Bloqueia quase todo dano físico e de energia por um curto período. **[5 PE · Dano 10d6 + metade do grau treinado]** |
| **Compaixão Curativa** | Cura em área — todos os aliados próximos recuperam vitalidade. **[5 PE · DT 30]** |

### 3º Grau (nível 50)
| Habilidade | Efeito |
|---|---|
| **Batalha Serena** *(combate)* | Entra em estado onde cada ataque recebido é lido com clareza total, convertendo-se em contra-ataque quase perfeito. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| **Voz da Unidade** | Dobra a vontade de um alvo fraco sem violência — persuasão da Força (canon: Force persuasion/mind trick avançado). **[6 PE · DT 32]** |

### 4º Grau (nível 70)
| Habilidade | Efeito |
|---|---|
| **Projeção da Força** *(combate)* | Projeta uma imagem de si mesmo, feita de luz pura, que ataca à distância como extensão de si (canon/Legends: Force projection). **[7 PE · Dano 15d6 + metade do grau treinado]** |
| **Barreira Inabalável** *(combate)* | Protege todo o grupo com um campo de luz que também revida contra quem o atravessa. **[7 PE · Dano 15d6 + metade do grau treinado]** |

### Ápice (nível 99)
| Habilidade | Efeito |
|---|---|
| **Ascensão da Luz** | Torna-se um com a Força por um instante — unifica cura, proteção e ofensiva num só efeito capaz de salvar o grupo e devastar o Lado Sombrio simultaneamente. **[8 PE · DT 36]** |

---

## 24. O Lado Negro

**Função:** o Acólito que abraçou por completo o Lado Sombrio — abandona qualquer contenção e se torna um instrumento quase puro de destruição pela Força.

### 1º Grau (nível 30)
| Habilidade | Efeito |
|---|---|
| **Visão da Dominação** | Enxerga instantaneamente a fraqueza física, emocional ou tática de qualquer alvo. **[4 PE · DT 27]** |
| **Toque da Morte** *(combate)* | Drena grande quantidade de vida do alvo com um único toque ou golpe. **[4 PE · Dano 8d6 + metade do grau treinado]** |

### 2º Grau (nível 40)
| Habilidade | Efeito |
|---|---|
| **Tempestade de Relâmpagos** *(combate)* | Descarga elétrica de Força em área, causando dano severo e contínuo (canon: Force Storm/Chain Lightning). **[5 PE · Dano 10d6 + metade do grau treinado]** |
| **Corrupção Absoluta** | Enfraquece e corrompe um grupo inteiro de inimigos, reduzindo sua capacidade de reação. **[5 PE · DT 30]** |

### 3º Grau (nível 50)
| Habilidade | Efeito |
|---|---|
| **Fúria Sem Limites** *(combate)* | Cada ferimento recebido aumenta drasticamente o dano do próximo ataque. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| **Domínio da Vontade** | Controla a mente de um alvo mais fraco por um curto período (canon/Legends: Force domination). **[6 PE · DT 32]** |

### 4º Grau (nível 70)
| Habilidade | Efeito |
|---|---|
| **Aniquilação** *(combate)* | Ataque de área que combina relâmpago e drenagem de vida, devastador contra múltiplos alvos. **[7 PE · Dano 15d6 + metade do grau treinado]** |
| **Presença Absoluta** | Aura de terror que paralisa vários inimigos simultaneamente. **[7 PE · DT 34]** |

### Ápice (nível 99)
| Habilidade | Efeito |
|---|---|
| **Império das Trevas** | Desperta um poder quase equivalente a um Lorde Sith completo — capaz de decidir uma guerra com um único ato de destruição. **[8 PE · DT 36]** |

---

## 25. Xamã da Força

**Função:** o Andarilho que aprofundou sua conexão instintiva — abandona parte da luta física em favor de tradições místicas fora das ordens Jedi e Sith, canalizando a Força de forma crua e ancestral.

### 1º Grau (nível 30)
| Habilidade | Efeito |
|---|---|
| **Comunhão com a Força** | Percebe o fluxo da Força em tudo ao redor, sem doutrina — sente ameaças, energia e vida numa área ampla. **[4 PE · DT 27]** |
| **Cura Instintiva** *(combate/suporte)* | Cura bruta e imediata, menos refinada que a de um Jedi, mas rápida e eficaz sob pressão. **[4 PE · Cura 8d6]** |

### 2º Grau (nível 40)
| Habilidade | Efeito |
|---|---|
| **Fúria dos Espíritos** *(combate)* | Invoca ecos de andarilhos e xamãs antigos para golpear o inimigo junto com ele. **[5 PE · Dano 10d6 + metade do grau treinado]** |
| **Equilíbrio Selvagem** | Absorve e resiste tanto dano físico quanto dano da Força simultaneamente. **[5 PE · DT 30]** |

### 3º Grau (nível 50)
| Habilidade | Efeito |
|---|---|
| **Transe de Batalha** *(combate)* | Estado onde ataques físicos e da Força se fundem de forma imprevisível, difícil de antecipar. **[6 PE · Dano 12d6 + metade do grau treinado]** |
| **Voz da Natureza** | Comanda criaturas e elementos do ambiente para auxiliar em combate ou exploração. **[6 PE · DT 32]** |

### 4º Grau (nível 70)
| Habilidade | Efeito |
|---|---|
| **Tempestade Ancestral** *(combate)* | Libera uma área devastadora combinando fúria bruta e Força pura, sem refinamento mas de altíssimo impacto. **[7 PE · Dano 15d6 + metade do grau treinado]** |
| **Vínculo Primordial** | Conexão tão profunda com a Força que nada consegue pegá-lo de surpresa. **[7 PE · DT 34]** |

### Ápice (nível 99)
| Habilidade | Efeito |
|---|---|
| **O Todo e o Nada** | Funde-se completamente com a Força, sem doutrina de Luz ou Sombra, desencadeando um poder bruto e puro capaz de decidir qualquer confronto. **[8 PE · DT 36]** |

---

# Parte 2 — Poderes Gerais


Poderes Gerais são habilidades universais — **qualquer personagem, de qualquer classe ou espécie, pode usá-los**. Diferente das habilidades de classe ([Parte 1](#parte-1--poderes-de-classe)), não exigem ligação com uma classe específica.

### Índice
1. [Pontos de Poder (PP)](#1-pontos-de-poder-pp)
2. [Regra de sustentação](#2-regra-de-sustentação)
3. [Limite de PP por turno](#3-limite-de-pp-por-turno)
4. [Poderes Gerais básicos](#4-poderes-gerais-básicos)
5. [Poderes Gerais avançados](#5-poderes-gerais-avançados)

---

## 1. Pontos de Poder (PP)

PP é um recurso à parte de PV e PE, usado só pra ativar Poderes Gerais.

```
PP nível 1 = 2 + PRE + modificador da classe
PP por nível seguinte = +1 + PRE
```

### Modificador de PP por classe

| Mod. | Classes |
|---|---|
| **+0** | Mandaloriano, Soldado da República, Padawan Jedi, Acólito Sith, O Lado da Luz, O Lado Negro |
| **+1** | Mercenário, Pirata Espacial, Guarda Planetário, Vigilante, Caçador de Recompensas, Explorador, Piloto, Médico, Andarilho da Força, Xamã da Força |
| **+2** | Engenheiro, Contrabandista, Comerciante, Diplomata, Arqueólogo, Cientista |
| **+3** | Espião |

Lógica: quem já tem kit de combate forte ou PE próprio pros seus poderes (Marcial puro, classes ligadas à Força) precisa menos de Poderes Gerais → mod baixo. Quem sobrevive de versatilidade e improviso (Espião, Engenheiro, Diplomata etc.) ganha mais PP.

---

## 2. Regra de sustentação

Todo Poder Geral se encaixa numa de duas categorias:

- **Instantâneo:** paga o custo listado uma vez, o efeito acontece e acaba. Sem manutenção.
- **Sustentado:** paga o custo listado pra ativar, mais **1 PP a cada turno seguinte** que o jogador quiser manter o efeito ativo. Se não pagar num turno, o efeito termina imediatamente (sem penalidade, só acaba).

---

## 3. Limite de PP por turno

```
PP máximo gasto por turno = 3 + (nível atual ÷ 2, arredondado pra cima)
```

| Nível | PP máx/turno |
|---|---|
| 1 | 4 |
| 5 | 6 |
| 10 | 8 |
| 20 | 13 |
| 30 | 18 |
| 50 | 28 |
| 99 | 53 |

A manutenção de sustentados (1 PP/turno cada) entra nessa conta do turno, junto com qualquer ativação nova.

---

## 4. Poderes Gerais básicos

Sem pré-requisito — qualquer personagem pode usar desde o nível 1.

| Poder | Custo | Tipo | Efeito |
|---|---|---|---|
| **Fôlego Extra** | 1 PP | Instantâneo | Recupera uma quantidade pequena de PV numa pausa curta, mesmo em cena de tensão. |
| **Reflexos Rápidos** | 1 PP | Instantâneo | Age antes de todos na ordem de iniciativa da cena atual. |
| **Instinto de Sobrevivência** | 2 PP | Instantâneo | Evita completamente um ataque ou perigo iminente, sem precisar de teste. |
| **Foco Absoluto** | 1 PP | Instantâneo | Bônus grande num único teste de perícia antes de rolar. |
| **Segunda Chance** | 2 PP | Instantâneo | Rerola um teste que acabou de falhar. |
| **Adaptação Rápida** | 1 PP | Sustentado | Ganha treino temporário numa perícia não treinada, enquanto mantido. |
| **Vontade Inabalável** | 2 PP | Instantâneo | Resiste automaticamente a um efeito de medo, coerção ou controle mental. |
| **Ação Extra** | 3 PP | Instantâneo | Ganha uma ação adicional no turno atual. |
| **Golpe Certeiro** | 2 PP | Instantâneo | O próximo ataque não pode errar. |
| **Resistência Súbita** | 2 PP | Instantâneo | Reduz drasticamente o dano de um único ataque recebido, antes de aplicado. |
| **Tolerância** | 1 PP | Sustentado | Ignora uma penalidade de condição (ferido, fatigado, intoxicado etc.) enquanto mantido. |
| **Camaleão Social** | 1 PP | Sustentado | Passa despercebido ou comum numa situação social, enquanto mantido. |
| **Faro Aguçado** | 1 PP | Instantâneo | Detecta algo escondido ou um perigo próximo automaticamente. |
| **Improviso** | 2 PP | Instantâneo | Transforma qualquer objeto comum em ferramenta ou arma eficaz temporária. |
| **Recuperação Rápida** | 3 PP | Instantâneo | Recupera uma quantidade considerável de PV instantaneamente em pleno combate. |
| **Presença Marcante** | 1 PP | Instantâneo | Vantagem imediata e garantida numa interação social importante. |
| **Última Reserva** | 3 PP | Instantâneo | Quando cairia a 0 PV, se mantém de pé com 1 PV em vez disso. |
| **Leitura de Combate** | 1 PP | Instantâneo | Prevê a próxima ação de um inimigo antes que ela aconteça. |

---

## 5. Poderes Gerais avançados

Exigem pré-requisito (nível mínimo, atributo mínimo, ou perícia treinada) — mais caros e mais fortes que os básicos.

| Poder | Custo | Tipo | Pré-requisito | Efeito |
|---|---|---|---|---|
| **Fantasma Furtivo** | 3 PP | Sustentado | Furtividade treinada | Invisibilidade parcial a sensores e olhos. |
| **Mente Eidética** | 3 PP | Instantâneo | Nível 5 | Reconstrói perfeitamente uma cena ou memória inteira. |
| **Precisão Absoluta** | 3 PP | Instantâneo | AGI ou INT mín. 3 | Próximo teste manual não pode resultar abaixo do quase-máximo. |
| **Presciência de Combate** | 4 PP | Instantâneo | Nível 10 | Prevê as próximas 2 ações do inimigo antes de acontecerem. |
| **Fortaleza Mental** | 4 PP | Sustentado | PRE mín. 3 | Imunidade total a efeitos mentais e da Força. |
| **Salto Perfeito** | 3 PP | Instantâneo | — | Realiza acrobacia ou salto extremo impossível normalmente, sem risco. |
| **Mestre da Barganha** | 3 PP | Instantâneo | Diplomacia ou Persuasão treinada | Vira completamente a posição de um NPC importante a seu favor. |
| **Transcender o Corpo** | 4 PP | Sustentado | — | Ignora qualquer penalidade física (fadiga, dor, ferimento). |
| **Retribuição Instantânea** | 4 PP | Instantâneo | Nível 8 | Revida com dano dobrado assim que é atingido. |
| **Tiro Impossível** | 4 PP | Instantâneo | Pontaria treinada | Acerta um alvo mesmo sem linha de visão direta. |
| **Máscara Completa** | 4 PP | Sustentado | Enganação treinada | Engana até sensores biométricos. |
| **Improviso Blindado** | 3 PP | Instantâneo | — | Cria proteção equivalente a armadura pesada com qualquer objeto. |
| **Golpe Perfurante Absoluto** | 4 PP | Instantâneo | Nível 10 | Ignora toda armadura, resistência ou escudo do alvo num único ataque. |
| **Serenidade Total** | 3 PP | Sustentado | — | Imune a pânico, medo e efeitos de moral. |
| **Instinto Predatório** | 3 PP | Instantâneo | — | Evita e revida automaticamente um ataque de oportunidade. |
| **Sincronia de Grupo** | 4 PP | Sustentado | Nível 8 | Compartilha um bônus de teste com todos os aliados próximos. |
| **Compreensão Total** | 3 PP | Instantâneo | INT mín. 3 | Entende sistema, idioma ou tecnologia desconhecida instantaneamente. |
| **Domínio de Terreno** | 3 PP | Sustentado | — | Ignora qualquer penalidade de terreno, gravidade ou ambiente. |
| **Fúria Multiplicada** | 5 PP | Instantâneo | Nível 12 | Realiza três ataques no mesmo turno. |
| **Precognição de Perigo** | 4 PP | Instantâneo | Percepção treinada | Detecta e neutraliza automaticamente uma armadilha ou emboscada antes de ativar. |
| **Cura da Mente** | 3 PP | Instantâneo | — | Remove todos os efeitos mentais negativos ativos de si ou de um aliado. |
| **Resistência Absoluta** | 3 PP | Sustentado | — | Ignora fome, sede, exaustão e clima extremo enquanto mantido. |
| **Leitura de Alma** | 3 PP | Instantâneo | SEN ou PRE mín. 3 | Sente a intenção verdadeira e o histórico emocional de um alvo. |
| **Esquiva Impossível** | 4 PP | Instantâneo | AGI mín. 3 | Evita completamente qualquer ataque à distância num turno, mesmo múltiplos. |
| **Controle de Cena** | 4 PP | Instantâneo | Nível 10 | Altera um elemento importante do ambiente a seu favor. |
| **Vantagem Absoluta** | 4 PP | Instantâneo | — | Cria uma vantagem tática decisiva usando qualquer elemento do cenário. |
| **Imunidade Momentânea** | 4 PP | Sustentado | — | Imune a veneno, doença e toxinas. |
| **Investida Fatal** | 5 PP | Instantâneo | Nível 12 | Ataque surpresa com dano crítico automático. |
| **Escudo Absoluto** | 4 PP | Sustentado | — | Reduz drasticamente todo dano recebido. |
| **Destino Reescrito** | 5 PP | Instantâneo | Nível 15 | Transforma qualquer falha, mesmo crítica, em sucesso total. |
| **Inquebrável** | 4 PP | Sustentado | — | Imune a intimidação, coação e manipulação social. |
| **Desafiar a Morte** | 5 PP | Instantâneo | Nível 15 | Ignora completamente estar a 0 PV, age normalmente por uma cena inteira. |

**Total: 18 básicos + 32 avançados = 50 Poderes Gerais.**
