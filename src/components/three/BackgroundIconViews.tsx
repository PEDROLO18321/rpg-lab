"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * Ícones 3D simbólicos dos antecedentes (D&D 5e) — primitivas procedurais
 * douradas, sem assets. Todos os cards exibem seu ícone simultaneamente.
 *
 * Para não esgotar o limite de contextos WebGL do browser (~8-16/aba),
 * TODOS os ícones compartilham UM único canvas fixo (drei <View>): cada
 * card monta um <IconView> (div rastreado) e o <IconsStage> renderiza as
 * cenas via <View.Port> com scissor — 1 contexto WebGL para a grade toda.
 *
 * Importe apenas via BackgroundIcon.tsx (dynamic, ssr off, tier-gated).
 */

function Gold() {
  return (
    <meshStandardMaterial
      color="#c9941f"
      emissive="#2a1d06"
      metalness={0.5}
      roughness={0.35}
      flatShading
    />
  );
}

function Shape({ id }: { id: string }) {
  switch (id) {
    case "acolito": // auréola sobre a cabeça devota
      return (
        <>
          <mesh rotation={[Math.PI / 2.6, 0, 0]} position={[0, 0.42, 0]}>
            <torusGeometry args={[0.4, 0.07, 10, 28]} />
            <Gold />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <icosahedronGeometry args={[0.32, 1]} />
            <Gold />
          </mesh>
        </>
      );

    case "artesao-de-guilda": { // engrenagem do ofício
      const teeth = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        teeth.push(
          <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.2, 0.17, 0.17]} />
            <Gold />
          </mesh>
        );
      }
      return (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.17, 16]} />
            <Gold />
          </mesh>
          {teeth}
        </>
      );
    }

    case "artista": // laço de palco — performático e chamativo
      return (
        <mesh>
          <torusKnotGeometry args={[0.36, 0.11, 64, 10]} />
          <Gold />
        </mesh>
      );

    case "charlatao": // duas moedas — o golpe e o disfarce
      return (
        <>
          <mesh position={[-0.18, 0.1, 0]} rotation={[Math.PI / 2.4, 0, 0.3]}>
            <cylinderGeometry args={[0.32, 0.32, 0.06, 20]} />
            <Gold />
          </mesh>
          <mesh position={[0.22, -0.18, 0.1]} rotation={[Math.PI / 1.8, 0, -0.4]}>
            <cylinderGeometry args={[0.27, 0.27, 0.06, 20]} />
            <Gold />
          </mesh>
        </>
      );

    case "criminoso": // adaga
      return (
        <>
          <mesh position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.15, 0.8, 4]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.46, 0.09, 0.12]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 8]} />
            <Gold />
          </mesh>
        </>
      );

    case "eremita": // montanha solitária e a lua
      return (
        <>
          <mesh position={[0, -0.15, 0]}>
            <coneGeometry args={[0.48, 0.78, 5]} />
            <Gold />
          </mesh>
          <mesh position={[0.42, 0.42, 0]}>
            <icosahedronGeometry args={[0.13, 1]} />
            <Gold />
          </mesh>
        </>
      );

    case "forasteiro": // cordilheira selvagem
      return (
        <>
          <mesh position={[-0.22, -0.1, 0]}>
            <coneGeometry args={[0.4, 0.82, 4]} />
            <Gold />
          </mesh>
          <mesh position={[0.3, -0.24, 0.12]}>
            <coneGeometry args={[0.28, 0.52, 4]} />
            <Gold />
          </mesh>
        </>
      );

    case "heroi-do-povo": // escudo com bossa
      return (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 18]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.15, 12, 10]} />
            <Gold />
          </mesh>
        </>
      );

    case "marinheiro": { // timão de navio
      const spokes = [];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        spokes.push(
          <mesh key={i} rotation={[0, 0, a]}>
            <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
            <Gold />
          </mesh>
        );
      }
      return (
        <>
          <mesh>
            <torusGeometry args={[0.44, 0.08, 10, 24]} />
            <Gold />
          </mesh>
          {spokes}
        </>
      );
    }

    case "nobre": { // coroa
      const spikes = [];
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        spikes.push(
          <mesh key={i} position={[Math.cos(a) * 0.36, 0.28, Math.sin(a) * 0.36]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <Gold />
          </mesh>
        );
      }
      return (
        <>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.26, 12]} />
            <Gold />
          </mesh>
          {spikes}
        </>
      );
    }

    case "orfao": // ratinho companheiro das ruas
      return (
        <>
          <mesh scale={[1, 0.75, 1.25]}>
            <sphereGeometry args={[0.33, 12, 10]} />
            <Gold />
          </mesh>
          <mesh position={[-0.15, 0.3, 0.18]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <Gold />
          </mesh>
          <mesh position={[0.15, 0.3, 0.18]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <Gold />
          </mesh>
        </>
      );

    case "sabio": // livro aberto
      return (
        <>
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.52, 0.06, 0.72]} />
            <Gold />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.52, 0.06, 0.72]} />
            <Gold />
          </mesh>
        </>
      );

    case "soldado": // espada
      return (
        <>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.14, 0.9, 0.06]} />
            <Gold />
          </mesh>
          <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.11, 0.2, 4]} />
            <Gold />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.48, 0.09, 0.12]} />
            <Gold />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
            <Gold />
          </mesh>
        </>
      );

    default: // fallback genérico
      return (
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <Gold />
        </mesh>
      );
  }
}

function IconRig({
  id,
  hovered,
  seed,
}: {
  id: string;
  hovered: boolean;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    // offset por seed → ícones dos cards não flutuam em sincronia
    const t = state.clock.elapsedTime + seed * 1.37;

    g.rotation.y += dt * (hovered ? 0.85 : 0.35);
    g.rotation.x = Math.sin(t * 0.6) * 0.12;
    g.position.y = Math.sin(t * 1.4) * 0.05; // flutuação sutil
  });

  return (
    <group ref={group}>
      <Shape id={id} />
    </group>
  );
}

/**
 * Slot de ícone por card: div rastreado pelo drei View. Sem canvas próprio —
 * a cena é desenhada pelo IconsStage no canvas compartilhado.
 */
export function IconView({
  id,
  size,
  hovered,
  seed,
}: {
  id: string;
  size: number;
  hovered: boolean;
  seed: number;
}) {
  return (
    <div aria-hidden style={{ width: size, height: size, pointerEvents: "none", flexShrink: 0 }}>
      <View style={{ width: "100%", height: "100%" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 2.6]} fov={40} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.3} />
        <pointLight position={[-2, 1, 2]} intensity={0.45} color="#e8b84b" />
        <IconRig id={id} hovered={hovered} seed={seed} />
      </View>
    </div>
  );
}

/**
 * Canvas compartilhado da grade de antecedentes. Monte UMA vez por página
 * (junto da grade); todos os <IconView> desenham nele via View.Port.
 * zIndex 10: acima dos cards, abaixo do header sticky (50) e footer (40).
 */
export function IconsStage() {
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
