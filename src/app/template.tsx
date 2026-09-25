// Anima a entrada da página. Remonta quando o PRIMEIRO segmento da rota muda —
// não a cada navegação, como dizia o comentário anterior: no Next 16 "navigations
// within deeper segments do not remount higher-level templates". Então andar
// dentro de /dashboard não dispara o fade; entrar nele vindo de / ou /login,
// sim.
//
// Fade por opacidade apenas (sem transform) para não criar containing block e
// deslocar elementos position:fixed/sticky durante a transição.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
