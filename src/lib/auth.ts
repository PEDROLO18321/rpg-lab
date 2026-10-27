import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { registraTentativa, limpaTentativas } from "@/lib/rateLimit";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

class ExcessoDeTentativas extends CredentialsSignin {
  code = "too_many_attempts";
}

/** Dez tentativas por email a cada quinze minutos. */
const LIMITE_LOGIN = { max: 10, janelaSeg: 900 };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Emails são gravados em minúsculas no cadastro — normaliza na busca
        // para que a caixa digitada no login não impeça o acesso.
        const email = (credentials.email as string).toLowerCase().trim();

        // Medido antes de existir: 20 senhas erradas seguidas passavam sem um
        // único bloqueio. A chave é o email, não o IP — um ataque distribuído
        // troca de endereço, mas continua mirando a mesma conta.
        const porta = registraTentativa(`login:${email}`, LIMITE_LOGIN);
        if (!porta.permitido) throw new ExcessoDeTentativas();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) throw new InvalidCredentials();

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) throw new InvalidCredentials();

        // Acertou: zera a contagem, senão um usuário que erra nove vezes e
        // acerta na décima continuaria perto do bloqueio pelo resto da janela.
        limpaTentativas(`login:${email}`);
        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
});
