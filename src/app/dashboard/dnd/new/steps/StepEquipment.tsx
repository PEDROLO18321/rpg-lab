"use client";

import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";

interface Props {
  classId:      string | null;
  backgroundId: string | null;
}

export function StepEquipment({ classId, backgroundId }: Props) {
  const cls = CLASSES.find((c) => c.id === classId);
  const bg  = BACKGROUNDS.find((b) => b.id === backgroundId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 6 · Equipamento
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          Equipamento <span className="text-gold">Inicial</span>
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Seu equipamento de partida vem da combinação de sua classe e antecedente. Como alternativa,
          você pode começar com moedas de ouro e comprar seus próprios itens.
        </p>
      </div>

      {/* Class equipment */}
      {cls ? (
        <EquipmentBlock
          icon={cls.icon}
          title={`Equipamento da Classe — ${cls.name}`}
          items={cls.startingEquipment}
          accent
        />
      ) : (
        <EmptyBlock label="Nenhuma classe selecionada" />
      )}

      {/* Background equipment */}
      {bg ? (
        <EquipmentBlock
          icon={bg.icon}
          title={`Equipamento do Antecedente — ${bg.name}`}
          items={bg.startingEquipment}
        />
      ) : (
        <EmptyBlock label="Nenhum antecedente selecionado" />
      )}

      {/* Starting gold alternative */}
      {cls && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "22px 24px",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Alternativa — Riqueza Inicial
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Em vez de receber o equipamento listado acima, um {cls.name} pode começar com{" "}
            <span
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontWeight: 700,
                color: "var(--accent-light)",
                fontSize: "0.95rem",
              }}
            >
              {cls.startingGold}
            </span>{" "}
            para comprar seu próprio equipamento.
          </p>
        </div>
      )}

      {/* Note */}
      <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.6, fontStyle: "italic" }}>
        O equipamento detalhado ficará registrado na ficha do personagem após a criação. As listas acima
        refletem as opções canônicas do D&amp;D 5e — você poderá ajustar na ficha depois.
      </p>
    </div>
  );
}

/* ── helpers ── */

function EquipmentBlock({
  icon,
  title,
  items,
  accent,
}: {
  icon:    string;
  title:   string;
  items:   string[];
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-lg)",
            background: accent ? "var(--accent-dim)" : "var(--surface-2)",
            border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <p
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.88rem",
            fontWeight: 700,
            color: accent ? "var(--accent-light)" : "var(--text)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span
              style={{
                color: accent ? "var(--accent)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.8rem",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              •
            </span>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        textAlign: "center",
        color: "var(--text-subtle)",
        fontSize: "0.82rem",
      }}
    >
      {label}
    </div>
  );
}
