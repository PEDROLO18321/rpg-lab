# Reestruturação — Sistema de Pools de Habilidade de Classe

## Status

Rascunho de regras. Números marcados **[TBD]** ainda serão definidos por você. Nada disso foi implementado em código ainda — é só a especificação, pra depois virar as habilidades por classe em `Classes/` e, só então, entrar no código (`leveling.ts` / `levelup/route.ts` / `LevelUpModal.tsx`).

## O que muda

Hoje: 1 habilidade de classe fixa por nível (quando a classe tem alguma cadastrada naquele nível exato).

Novo: em **níveis-chave**, a classe libera um **pool** de habilidades. Diferente de ganhar o pool inteiro de uma vez, o jogador vai **drenando** esse pool nível a nível — a cada nível (até o próximo nível-chave abrir um pool novo), escolhe 1 habilidade entre as que ainda sobraram daquele pool.

Exemplo (valores ilustrativos, não literais):
- Nível 1 abre um pool com 6 habilidades. Escolhe 1 → sobram 5.
- Nível 2: ainda dentro do mesmo pool, escolhe 1 das 5 que sobraram → sobram 4.
- Nível 3, 4, 5: mesma lógica, drenando o que resta do pool.
- Nível 6 (próximo nível-chave): abre um pool novo, que **soma** ao que sobrou do pool anterior — nada se perde, pools nunca fecham (ver seção de parâmetros).

Ou seja, o pool não é "escolha tudo de uma vez no nível-chave" — é aberto no nível-chave e consumido aos poucos, 1 pick por nível, escolhendo entre tudo que ainda não foi pego de qualquer pool já aberto. Conforme o personagem sobe de nível, a quantidade de escolhas por pick também tende a crescer (ex.: mais adiante talvez escolha 2 por nível em vez de 1) — cadência exata ainda **[TBD]**.

## O que NÃO muda (confirmado)

Só a peça "Habilidade de Classe" da escolha obrigatória é trocada. O resto do level-up continua exatamente como está hoje:

- **Nível sem pool**: escolha obrigatória cai no fallback já existente — Perícia (treinar/subir grau) → Atributo (só se toda perícia já em Mestre).
- **Múltiplo de 5**: continua exigindo +1 Perícia extra e +1 Poder Geral, independente de o nível também ser um nível de pool ou não.
- **Múltiplo de 10**: continua exigindo +1 Atributo, junto com o de cima.
- PV/PE/PP continuam subindo todo nível, sem exceção.
- Multiclasse continua evento isolado (habilidade de nível 1 da nova classe + atributo), sem relação com pool.

## Estrutura de um Pool

Cada nível-chave da classe abre um pool novo que **soma** ao conjunto de habilidades ainda disponíveis (pools nunca fecham/expiram):

```
Nível [N] — abre Pool [nome opcional do pool], com X habilidades novas
  Habilidades do pool: [lista de X, cada uma com nome + descrição + custo de PE]
  A cada nível (a partir daqui), o jogador escolhe 1 habilidade dentre TODAS as ainda
  não aprendidas de qualquer pool já aberto (deste ou de pools anteriores).
  Quando o próximo nível-chave chegar, some mais X habilidades novas ao conjunto disponível.
  Quantidade escolhida por pick: [TBD — hoje 1; pode crescer pra 2+ em pools mais altos]
  Pré-requisito interno (alguma habilidade do pool exige ter pego outra do mesmo pool antes)? [TBD — por padrão nenhum]
```

## Parâmetros pendentes de definição

| Parâmetro | Status | Notas |
|---|---|---|
| Níveis-chave (quando um pool novo abre) | **[TBD]** | Seu exemplo: 1, 6, 11, 16... Falta confirmar se vai até o teto de classe (hoje 40) e quantos pools no total. |
| Tamanho de cada pool (quantas habilidades existem pra escolher) | **[TBD]** | O "X" do exemplo (6 no pool do nível 1) — pode crescer nos pools mais altos. |
| Picks por nível dentro do pool aberto | **[TBD]** | Exemplo usa 1 por nível; pode aumentar pra 2+ conforme o personagem sobe (a "quantidade de escolha crescendo" que você mencionou). |
| Pool não totalmente drenado ao abrir o próximo | **Definido: acumula** | Pools nunca fecham. O que sobrou de um pool anterior continua disponível como opção junto com o pool novo — a cada nível, a escolha é entre TODAS as habilidades ainda não pegas de TODOS os pools já abertos até ali (confirmado com Acólito Sith: pool nível 1 tem 10 opções pra só 5 níveis antes do pool 6 abrir — o resto continua valendo depois). |
| Pré-requisito dentro do pool | **[TBD]** | Fica pra depois, por sua decisão. Default enquanto isso: nenhum — todas as opções do pool ficam soltas. |

## Próximo passo

Você define os parâmetros acima (ou classe a classe, se preferir variar). Em paralelo, começamos a escrever as novas habilidades de cada classe normal, uma por vez em ordem alfabética, salvando em `Classes/<Nome da Classe>.md`. Primeira: **Acólito Sith**.
