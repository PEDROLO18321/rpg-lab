"use client";

// Tela que o mestre vê ao abrir o link: de quem é a ficha, de qual sistema, e
// em qual campanha dele ela entra. Só aparecem campanhas do mesmo sistema — e o
// servidor recusa de novo se alguém tentar outra.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Target {
  character: { id: string; name: string; portraitUrl: string | null; ownerName: string };
  system: string;
  systemLabel: string;
  campaigns: { id: string; name: string; linked: boolean }[];
}

/** Onde fica o painel do mestre de cada sistema. */
const MASTER_HOME: Record<string, string> = {
  dnd: "/dashboard/dnd/mestre",
  tormenta: "/dashboard/tormenta/mestre",
  cthulhu: "/dashboard/cthulhu/mestre",
  ordem: "/dashboard/ordem/mestre",
  starwars: "/dashboard/starwars/mestre",
};

/** Rota da campanha aberta, que difere de nome entre os sistemas. */
const CAMPAIGN_PATH: Record<string, string> = {
  dnd: "/dashboard/dnd/mestre/campanha",
  tormenta: "/dashboard/tormenta/mestre/campanha",
  cthulhu: "/dashboard/cthulhu/mestre/cenario",
  ordem: "/dashboard/ordem/mestre/operacao",
  starwars: "/dashboard/starwars/mestre/campanha",
};

const card: React.CSSProperties = {
  width: "min(560px, 100%)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: 28,
};

export function LinkSheetClient({ token }: { token: string }) {
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/share/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok) setLoadError(data.error ?? "Link inválido.");
        else setTarget(data);
      })
      .catch(() => { if (alive) setLoadError("Não foi possível abrir o link."); });
    return () => { alive = false; };
  }, [token]);

  async function link() {
    if (!chosen || !target) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: chosen }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Não foi possível vincular a ficha.");
        return;
      }
      router.push(`${CAMPAIGN_PATH[target.system]}/${chosen}`);
    } finally {
      setBusy(false);
    }
  }

  const shell = (children: React.ReactNode) => (
    <main id="conteudo" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={card}>{children}</div>
    </main>
  );

  if (loadError) {
    return shell(
      <>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", color: "var(--text)", marginBottom: 10 }}>
          Link indisponível
        </h1>
        <p role="alert" style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          {loadError}
        </p>
        <Link href="/dashboard" style={{ fontSize: "0.84rem", color: "var(--accent-light)", textDecoration: "none" }}>
          ← Ir para meus sistemas
        </Link>
      </>,
    );
  }

  if (!target) {
    return shell(<p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>Abrindo link…</p>);
  }

  return shell(
    <>
      <span className="section-label" style={{ display: "block", marginBottom: 8 }}>
        {target.systemLabel}
      </span>
      <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        {target.character.name}
      </h1>
      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: 22 }}>
        Ficha de {target.character.ownerName}. Escolha a campanha que vai acompanhá-la.
        Você terá acesso <strong>somente de leitura</strong>.
      </p>

      {target.campaigns.length === 0 ? (
        <>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
            Você ainda não tem nenhuma campanha de <strong>{target.systemLabel}</strong>.
            Crie uma no painel do mestre e volte a abrir este link.
          </p>
          <Link
            href={MASTER_HOME[target.system]}
            style={{
              display: "inline-block", padding: "10px 16px",
              border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)",
              color: "var(--accent-light)", fontSize: "0.84rem", fontWeight: 600, textDecoration: "none",
            }}
          >
            Abrir painel do mestre
          </Link>
        </>
      ) : (
        <>
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px" }}>
            <legend style={{ fontSize: "0.74rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Suas campanhas de {target.systemLabel}
            </legend>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {target.campaigns.map((c) => (
                <label
                  key={c.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px",
                    background: chosen === c.id ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${chosen === c.id ? "var(--border-accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer", fontSize: "0.86rem", color: "var(--text)",
                  }}
                >
                  <input
                    type="radio"
                    name="campanha"
                    value={c.id}
                    checked={chosen === c.id}
                    onChange={() => setChosen(c.id)}
                  />
                  <span style={{ flex: 1 }}>{c.name}</span>
                  {c.linked && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>já vinculada</span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" style={{ fontSize: "0.82rem", color: "#f87171", marginBottom: 14 }}>{error}</p>
          )}

          <button
            onClick={link}
            disabled={!chosen || busy}
            style={{
              width: "100%", padding: "11px 16px",
              background: chosen ? "var(--accent-dim)" : "var(--surface-2)",
              border: `1px solid ${chosen ? "var(--border-accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-lg)",
              color: chosen ? "var(--accent-light)" : "var(--text-subtle)",
              fontSize: "0.86rem", fontWeight: 700,
              cursor: chosen && !busy ? "pointer" : "not-allowed",
            }}
          >
            {busy ? "Vinculando…" : "Vincular à campanha"}
          </button>
        </>
      )}
    </>,
  );
}
