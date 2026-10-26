// ─── Imagem responsiva ───────────────────────────────────────────────────────
// Nasceu de um defeito medido no cartão de sistema do laboratório: `sizes` em
// pixel fixo quando o CSS redimensiona a moldura. Lá o `sizes="128px"` convivia
// com uma regra que, abaixo de 640px, esticava a moldura para a largura da tela
// — o navegador escolhe o arquivo pelo valor **declarado**, não pelo real, e
// servia 128w para desenhar 320px. Razão fonte/desenhado de 0,40×, nas duas
// densidades.
//
// O defeito existia só abaixo de 640px: em 768 e 1440 a moldura volta aos
// 128×128 do estilo inline e a razão é 1,00×. Por isso ele não aparecia em
// janela grande.
//
// Aqui o `sizes` descreve a largura **em cada faixa de tela**, que é para isso
// que ele existe. O Next usa essa informação para escolher o arquivo certo do
// `srcset`, e o navegador já leva a densidade da tela em conta sozinho.
//
// **Quando NÃO usar este componente:** para miniatura de tamanho fixo que o CSS
// nunca redimensiona — avatar de 44px, ícone de 72px —, `sizes` em pixel é o
// certo, e `<Image>` direto basta. Vale um aviso: ao detectar unidade `vw` no
// `sizes`, o Next descarta do `srcset` os candidatos menores que 33% do menor
// `deviceSize`, ou seja, tudo abaixo de 256w. Usar o padrão daqui numa
// miniatura de 60px faria o celular baixar um arquivo de 256px — nítido, mas
// quatro vezes mais pesado que o necessário.
//
// A proporção entra por `aspect-ratio`. Altura fixa em pixel também reserva
// espaço e não causa pulo; o problema dela é outro — quando a moldura muda de
// forma entre breakpoints, o **recorte** muda junto, e o usuário de celular vê
// uma imagem diferente da do desktop. `aspect-ratio` mantém a mesma proporção
// em qualquer largura.
//
// Proporção diferente por faixa de tela não cabe numa prop: sobrescreva
// `aspect-ratio` pela `className`, na folha responsiva do sistema.

import Image, { type StaticImageData } from "next/image";

interface Props {
  src: StaticImageData | string;
  alt: string;
  /**
   * Proporção da moldura. O padrão é quadrado porque toda a arte do projeto é
   * 1/1 (1080×1080 e 1254×1254) — moldura quadrada sobre arte quadrada recorta
   * zero, e a imagem fica idêntica em qualquer largura de janela.
   */
  proporcao?: string;
  /**
   * Larguras por faixa de tela, no formato do atributo `sizes`. O padrão
   * assume um cartão que ocupa a tela toda no celular, metade no tablet e um
   * terço no desktop — cobre a maior parte dos usos do projeto.
   */
  sizes?: string;
  /** Que parte sobrevive ao recorte. `"center top"` preserva rostos. */
  posicao?: string;
  /** Acima da dobra: carrega com prioridade em vez de preguiçosamente. */
  prioridade?: boolean;
  filtro?: string;
  /** Conteúdo sobreposto: gradiente, selo, cadeado. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Figura({
  src, alt, proporcao = "1 / 1",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  posicao = "center", prioridade, filtro, children, className, style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: proporcao,
        overflow: "hidden",
        background: "var(--surface-2)",
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={prioridade}
        style={{ objectFit: "cover", objectPosition: posicao, filter: filtro }}
      />
      {children}
    </div>
  );
}
