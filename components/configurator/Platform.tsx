"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Bottom → top: darker base, lightest plateau on top (první / horní vrstva)
const TERRACE = ["#a89472", "#b8a484", "#c9b898", "#d8cbb0", "#ebe4d4"] as const;
const LINE = "#8f7e62";

/** Top surface Y — house + pergola sit here */
export const TERRAIN_TOP_Y = 0.3;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeOrganicShape(rx: number, rz: number, seed: number, scale: number) {
  const rand = mulberry32(seed * 9973 + Math.round(scale * 10000));
  const steps = 24;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wobble =
      0.88 +
      0.09 * Math.sin(a * 2.1 + seed * 0.4) +
      0.07 * Math.sin(a * 3.5 - seed * 0.9) +
      0.04 * Math.sin(a * 5.2 + seed * 1.2) +
      (rand() - 0.5) * 0.03;
    pts.push(new THREE.Vector2(Math.cos(a) * rx * wobble * scale, Math.sin(a) * rz * wobble * scale));
  }
  return new THREE.Shape(pts);
}

function makeTerraceGeo(shape: THREE.Shape, thickness: number) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: Math.min(0.045, thickness * 0.4),
    bevelSize: Math.min(0.05, thickness * 0.45),
    bevelSegments: 2,
    curveSegments: 20,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function makeContourLine(shape: THREE.Shape) {
  const pts = shape.getPoints(64);
  const positions = new Float32Array((pts.length + 1) * 3);
  for (let j = 0; j < pts.length; j++) {
    positions[j * 3] = pts[j].x;
    positions[j * 3 + 1] = 0;
    positions[j * 3 + 2] = pts[j].y;
  }
  positions[pts.length * 3] = pts[0].x;
  positions[pts.length * 3 + 1] = 0;
  positions[pts.length * 3 + 2] = pts[0].y;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

/**
 * Full-scene tiered podium with contour rings — replaces the white square.
 */
export function TerrainBase() {
  // Big footprint so the podium fills the viewport (not a small island)
  const rx = 34;
  const rz = 30;
  const seed = 42;
  const offsetZ = -3.2;

  const { terraces, contours } = useMemo(() => {
    // Gentler scale steps → each terrace keeps a large surface area
    const scales = [1, 0.94, 0.88, 0.82, 0.76];
    const thicknesses = [0.1, 0.055, 0.05, 0.048, 0.045];
    let y = 0;
    const terraces = scales.map((s, i) => {
      const shape = makeOrganicShape(rx, rz, seed + i * 19, s);
      const geo = makeTerraceGeo(shape, thicknesses[i]);
      const item = { geo, color: TERRACE[i % TERRACE.length], y };
      y += thicknesses[i] * 0.92;
      return item;
    });

    // Contour rings spread across the whole big podium
    const contourScales = [0.98, 0.94, 0.9, 0.86, 0.82, 0.78, 0.74, 0.7];
    const contours = contourScales.map((s, i) => {
      const shape = makeOrganicShape(rx, rz, seed + 200 + i * 11, s);
      const tier = Math.min(Math.floor(i / 2), terraces.length - 1);
      return {
        geo: makeContourLine(shape),
        y: terraces[tier].y + thicknesses[tier] + 0.008,
      };
    });

    return { terraces, contours };
  }, []);

  return (
    <group position={[0, -0.02, offsetZ]}>
      {terraces.map((t, i) => (
        <mesh key={i} geometry={t.geo} position={[0, t.y, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color={t.color}
            roughness={0.93 - i * 0.03}
            metalness={0.02}
            envMapIntensity={0.16}
          />
        </mesh>
      ))}
      {contours.map((c, i) => (
        <line key={`c-${i}`} geometry={c.geo} position={[0, c.y, 0]}>
          <lineBasicMaterial color={LINE} transparent opacity={0.55} />
        </line>
      ))}
    </group>
  );
}
