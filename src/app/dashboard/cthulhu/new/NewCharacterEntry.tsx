"use client";

import { useState } from "react";
import { CthulhuWizard } from "./CthulhuWizard";
import { AutoGenerateForm } from "./AutoGenerateForm";
import { ImportJsonForm } from "@/components/dashboard/ImportJsonForm";

interface Props {
  userId: string;
  systemId: string;
}

const ACCENT_LIGHT = "#a3b86c";

const MODES = [
  {
    id: "manual" as const,
    label: "Deixe-me Criar",
    subtitle: "Fluxo Completo",
    desc: "Construa seu investigador do zero, com acesso total a todas as etapas: atributos, ocupação, perícias, antecedentes e equipamento.",
    cta: "Começar do Zero",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
  },
  {
    id: "auto" as const,
    label: "Crie Para Mim",
    subtitle: "Geração Automática",
    desc: "Informe (opcionalmente) o nome e a ocupação — o sistema sorteia atributos, perícias, antecedentes e equipamento, seguindo as regras de Call of Cthulhu.",
    cta: "Gerar Automaticamente",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3v4"/><path d="M3 5h4"/>
        <path d="M19 17v4"/><path d="M17 19h4"/>
        <path d="m13 3 2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3Z"/>
      </svg>
    ),
  },
  {
    id: "import" as const,
    label: "Importar JSON",
    subtitle: "Trazer de Fora",
    desc: "Já tem uma ficha de Call of Cthulhu exportada deste site em outro lugar? Envie o arquivo .json e importe o investigador completo.",
    cta: "Escolher Arquivo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>
      </svg>
    ),
  },
];

export function NewCharacterEntry({ userId, systemId }: Props) {
  const [mode, setMode] = useState<"choice" | "manual" | "auto" | "import">("choice");
  const [hovered, setHovered] = useState<string | null>(null);

  if (mode === "manual") return <CthulhuWizard userId={userId} systemId={systemId} />;
  if (mode === "auto") return <AutoGenerateForm systemId={systemId} onBack={() => setMode("choice")} />;
  if (mode === "import")
    return (
      <ImportJsonForm
        systemId={systemId}
        systemLabel="Call of Cthulhu"
        expectedFormat="rpglab.cthulhu.v1"
        importUrl="/api/cthulhu/characters/import"
        redirectBase="/dashboard/cthulhu"
        accent={ACCENT_LIGHT}
        onBack={() => setMode("choice")}
      />
    );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 12 }}>Call of Cthulhu</span>
        <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--text)" }}>
          Como você quer <span style={{ color: ACCENT_LIGHT }}>criar</span> seu investigador?
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 680, width: "100%" }}>
        {MODES.map((m) => {
          const isHovered = hovered === m.id;
          return (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => setMode(m.id)}
              onKeyDown={(e) => e.key === "Enter" && setMode(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                padding: "32px 28px 28px",
                display: "flex",
                flexDirection: "column",
                background: isHovered
                  ? "linear-gradient(135deg, rgba(125,156,62,0.1) 0%, rgba(125,156,62,0.03) 100%)"
                  : "var(--surface)",
                border: `1px solid ${isHovered ? "rgba(125,156,62,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius-xl)",
                boxShadow: isHovered
                  ? "0 20px 56px rgba(0,0,0,0.5), 0 0 32px rgba(125,156,62,0.22)"
                  : "0 4px 20px rgba(0,0,0,0.3)",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: "var(--radius-lg)",
                  background: isHovered ? "rgba(125,156,62,0.13)" : "var(--surface-2)",
                  border: `1px solid ${isHovered ? "rgba(125,156,62,0.4)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isHovered ? ACCENT_LIGHT : "var(--text-muted)",
                  marginBottom: 20, transition: "all 0.22s",
                }}
              >
                {m.icon}
              </div>

              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: isHovered ? ACCENT_LIGHT : "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, transition: "color 0.2s" }}>
                {m.subtitle}
              </p>

              <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>
                {m.label}
              </h2>

              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24, flex: 1 }}>
                {m.desc}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", fontWeight: 700, color: isHovered ? ACCENT_LIGHT : "var(--text-muted)", transition: "color 0.2s" }}>
                {m.cta}
                <span style={{ display: "inline-block", transition: "transform 0.2s", transform: isHovered ? "translateX(5px)" : "translateX(0)" }}>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
