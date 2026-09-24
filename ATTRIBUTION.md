# Atribuição de conteúdo

O código do RPG Lab é licenciado sob MIT (ver [LICENSE](LICENSE)). O **conteúdo
de regras** transcrito em `src/lib/<sistema>/` tem origem própria por sistema, e
este documento registra cada uma delas.

Princípio adotado em todo o repositório: **transcreve-se conteúdo mecânico**
— valores, fórmulas, tabelas e a descrição funcional de um efeito —, nunca a
prosa literária que acompanha as regras nos livros. Os livros usados como
referência durante o desenvolvimento não são versionados (ver `.gitignore`).

---

## Dungeons & Dragons 5e — SRD 5.1, CC BY 4.0

> This work includes material taken from the System Reference Document 5.1
> ("SRD 5.1") by Wizards of the Coast LLC and available at
> https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is
> licensed under the Creative Commons Attribution 4.0 International License
> available at https://creativecommons.org/licenses/by/4.0/legalcode.

Arquivos derivados do SRD 5.1: `src/lib/dnd/races.ts`, `classes.ts`,
`backgrounds.ts`, `spells.ts`, `monsters.ts`, `items.ts`, `equipmentData.ts`,
`conditions.ts`, `leveling.ts`.

Nada fora do SRD 5.1 é reproduzido — subclasses, magias e monstros exclusivos
dos livros fechados (*Player's Handbook*, *Xanathar's*, *Tasha's*) não constam.

## Tormenta 20 — conteúdo aberto da Jambô Editora

Regras e listas transcritas do conteúdo aberto publicado pela Jambô Editora.
Arquivos: `src/lib/tormenta/` (raças, classes, origens, magias, poderes,
condições, itens) e `officialBestiary.json`.

O bestiário guarda o **bloco de estatísticas** de cada criatura — ND, tamanho,
alinhamento, iniciativa, sentidos, CA, PV, resistências, deslocamento, ataques,
atributos, perícias, habilidades especiais e tesouro. O texto descritivo que
acompanha cada verbete no livro (prosa ambiental e citações de personagem) foi
**removido** e não é distribuído.

Tormenta 20 é marca registrada da Jambô Editora. Este trabalho não é afiliado
nem endossado pela editora.

## Ordem Paranormal

Apenas os elementos mecânicos necessários ao preenchimento da ficha: progressão
por NEX, perícias, atributos, rituais (custo, círculo, elemento e efeito),
condições e itens. Uso acadêmico, sem fins lucrativos e sem distribuição
comercial.

O bestiário (`src/lib/ordem/bestiary.ts`) traz, além do bloco de estatísticas,
um campo `description` de uma ou duas frases por criatura. São **resumos
escritos com palavras próprias** — aparência e origem em forma condensada, para
o Mestre identificar a ameaça na tela —, não transcrição do texto do livro.

Ordem Paranormal RPG é obra de Rafael Lange (Cellbit) e da Jambô Editora. Este
trabalho não é afiliado nem endossado por eles.

## Call of Cthulhu 7e

Apenas os elementos mecânicos necessários ao preenchimento da ficha: atributos e
derivados, tabela de perícias, níveis de sucesso, dados de bônus e penalidade,
sanidade e fase de desenvolvimento. Uso acadêmico, sem fins lucrativos.

Call of Cthulhu é marca registrada da Chaosium Inc. Este trabalho não é afiliado
nem endossado pela Chaosium.

## Star Wars: Além da Fronteira — autoral

Sistema de regras de autoria própria, criado para este trabalho; as regras
completas estão em `StarWars-Teste/`. Nenhuma regra de sistema comercial de
Star Wars foi transcrita.

Star Wars é marca registrada da Lucasfilm Ltd. O uso do cenário aqui é
referencial e não comercial; o sistema de regras não é produto licenciado.

---

## Como relatar um problema de atribuição

Se você é titular de direitos e identificou conteúdo que não deveria estar
distribuído aqui, abra uma issue no repositório: o conteúdo é removido sem
discussão.
