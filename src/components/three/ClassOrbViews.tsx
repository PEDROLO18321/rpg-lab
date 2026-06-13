"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { makeDiceGeometry } from "./diceGeometry";

/**
 * Orbes dos cards de classe: TODOS os cards mostram a mesma esfera 3D
 * facetada que finaliza o passo de raça ("essência que tomou forma").
 * Ao selecionar, a esfera encolhe enquanto o dado de vida (d6–d12) cresce
 * girando rápido e assenta. Deselecionar reverte suavemente.
 *
 * Para não esgotar o limite de contextos WebGL do browser (~8-16/aba),
 * os 12 cards compartilham UM único canvas fixo (drei <View>): cada card
 * monta um <ClassOrbView> (div rastreado) e o <ClassOrbsStage> renderiza
 * as cenas via <View.Port> com scissor — 1 contexto WebGL na grade toda.
 *
 * Importe apenas via ClassOrb.tsx (dynamic, ssr off, tier-gated).
 */

function OrbDieRig({
  sides,
  selected,
  hovered,
  seed,
}: {
  sides: number;
  selected: boolean;
  hovered: boolean;
  seed: number;
}) {
  const sphere = useRef<THREE.Mesh>(null);
  const die = useRef<THREE.Mesh>(null);
  const morph = useRef(0); // 0 = esfera · 1 = dado (suavizado)

  // Mesma esfera facetada do passo de raça assentado (icosaedro detail 3)
  const sphereGeo = useMemo(() => new THREE.IcosahedronGeometry(0.8, 3), []);
  const dieGeo = useMemo(() => makeDiceGeometry(sides), [sides]);
  useEffect(() => () => sphereGeo.dispose(), [sphereGeo]);
  useEffect(() => () => dieGeo.dispose(), [dieGeo]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // offset por seed → orbes dos cards não pulsam em sincronia
    const t = state.clock.elapsedTime + seed * 1.37;

    morph.current += ((selected ? 1 : 0) - morph.current) * (1 - Math.pow(0.004, dt));
    const k = morph.current;

    const s = sphere.current;
    if (s) {
      s.visible = k < 0.985;
      const breathe = 1 + Math.sin(t * 1.8) * 0.04;
      s.scale.setScalar(Math.max(0.0001, (1 - k) * breathe));
      s.rotation.y += dt * (hovered ? 1.1 : 0.5);
      s.rotation.x = Math.sin(t * 0.5) * 0.15;
    }

    const d = die.current;
    if (d) {
      d.visible = k > 0.015;
      d.scale.setScalar(Math.max(0.0001, k * 0.78));
      // gira rápido enquanto "se forma", depois assenta em rotação lenta
      d.rotation.y += dt * (0.55 + (1 - k) * 6);
      d.rotation.x += dt * (0.22 + (1 - k) * 3);
    }
  });

  return (
    <>
      <mesh ref={sphere} geometry={sphereGeo}>
        <meshStandardMaterial
          color="#e8b84b"
          emissive="#4a3408"
          metalness={0.5}
          roughness={0.35}
          flatShading
        />
      </mesh>
      <mesh ref={die} geometry={dieGeo} visible={false}>
        <meshStandardMaterial
          color="#e8b84b"
          emissive="#4a3408"
          metalness={0.5}
          roughness={0.32}
          flatShading
        />
      </mesh>
    </>
  );
}

/**
 * Slot de orbe por card: div rastreado pelo drei View. Sem canvas próprio —
 * a cena é desenhada pelo ClassOrbsStage no canvas compartilhado.
 */
export function ClassOrbView({
  sides,
  size,
  selected,
  hovered,
  seed,
}: {
  sides: number;
  size: number;
  selected: boolean;
  hovered: boolean;
  seed: number;
}) {
  return (
    <div aria-hidden style={{ width: size, height: size, pointerEvents: "none", flexShrink: 0 }}>
      <View style={{ width: "100%", height: "100%" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={40} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.3} />
        <pointLight position={[-2, 1, 2]} intensity={0.45} color="#e8b84b" />
        <OrbDieRig sides={sides} selected={selected} hovered={hovered} seed={seed} />
      </View>
    </div>
  );
}

/**
 * Canvas compartilhado da grade de classes. Monte UMA vez por página
 * (junto da grade); todos os <ClassOrbView> desenham nele via View.Port.
 * zIndex 10: acima dos cards, abaixo do header sticky (50) e footer (40).
 */
export function ClassOrbsStage() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <View.Port />
    </Canvas>
  );
}
