"use client";

// Aba "Fichas de Jogadores" da área do Mestre. Mesma tela nos cinco sistemas:
// o servidor já entrega cada ficha reduzida à forma comum (vitais, atributos,
// estatísticas, perícias). Somente leitura — o único botão que escreve remove o
// vínculo, nunca a ficha do jogador.
import { useEffect, useState } from "react";

interface Vital { label: string; current: number; max: number; temp: number }
interface Attr { label: string; value: number; detail?: string }
interface Stat { label: string; value: string }
interface Skill { name: string; detail: string }

interface PartySheet {
  id: string;
  name: string;
  portraitUrl: string | null;
  ownerName: string;
  linkedAt: string;
  subtitle: string;
  vitals: Vital[];
  attrs: Attr[];
  stats: Stat[];
  skills: Skill[];
  conditions: string[];
  notes: string | null;
}

interface Props {
  system: string;
  campaignId: string;
  /** Cor do sistema, usada nas barras de vitais. */
  accentColor: string;
}

const panel: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: 20,
};

const label: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "var(--text-subtle)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function VitalBar({ vital, accent }: { vital: Vital; accent: string }) {
  const pct = vital.max > 0 ? Math.min(100, Math.max(0, (vital.current / vital.max) * 100)) : 0;
  const text = `${vital.current}/${vital.max}${vital.temp > 0 ? ` (+${vital.temp})` : ""}`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={label}>{vital.label}</span>
        <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 600 }}>{text}</span>
      </div>
      <div
        role="meter"
        aria-label={`${vital.label}: ${text}`}
        aria-valuenow={vital.current}
        aria-valuemin={0}
        aria-valuemax={vital.max}
        style={{ height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: accent, transition: "width 0.2s" }} />
      </div>
    </div>
  );
}

function SheetCard({
  sheet, accent, onUnlink, busy,
}: {
  sheet: PartySheet;
  accent: string;
  onUnlink: (id: string, name: string) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const detailId = `party-detail-${sheet.id}`;

  return (
    <article style={panel}>
      <header style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div
          aria-hidden="true"
          style={{
            width: 46, height: 46, borderRadius: "var(--radius-lg)",
            background: `${accent}22`, border: `1px solid ${accent}55`,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: accent, fontWeight: 700,
          }}
        >
          {sheet.portraitUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={sheet.portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : sheet.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
            {sheet.name}
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{sheet.subtitle}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 4 }}>
            Jogador: {sheet.ownerName}
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailId}
            style={{
              padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", color: "var(--text-muted)", fontSize: "0.76rem",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            {open ? "Ocultar" : "Ver ficha"}
          </button>
          <button
            onClick={() => onUnlink(sheet.id, sheet.name)}
            disabled={busy}
            aria-label={`Remover ${sheet.name} desta campanha`}
            style={{
              padding: "7px 12px", background: "transparent", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", color: "#f87171", fontSize: "0.76rem",
              fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Remover
          </button>
        </div>
      </header>

      {sheet.vitals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginTop: 16 }}>
          {sheet.vitals.map((v) => <VitalBar key={v.label} vital={v} accent={accent} />)}
        </div>
      )}

      {sheet.conditions.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
          {sheet.conditions.map((c) => (
            <span
              key={c}
              style={{
                padding: "3px 9px", borderRadius: 999, fontSize: "0.72rem",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)",
                color: "#fca5a5",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <div id={detailId} hidden={!open} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <section>
          <h4 style={{ ...label, marginBottom: 8 }}>Atributos</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 8 }}>
            {sheet.attrs.map((a) => (
              <div
                key={a.label}
                style={{
                  padding: "9px 10px", background: "var(--surface-2)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{a.label}</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>{a.value}</div>
                {a.detail && <div style={{ fontSize: "0.72rem", color: accent }}>{a.detail}</div>}
              </div>
            ))}
          </div>
        </section>

        {sheet.stats.length > 0 && (
          <section>
            <h4 style={{ ...label, marginBottom: 8 }}>Estatísticas</h4>
            <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, margin: 0 }}>
              {sheet.stats.map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "0.8rem" }}>
                  <dt style={{ color: "var(--text-muted)" }}>{s.label}</dt>
                  <dd style={{ color: "var(--text)", fontWeight: 600, margin: 0 }}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {sheet.skills.length > 0 && (
          <section>
            <h4 style={{ ...label, marginBottom: 8 }}>Perícias ({sheet.skills.length})</h4>
            <ul style={{ display: "flex", gap: 6, flexWrap: "wrap", listStyle: "none", padding: 0, margin: 0 }}>
              {sheet.skills.map((s) => (
                <li
                  key={s.name}
                  style={{
                    padding: "4px 10px", borderRadius: 999, fontSize: "0.74rem",
                    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)",
                  }}
                >
                  {s.name} <span style={{ color: accent }}>{s.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sheet.notes && (
          <section>
            <h4 style={{ ...label, marginBottom: 8 }}>Anotações do jogador</h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {sheet.notes}
            </p>
          </section>
        )}
      </div>
    </article>
  );
}

export function PartyTab({ system, campaignId, accentColor }: Props) {
  const [party, setParty] = useState<PartySheet[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const base = `/api/campaigns/${system}/${campaignId}/party`;

  useEffect(() => {
    let alive = true;
    fetch(base)
      .then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (!alive) return;
        if (ok) setParty(data.party);
        else setError(data.error ?? "Não foi possível carregar as fichas.");
      })
      .catch(() => { if (alive) setError("Não foi possível carregar as fichas."); });
    return () => { alive = false; };
  }, [base]);

  async function unlink(id: string, name: string) {
    if (!confirm(`Remover a ficha de ${name} desta campanha?\n\nA ficha do jogador não é apagada.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`${base}/${id}`, { method: "DELETE" });
      if (!res.ok) { setError("Não foi possível remover a ficha."); return; }
      setParty((prev) => (prev ?? []).filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p role="alert" style={{ fontSize: "0.86rem", color: "#f87171" }}>{error}</p>;
  if (!party) return <p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>Carregando fichas…</p>;

  if (party.length === 0) {
    return (
      <div style={{ ...panel, textAlign: "center", padding: "40px 24px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Nenhuma ficha vinculada ainda
        </h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
          Peça a cada jogador que abra a ficha dele, clique em <strong>🔗 Campanha</strong> e envie
          o link gerado. Ao abrir o link, você escolhe esta campanha e a ficha aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p aria-live="polite" style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
        {party.length} ficha{party.length > 1 ? "s" : ""} vinculada{party.length > 1 ? "s" : ""} · somente leitura
      </p>
      {party.map((sheet) => (
        <SheetCard
          key={sheet.id}
          sheet={sheet}
          accent={accentColor}
          onUnlink={unlink}
          busy={busyId === sheet.id}
        />
      ))}
    </div>
  );
}
