"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Blob dourado em mutação contínua ("tentando tomar forma") para os cards
 * de raça do wizard. Cada card monta um canvas pequeno próprio — elemento
 * normal no fluxo do DOM, então scroll funciona nativamente (sem overlay
 * compartilhado nem rastreamento de retângulos).
 *
 * Estados: idle pulsa devagar · hover agita · selecionado assenta em
 * esfera lisa e brilhante ("tomou forma").
 *
 * Importe apenas via RaceMorph.tsx (dynamic, ssr off, tier-gated).
 */

function MorphBlob({
  detail,
  selected,
  hovered,
  seed,
}: {
  detail: number;
  selected: boolean;
  hovered: boolean;
  seed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const ampRef = useRef(1); // intensidade suavizada (evita salto visual)

  const { geometry, dirs } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(0.62, detail);
    const pos = geometry.attributes.position;
    const dirs = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      dirs[i * 3 + 0] = v.x;
      dirs[i * 3 + 1] = v.y;
      dirs[i * 3 + 2] = v.z;
    }
    return { geometry, dirs };
  }, [detail]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    // offset por seed → blobs dos cards não pulsam em sincronia
    const t = state.clock.elapsedTime + seed * 1.37;

    // selecionado: deformação some → esfera lisa ("tomou forma")
    const targetAmp = selected ? 0.04 : hovered ? 1.5 : 1;
    ampRef.current += (targetAmp - ampRef.current) * (1 - Math.pow(0.005, dt));
    const amp = ampRef.current;
    const spd = 0.7 + amp * 0.45;

    // acessa via ref do mesh (não muta o valor do useMemo diretamente —
    // exigência do React Compiler)
    const geo = m.geometry as THREE.BufferGeometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    // Deslocamento radial por senos contínuos na superfície (função da
    // DIREÇÃO do vértice → vértices duplicados movem igual, sem rachaduras).
    for (let i = 0; i < dirs.length; i += 3) {
      const dx = dirs[i], dy = dirs[i + 1], dz = dirs[i + 2];
      const d1 = dx * 3.1 + dy * 5.7 + dz * 4.3;
      const d2 = dx * 7.3 - dy * 2.9 + dz * 6.1;
      const r =
        0.62 *
        (1 + amp * (0.13 * Math.sin(t * 1.4 * spd + d1 * 2.0) + 0.07 * Math.sin(t * 2.7 * spd + d2 * 1.6)));
      pos[i] = dx * r;
      pos[i + 1] = dy * r;
      pos[i + 2] = dz * r;
    }
    posAttr.needsUpdate = true;
    // flatShading calcula normais por derivada no shader — sem recompute aqui

    m.rotation.y += dt * (0.5 + amp * 0.25);
    m.rotation.x = Math.sin(t * 0.5) * 0.15;
    // respiração sutil
    const s = 1 + Math.sin(t * 1.8) * 0.04;
    m.scale.setScalar(s);
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshStandardMaterial
        color={selected ? "#e8b84b" : "#c9941f"}
        emissive={selected ? "#4a3408" : "#2a1d06"}
        metalness={0.5}
        roughness={0.35}
        flatShading
      />
    </mesh>
  );
}

export default function RaceBlob({
  size,
  detail,
  selected,
  hovered,
  seed,
}: {
  size: number;
  detail: number;
  selected: boolean;
  hovered: boolean;
  seed: number;
}) {
  return (
    <div aria-hidden style={{ width: size, height: size, pointerEvents: "none", flexShrink: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false, depth: false }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.3} />
        <pointLight position={[-2, 1, 2]} intensity={0.45} color="#e8b84b" />
        <MorphBlob detail={detail} selected={selected} hovered={hovered} seed={seed} />
      </Canvas>
    </div>
  );
}
