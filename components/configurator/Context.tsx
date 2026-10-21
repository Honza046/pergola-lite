"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { TerrainBase, TERRAIN_TOP_Y } from "@/components/configurator/Platform";

/** Fixed garden-face Z of the house — never moves when kotvení changes */
export const HOUSE_FRONT_Z = -2.15;

const HOUSE = "#f7f7f5";
const HOUSE_DIM = "#ebebe8";
const HOUSE_RECESS = "#deded9";
const TREE = "#bdbbb5";
const LEAF = "#e4e2dc";

const BODY_W = 12;
const BODY_D = 7.2;
const EAVES_H = 3.55;
const RIDGE_H = 5.55;

/**
 * Fixed schematic house + studio ground + tree.
 * Pergola / deck are positioned separately so kotvení moves the product, not the house.
 */
export function Context() {
  const halfD = BODY_D / 2;
  const rise = RIDGE_H - EAVES_H;
  const roofPitch = Math.atan2(rise, halfD);
  const roofLen = Math.hypot(rise, halfD) + 0.35;
  const overhang = 0.28;
  const houseCenterZ = HOUSE_FRONT_Z - halfD;

  return (
    <group>
      {/* Full organic podium — replaces the white square */}
      <TerrainBase />

      <group position={[0, TERRAIN_TOP_Y, houseCenterZ]}>
        <mesh position={[0, EAVES_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[BODY_W, EAVES_H, BODY_D]} />
          <meshStandardMaterial color={HOUSE} roughness={0.92} metalness={0} envMapIntensity={0.2} />
        </mesh>

        <GableEnd x={-BODY_W / 2 - 0.005} halfD={halfD} eavesH={EAVES_H} ridgeH={RIDGE_H} />
        <GableEnd x={BODY_W / 2 + 0.005} halfD={halfD} eavesH={EAVES_H} ridgeH={RIDGE_H} />

        <mesh
          position={[0, EAVES_H + rise / 2 + 0.02, halfD / 2]}
          rotation={[roofPitch, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[BODY_W + overhang * 2, 0.09, roofLen]} />
          <meshStandardMaterial color={HOUSE_DIM} roughness={0.94} />
        </mesh>
        <mesh
          position={[0, EAVES_H + rise / 2 + 0.02, -halfD / 2]}
          rotation={[-roofPitch, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[BODY_W + overhang * 2, 0.09, roofLen]} />
          <meshStandardMaterial color={HOUSE_DIM} roughness={0.94} />
        </mesh>

        <mesh position={[0, RIDGE_H + 0.04, 0]} castShadow>
          <boxGeometry args={[BODY_W + overhang * 2 - 0.1, 0.06, 0.12]} />
          <meshStandardMaterial color={HOUSE_DIM} roughness={0.92} />
        </mesh>

        <Chimney halfD={halfD} ridgeH={RIDGE_H} rise={rise} x={BODY_W * 0.14} />

        <mesh position={[BODY_W * 0.3, 1.15, halfD + 0.015]} castShadow>
          <boxGeometry args={[2.4, 2.15, 0.08]} />
          <meshStandardMaterial color={HOUSE_RECESS} roughness={0.95} />
        </mesh>
        <mesh position={[-BODY_W * 0.28, 1.85, halfD + 0.015]}>
          <boxGeometry args={[1.15, 1.15, 0.06]} />
          <meshStandardMaterial color={HOUSE_RECESS} roughness={0.92} />
        </mesh>
        <mesh position={[-BODY_W * 0.1, 1.85, halfD + 0.015]}>
          <boxGeometry args={[1.15, 1.15, 0.06]} />
          <meshStandardMaterial color={HOUSE_RECESS} roughness={0.92} />
        </mesh>
      </group>

      <WinterTree
        position={[-BODY_W / 2 - 3.6, TERRAIN_TOP_Y, houseCenterZ + halfD * 0.5]}
        scale={1.2}
        seed={11}
      />
    </group>
  );
}

function Chimney({
  halfD,
  ridgeH,
  rise,
  x,
}: {
  halfD: number;
  ridgeH: number;
  rise: number;
  x: number;
}) {
  const chimZ = halfD * 0.28;
  const roofY = ridgeH - (chimZ / halfD) * rise;
  const chimH = 1.35;
  const embed = 0.55;
  const chimY = roofY + chimH / 2 - embed;
  const w = 0.44;

  return (
    <group>
      <mesh position={[x, chimY, chimZ]} castShadow receiveShadow>
        <boxGeometry args={[w, chimH, w]} />
        <meshStandardMaterial color={HOUSE} roughness={0.97} />
      </mesh>
      <mesh position={[x, chimY + chimH / 2 + 0.035, chimZ]} castShadow>
        <boxGeometry args={[w + 0.1, 0.07, w + 0.1]} />
        <meshStandardMaterial color={HOUSE_DIM} roughness={0.95} />
      </mesh>
    </group>
  );
}

function GableEnd({
  x,
  halfD,
  eavesH,
  ridgeH,
}: {
  x: number;
  halfD: number;
  eavesH: number;
  ridgeH: number;
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-halfD, eavesH);
    shape.lineTo(0, ridgeH);
    shape.lineTo(halfD, eavesH);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  }, [halfD, eavesH, ridgeH]);

  return (
    <mesh
      geometry={geom}
      position={[x, 0, 0]}
      rotation={[0, -Math.PI / 2, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={HOUSE} roughness={0.97} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WinterTree({
  position,
  scale = 1,
  seed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  seed?: number;
}) {
  const leafRef = useRef<THREE.InstancedMesh>(null);

  const { branchGeo, leafData } = useMemo(() => {
    let s = seed * 7919 + 104729;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const geos: THREE.BufferGeometry[] = [];
    const tips: [number, number, number][] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const tmp = new THREE.Matrix4();

    const addBranch = (
      ax: number,
      ay: number,
      az: number,
      bx: number,
      by: number,
      bz: number,
      r0: number,
      r1: number,
      tip: boolean,
    ) => {
      dir.set(bx - ax, by - ay, bz - az);
      const len = dir.length();
      if (len < 0.03) return;
      dir.normalize();
      quat.setFromUnitVectors(up, dir);
      const g = new THREE.CylinderGeometry(r1, r0, len, tip ? 3 : 5, 1);
      tmp.makeRotationFromQuaternion(quat);
      tmp.setPosition((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
      g.applyMatrix4(tmp);
      geos.push(g);
      if (tip) tips.push([bx, by, bz]);
    };

    const grow = (
      ox: number,
      oy: number,
      oz: number,
      dx: number,
      dy: number,
      dz: number,
      len: number,
      radius: number,
      depth: number,
    ) => {
      if (depth <= 0 || len < 0.08) return;
      if (dx > 0.12) dx *= 0.2;
      const inv = 1 / Math.hypot(dx, dy, dz);
      dx *= inv;
      dy *= inv;
      dz *= inv;
      const nx = ox + dx * len;
      const ny = oy + dy * len;
      const nz = oz + dz * len;
      addBranch(ox, oy, oz, nx, ny, nz, radius, radius * 0.55, depth <= 1);

      const children = depth > 3 ? 2 : depth > 1 ? 2 : 1;
      for (let i = 0; i < children; i++) {
        const spread = 0.45 + rand() * 0.7;
        const yaw = Math.PI * 0.6 + (i / Math.max(children, 1)) * 1.6 + rand() * 0.4;
        let cx = dx * 0.35 - Math.abs(Math.sin(yaw)) * spread - 0.1;
        let cy = dy * 0.35 + 0.55 + rand() * 0.45;
        let cz = dz * 0.35 + Math.cos(yaw) * spread * 0.8;
        const cl = Math.hypot(cx, cy, cz) || 1;
        grow(nx, ny, nz, cx / cl, cy / cl, cz / cl, len * (0.55 + rand() * 0.2), radius * 0.52, depth - 1);
      }
    };

    grow(0, 0, 0, -0.05, 1, 0.02, 1.55, 0.065, 4);
    grow(0, 1.15, 0, -0.9, 0.5, 0.2, 0.95, 0.032, 3);
    grow(0, 1.55, 0, -0.65, 0.6, -0.4, 0.8, 0.028, 3);
    grow(0, 1.9, 0, -0.5, 0.75, 0.45, 0.65, 0.022, 2);

    const merged = mergeGeometries(geos) ?? geos[0] ?? new THREE.BufferGeometry();
    geos.forEach((g) => {
      if (g !== merged) g.dispose();
    });

    const leafData = tips.slice(0, 36).flatMap(([x, y, z]) => {
      const out: { p: [number, number, number]; s: number; r: number }[] = [];
      for (let i = 0; i < 2; i++) {
        out.push({
          p: [x + (rand() - 0.6) * 0.14, y + (rand() - 0.25) * 0.12, z + (rand() - 0.5) * 0.14],
          s: 0.08 + rand() * 0.06,
          r: rand() * Math.PI,
        });
      }
      return out;
    });

    return { branchGeo: merged, leafData };
  }, [seed]);

  useLayoutEffect(() => {
    const mesh = leafRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const e = new THREE.Euler();
    leafData.forEach((leaf, i) => {
      p.set(leaf.p[0], leaf.p[1], leaf.p[2]);
      e.set(leaf.r * 0.6, leaf.r, leaf.r * 0.3);
      q.setFromEuler(e);
      sc.set(leaf.s, leaf.s, leaf.s);
      m.compose(p, q, sc);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = leafData.length;
  }, [leafData]);

  return (
    <group position={position} scale={scale}>
      <mesh geometry={branchGeo} castShadow={false} receiveShadow={false}>
        <meshStandardMaterial color={TREE} roughness={0.95} metalness={0} />
      </mesh>
      <instancedMesh
        ref={leafRef}
        args={[undefined, undefined, Math.max(leafData.length, 1)]}
        frustumCulled
        castShadow={false}
        receiveShadow={false}
      >
        <planeGeometry args={[1, 1.3]} />
        <meshStandardMaterial
          color={LEAF}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
          transparent
          opacity={0.88}
        />
      </instancedMesh>
    </group>
  );
}
