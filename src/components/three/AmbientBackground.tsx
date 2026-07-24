"use client";

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PerfTier } from "./usePerformanceTier";

export type ParticleSystem = "dnd" | "tormenta" | "cthulhu" | "ordem" | "starwars" | null;

const SYSTEM_PALETTE: Record<NonNullable<ParticleSystem>, string[]> = {
  dnd:      ["#e8b84b", "#c9941f", "#f5d07a"],
  tormenta: ["#c0191a", "#8b0000", "#e03030"],
  cthulhu:  ["#7d9c3e", "#4a5828", "#a3b86c"],
  ordem:    ["#ffffff", "#f2f5fb", "#e4eaf6"],
  starwars: ["#e0524c", "#ff6b6b", "#5d9ed6", "#8fc4f5"],
};

// Páginas genéricas: partículas multicor (fantasia)
const GENERIC_PALETTE = ["#8b5cf6", "#3b82f6", "#14b8a6", "#e8b84b", "#f472b6", "#6b7a3a"];

function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0,    "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.7)");
  grad.addColorStop(1,    "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const BOUNDS = { x: 22, y: 14, z: 8 };

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Embers({ count, system }: { count: number; system: ParticleSystem }) {
  const pointsRef   = useRef<THREE.Points>(null);
  const texture     = useMemo(() => makeGlowTexture(), []);
  const respawnRand = useRef(mulberry32(0xbeef));

  const palette = system ? SYSTEM_PALETTE[system] : GENERIC_PALETTE;

  const { positions, colors, speeds, phases } = useMemo(() => {
    const rand      = mulberry32(0xd20);
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const phases    = new Float32Array(count);
    const c         = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (rand() - 0.5) * BOUNDS.x * 2;
      positions[i * 3 + 1] = (rand() - 0.5) * BOUNDS.y * 2;
      positions[i * 3 + 2] = (rand() - 0.5) * BOUNDS.z * 2;
      c.set(palette[Math.floor(rand() * palette.length)]);
      c.multiplyScalar(system === "ordem" ? 0.82 + rand() * 0.18 : 0.55 + rand() * 0.45);
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      speeds[i] = 0.12 + rand() * 0.35;
      phases[i] = rand() * Math.PI * 2;
    }
    return { positions, colors, speeds, phases };
  }, [count, palette, system]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const dt  = Math.min(delta, 0.05);
    const pos = points.geometry.attributes.position.array as Float32Array;
    const t   = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * dt;
      pos[i * 3 + 0] += Math.sin(t * 0.3 + phases[i]) * dt * 0.18;
      if (pos[i * 3 + 1] > BOUNDS.y) {
        pos[i * 3 + 1]  = -BOUNDS.y;
        pos[i * 3 + 0]  = (respawnRand.current() - 0.5) * BOUNDS.x * 2;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.34}
        vertexColors
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/*
// Parallax sutil do grupo inteiro seguindo o mouse — desativado.
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group  = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      target.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.001, delta);
    g.rotation.y += (target.current.x * 0.06 - g.rotation.y) * k;
    g.rotation.x += (target.current.y * 0.04 - g.rotation.x) * k;
  });

  return <group ref={group}>{children}</group>;
}
*/

export default function AmbientBackground({
  tier,
  system,
}: {
  tier: Exclude<PerfTier, "off">;
  system: ParticleSystem;
}) {
  const count = tier === "high" ? 150 : 60;

  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <Canvas
        dpr={tier === "high" ? [1, 1.5] : 1}
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          stencil: false,
          depth: false,
        }}
        style={{ background: "transparent" }}
      >
        <Embers count={count} system={system} />
      </Canvas>
    </div>
  );
}
