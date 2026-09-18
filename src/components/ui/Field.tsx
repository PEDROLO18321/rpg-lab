"use client";

// ─── Rótulo ligado ao seu campo ──────────────────────────────────────────────
// O projeto usava `<label>Nome</label><input/>` como irmãos: visualmente certo,
// mas sem associação nenhuma. Um leitor de tela anuncia "campo de edição" sem
// dizer de quê, e clicar no texto não põe o cursor no campo (WCAG 1.3.1 e 4.1.2).
//
// Ligar por id exige que o id seja único *na página*, e muitos desses campos
// aparecem dentro de `.map()`. Por isso o id nasce de `useId()` aqui dentro:
// cada <Field> é uma instância própria, então cada repetição do laço ganha o seu.
//
// O DOM resultante é o mesmo de antes — label e campo continuam irmãos, com os
// mesmos estilos —, só que agora associados.
import { cloneElement, useId, type CSSProperties, type ReactElement, type ReactNode } from "react";

interface Props {
  /** Texto visível do rótulo. */
  label: ReactNode;
  /** O campo. Recebe o `id` gerado; um `id` próprio tem precedência. */
  children: ReactElement<{ id?: string }>;
  /** Estilo do <label>, igual ao que já era usado no lugar. */
  style?: CSSProperties;
  className?: string;
}

export function Field({ label, children, style, className }: Props) {
  const generated = useId();
  const id = children.props.id ?? generated;

  return (
    <>
      <label htmlFor={id} style={style} className={className}>{label}</label>
      {cloneElement(children, { id })}
    </>
  );
}
