// ─── Esqueleto de carregamento de todo o /dashboard ──────────────────────────
// Um arquivo só cobre as dez rotas: no App Router a fronteira de Suspense criada
// por um `loading.tsx` vale para todo segmento filho que não tenha o seu.
//
// Por que isto existe: sem fronteira de Suspense o Next segura a navegação até o
// payload RSC inteiro chegar, e o clique não produz sinal nenhum — a tela
// anterior fica parada. Os custos que não dá para remover (o Neon dormindo no
// plano grátis, o Turbopack compilando a rota na primeira visita) apareciam como
// tela congelada. Com a fronteira, o servidor manda o esqueleto na hora e faz
// streaming do resto.
//
// O esqueleto é deliberadamente **neutro**: não existe `dashboard/layout.tsx`, a
// `DashboardNav` mora dentro de cada página, então este fallback substitui a tela
// inteira. Usar a cor de um sistema deixaria o Cthulhu piscando verde ao entrar
// no Star Wars.

export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "transparent" }} aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>

      {/* Lugar da DashboardNav */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Bloco w={180} h={18} />
        <Bloco w={120} h={32} r="var(--radius-lg)" />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Lugar do cabeçalho da ficha / título da lista */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 24px",
            marginBottom: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <Bloco w={52} h={52} r="var(--radius-xl)" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Bloco w="45%" h={22} />
            <Bloco w="30%" h={13} />
          </div>
        </div>

        {/* Lugar dos cartões: serve tanto para a grade da lista quanto para as
            seções da ficha, que têm a mesma moldura. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                // Escalona o brilho: a onda atravessa a grade em vez de todos os
                // cartões pulsarem juntos, que parece defeito e não carregamento.
                animationDelay: `${i * 90}ms`,
              }}
            >
              <Bloco w="60%" h={16} />
              <Bloco w="85%" h={11} />
              <Bloco w="40%" h={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Retângulo cinza pulsante. `skeleton-pulse` vive em globals.css. */
function Bloco({
  w, h, r = "var(--radius)",
}: {
  w: number | string;
  h: number;
  r?: string;
}) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width: w, height: h, borderRadius: r, background: "var(--surface-2)" }}
    />
  );
}
