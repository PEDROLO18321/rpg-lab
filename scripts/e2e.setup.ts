// O Next carrega o .env sozinho; o Vitest não. Sem isto o Prisma sobe sem
// DATABASE_URL e falha na autenticação do Postgres.
import "dotenv/config";
