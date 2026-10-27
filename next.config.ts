import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-three/fiber", "@react-three/drei"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Cabeçalhos de segurança. O app não enviava nenhum — verificado pedindo
  // /dashboard e lendo a resposta. Cada um fecha um ataque específico:
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: sem isto, qualquer site pode embutir a ficha num
          // iframe invisível e capturar cliques do jogador.
          { key: "X-Frame-Options", value: "DENY" },
          // Impede o navegador de "adivinhar" o tipo de um arquivo enviado —
          // o retrato de personagem é upload do usuário.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // O caminho da ficha tem o id do personagem; sem política, ele vazava
          // inteiro no Referer ao clicar em qualquer link externo.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // O app não usa câmera, microfone nem localização. Declarar isso
          // impede que um script de terceiro os peça em nome do site.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // HTTPS obrigatório por dois anos, subdomínios inclusos. Só tem
          // efeito em produção; em localhost o navegador ignora.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
