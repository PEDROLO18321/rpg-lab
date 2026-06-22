"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { TUMBLE_MS } from "./diceConstants";
import { makeDiceGeometry } from "./diceGeometry";

/**
 * Dado 3D dourado de baixo custo (poliedros procedurais, sem assets).
 * Gira devagar em idle; quando `rollToken` muda, dá um tumble rápido
 * com desaceleração (≈ TUMBLE_MS) — o consumidor exibe o resultado
 * em HTML após esse tempo (texto nítido + acessível fora do canvas).
 *
 * Carregue via next/dynamic { ssr: false }.
 */

function DieMesh({
  sides, rollToken, color, edgeColor, emissive,
}: { sides: number; rollToken: number; color: string; edgeColor: string; emissive: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => makeDiceGeometry(sides), [sides]);
  // Inicia em 0 (nenhuma rolagem): montar já com rollToken > 0 (ex.: toast
  // que aparece junto com a rolagem) dispara o tumble imediatamente.
  const lastToken = useRef(0);
  const tumbleLeft = useRef(0); // segundos restantes de tumble
  const axis = useRef(new THREE.Vector3(1, 1, 0).normalize());

  // geometria trocada (sides) ou desmontada → libera GPU
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);

    if (rollToken !== lastToken.current) {
      lastToken.current = rollToken;
      tumbleLeft.current = TUMBLE_MS / 1000;
      axis.current
        .set(Math.random() - 0.5, Math.random() + 0.5, Math.random() - 0.5)
        .normalize();
    }

    if (tumbleLeft.current > 0) {
      tumbleLeft.current = Math.max(0, tumbleLeft.current - dt);
      const p = tumbleLeft.current / (TUMBLE_MS / 1000); // 1 → 0
      const speed = 4 + 18 * p * p; // desaceleração quadrática
      m.rotateOnAxis(axis.current, speed * dt);
    } else {
      // idle: rotação lenta e constante
      m.rotation.y += dt * 0.5;
      m.rotation.x += dt * 0.18;
    }
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        metalness={0.45}
        roughness={0.32}
        emissive={emissive}
        flatShading
      />
      <Edges threshold={10} color={edgeColor} />
    </mesh>
  );
}

interface Dice3DProps {
  sides: number;
  size: number;          // px (largura = altura)
  rollToken?: number;    // incremente para disparar o tumble
  className?: string;
  color?: string;        // cor do corpo do dado
  edgeColor?: string;    // cor das arestas + luz de realce
  emissive?: string;     // brilho interno
}

export default function Dice3D({
  sides, size, rollToken = 0, className,
  color = "#c9941f", edgeColor = "#e8b84b", emissive = "#2a1d06",
}: Dice3DProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ width: size, height: size, pointerEvents: "none" }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color={edgeColor} />
        <DieMesh sides={sides} rollToken={rollToken} color={color} edgeColor={edgeColor} emissive={emissive} />
      </Canvas>
    </div>
  );
}
