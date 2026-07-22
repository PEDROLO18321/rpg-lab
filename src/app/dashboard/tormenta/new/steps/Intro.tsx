export function Intro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 620 }}>{text}</p>
    </div>
  );
}
