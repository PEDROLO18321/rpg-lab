// Remonta a cada navegação → dispara a animação de entrada da página.
// Fade por opacidade apenas (sem transform) para não criar containing block
// e deslocar elementos position:fixed/sticky durante a transição.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
