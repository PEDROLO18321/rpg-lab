"use client";

// Botão do jogador na barra da ficha: gera o link que o mestre usa para puxar
// esta ficha para uma campanha dele. A ficha continua sendo do jogador — o link
// só concede leitura.
import { useEffect, useRef, useState } from "react";

interface ShareState {
  enabled: boolean;
  token: string | null;
  linkedCampaigns: number;
}

const btn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-full)",
  padding: "6px 12px",
  cursor: "pointer",
  color: "var(--text-muted)",
  fontSize: "0.78rem",
  fontWeight: 500,
  transition: "border-color 0.15s, color 0.15s",
};

const action: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text)",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
};

export function ShareSheetButton({ characterId }: { characterId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShareState | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // `reloads` sobe a cada mudança feita pelos botões, refazendo a leitura.
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch(`/api/characters/${characterId}/share`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ShareState | null) => { if (alive && data) setState(data); })
      .catch(() => { if (alive) setError("Não foi possível ler o estado do link."); });
    return () => { alive = false; };
  }, [open, characterId, reloads]);

  // Esc fecha e devolve o foco ao botão que abriu.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        openerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const url = state?.token ? `${window.location.origin}/s/${state.token}` : null;

  async function call(method: "POST" | "DELETE", body?: unknown) {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch(`/api/characters/${characterId}/share`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        setError("Não foi possível atualizar o link. Tente de novo.");
        return;
      }
      setReloads((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("O navegador bloqueou a cópia. Selecione o link e copie manualmente.");
    }
  }

  return (
    <>
      <button
        ref={openerRef}
        className="no-print"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Gerar link para campanha"
        title="Gerar link para campanha"
        style={btn}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
      >
        🔗 Campanha
      </button>

      {open && (
        <div role="presentation"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(3,5,10,0.72)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            tabIndex={-1}
            style={{
              width: "min(520px, 100%)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              outline: "none",
            }}
          >
            <h2
              id="share-dialog-title"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "1.05rem", fontWeight: 700,
                color: "var(--text)", marginBottom: 6,
              }}
            >
              Vincular a uma campanha
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
              Envie este link ao seu mestre. Ele poderá adicionar sua ficha a uma campanha
              dele <strong>do mesmo sistema</strong> e acompanhá-la — <strong>somente leitura</strong>.
              A ficha continua sendo sua.
            </p>

            {!state && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Carregando…</p>}

            {state && !state.enabled && (
              <button onClick={() => call("POST")} disabled={busy} style={{ ...action, width: "100%", borderColor: "var(--border-accent)", color: "var(--accent-light)" }}>
                {busy ? "Gerando…" : "Gerar link para campanha"}
              </button>
            )}

            {state?.enabled && url && (
              <>
                <label htmlFor="share-url" style={{ display: "block", fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Link da ficha
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input
                    id="share-url"
                    readOnly
                    value={url}
                    onFocus={(e) => e.currentTarget.select()}
                    style={{
                      flex: 1, minWidth: 0,
                      padding: "9px 12px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      color: "var(--text)", fontSize: "0.78rem",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  />
                  <button onClick={copy} style={{ ...action, whiteSpace: "nowrap" }}>
                    {copied ? "Copiado ✓" : "Copiar"}
                  </button>
                </div>

                <p aria-live="polite" style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 16 }}>
                  {state.linkedCampaigns === 0
                    ? "Nenhuma campanha vinculada ainda."
                    : `Vinculada a ${state.linkedCampaigns} campanha${state.linkedCampaigns > 1 ? "s" : ""}.`}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => call("POST", { regenerate: true })} disabled={busy} style={action}>
                    Gerar novo link
                  </button>
                  <button onClick={() => call("DELETE")} disabled={busy} style={{ ...action, color: "#f87171" }}>
                    Desativar
                  </button>
                </div>
                <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginTop: 10, lineHeight: 1.6 }}>
                  Gerar um novo link invalida o anterior. Campanhas já vinculadas continuam com acesso —
                  para cortá-las, peça ao mestre ou use “Desativar”.
                </p>
              </>
            )}

            {error && (
              <p role="alert" style={{ fontSize: "0.8rem", color: "#f87171", marginTop: 14 }}>{error}</p>
            )}

            <button
              onClick={() => { setOpen(false); openerRef.current?.focus(); }}
              style={{ ...action, width: "100%", marginTop: 18, background: "transparent", color: "var(--text-muted)" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
