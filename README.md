# RPG Lab

Laboratório digital de fichas de RPG de mesa — TCC que reúne, numa única plataforma, fichas de personagem interativas e áreas de mestre completas para múltiplos sistemas de RPG.

Sistemas suportados atualmente:

- **Dungeons & Dragons** (5ª Edição)
- **Tormenta 20**
- **Ordem Paranormal**
- **Call of Cthulhu** (7ª Edição)

Cada sistema tem duas áreas principais:

- **Jogador** — criação e gerenciamento de fichas de personagem, com cálculos automáticos (atributos, perícias, magias, combate).
- **Mestre** — workspace de campanha: NPCs, bestiário, pistas, relógios de tensão, itens, geradores de conteúdo, agenda de sessões, entre outras ferramentas por sistema.

## Stack

- [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL
- [NextAuth v5](https://authjs.dev) (credenciais + Google OAuth)
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
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciais OAuth do Google (opcional — só necessário para login com Google) |

### 4. Banco de dados

```bash
npx prisma migrate dev   # cria as tabelas
npm run seed              # popula dados iniciais (sistemas, classes, perícias etc.)
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
| `npm run seed` | Popula o banco com dados iniciais |
