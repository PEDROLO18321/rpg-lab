# RPG Lab

Laboratório digital de fichas de RPG de mesa — TCC que reúne, numa única plataforma, fichas de personagem interativas e áreas de mestre completas para múltiplos sistemas de RPG.

Sistemas suportados atualmente:

- **Dungeons & Dragons** (5ª Edição, revisão de 2014)
- **Tormenta 20**
- **Ordem Paranormal**
- **Call of Cthulhu** (7ª Edição)
- **Star Wars: Além da Fronteira** — sistema autoral, criado para este trabalho

Cada sistema tem duas áreas principais:

- **Jogador** — criação e gerenciamento de fichas de personagem, com cálculos automáticos (atributos, perícias, magias, combate).
- **Mestre** — workspace de campanha: NPCs, bestiário, pistas, relógios de tensão, itens, geradores de conteúdo, agenda de sessões, entre outras ferramentas por sistema.

A criação de ficha oferece três caminhos: **assistente passo a passo**, **geração
automática** (personagem completo e já progredido até o nível escolhido) e
**importação** de uma ficha exportada em JSON.

## Conteúdo dos sistemas e base legal

As regras implementadas foram transcritas como dados tipados em `src/lib/<sistema>/`.
O que está versionado é **conteúdo mecânico** — valores, fórmulas, tabelas e a
descrição funcional de um efeito. Prosa literária dos livros (texto ambiental,
citações de personagem, narrativa de sabor) **não é distribuída**: os campos de
sabor do bestiário de Tormenta 20 foram removidos justamente por isso.

- **D&D 5e** — conteúdo derivado do *System Reference Document 5.1*, publicado pela
  Wizards of the Coast sob licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Tormenta 20** — conteúdo aberto publicado pela Jambô Editora. O bestiário
  (`src/lib/tormenta/officialBestiary.json`) traz o bloco de estatísticas das
  criaturas — ND, atributos, CA, PV, ataques, habilidades especiais — sem o
  texto descritivo que acompanha cada verbete no livro.
- **Ordem Paranormal** e **Call of Cthulhu** — apenas os elementos mecânicos
  necessários ao preenchimento da ficha, em contexto acadêmico e sem fins lucrativos.
- **Star Wars: Além da Fronteira** — sistema autoral; as regras completas estão em
  `StarWars-Teste/` e são de autoria própria.

Os livros de regras usados como referência durante o desenvolvimento **não são
versionados** (ver `.gitignore`).

A atribuição completa, sistema por sistema, está em
**[ATTRIBUTION.md](ATTRIBUTION.md)**. O código é licenciado sob MIT
(**[LICENSE](LICENSE)**).

## Documentação

- **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** — decisões de projeto, modelo de
  dados, fluxo de criação de ficha e a adaptação das regras de cada sistema
  (incluindo o que foi simplificado e por quê).

## Stack

- [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL
- [NextAuth v5](https://authjs.dev) (login por e-mail e senha, hash bcrypt)
- [Three.js](https://threejs.org) / React Three Fiber (fundo 3D imersivo)

## Rodando localmente

### 1. Pré-requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou serviço gerenciado, ex. [Neon](https://neon.tech))

### 2. Instalar dependências

```bash
npm install
```

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `AUTH_SECRET` | Segredo do NextAuth — gerar com `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` — necessário para rodar o build de produção fora da Vercel |

### 4. Banco de dados

```bash
npx prisma migrate dev   # cria as tabelas
npm run seed              # cadastra os cinco sistemas no banco
```

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o cliente Prisma e cria o build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npm run seed` | Cadastra os cinco sistemas no banco (o catálogo de regras vive em `src/lib/`, não no banco) |
| `npm test` | Roda a suíte de testes (Vitest) |
| `npm run test:watch` | Testes em modo observador |
