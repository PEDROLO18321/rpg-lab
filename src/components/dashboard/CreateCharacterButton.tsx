"use client";

import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

export function CreateCharacterButton({ href, label }: Props) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
        color: "#06090f",
        border: "none",
        borderRadius: "var(--radius)",
        fontSize: "0.86rem",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 0 20px var(--accent-glow)",
        transition: "filter 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
    >
      {label}
    </Link>
  );
}
