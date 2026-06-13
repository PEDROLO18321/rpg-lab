import * as THREE from "three";

/**
 * Geometrias procedurais de dados (sem assets) — compartilhadas entre
 * Dice3D (roller/toast) e ClassOrbViews (esfera→dado nos cards de classe).
 */

/** d10: trapezoedro pentagonal aproximado (equador em zigue-zague). */
function makeD10Geometry(): THREE.BufferGeometry {
  const verts: number[] = [];
  const top = [0, 1.05, 0];
  const bottom = [0, -1.05, 0];
  const ring: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const y = i % 2 === 0 ? 0.13 : -0.13;
    ring.push([Math.cos(a), y, Math.sin(a)]);
  }
  for (let i = 0; i < 10; i++) {
    const v1 = ring[i];
    const v2 = ring[(i + 1) % 10];
    // metade superior + metade inferior
    verts.push(...top, ...v2, ...v1);
    verts.push(...bottom, ...v1, ...v2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
}

export function makeDiceGeometry(sides: number): THREE.BufferGeometry {
  switch (sides) {
    case 4:   return new THREE.TetrahedronGeometry(1.15);
    case 6:   return new THREE.BoxGeometry(1.45, 1.45, 1.45);
    case 8:   return new THREE.OctahedronGeometry(1.15);
    case 10:  return makeD10Geometry();
    case 12:  return new THREE.DodecahedronGeometry(1.1);
    case 100: return new THREE.IcosahedronGeometry(1.1, 1); // "esfera" facetada
    case 20:
    default:  return new THREE.IcosahedronGeometry(1.15);
  }
}
