"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useConfig } from "@/lib/store";

function fmt(v: number) {
  const n = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1).replace(".", ",");
  return `${n}m`;
}

/** Hide children when house wall sits between camera and this group */
export function HideWhenBehindHouse({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.getWorldPosition(target);
    dir.copy(target).sub(camera.position);
    const dist = dir.length();
    if (dist < 0.05) {
      g.visible = true;
      return;
    }
    dir.multiplyScalar(1 / dist);
    raycaster.set(camera.position, dir);
    raycaster.far = dist - 0.05;
    const hits = raycaster.intersectObjects(scene.children, true);
    let occluded = false;
    for (const hit of hits) {
      if (hit.distance >= dist - 0.05) break;
      let obj: THREE.Object3D | null = hit.object;
      let skip = false;
      let house = false;
      while (obj) {
        if (obj.userData?.noOcclude) {
          skip = true;
          break;
        }
        if (obj.userData?.houseOccluder) {
          house = true;
          break;
        }
        obj = obj.parent;
      }
      if (skip) continue;
      if (house) {
        occluded = true;
        break;
      }
    }
    g.visible = !occluded;
  });

  return (
    <group ref={group} userData={{ noOcclude: true }}>
      {children}
    </group>
  );
}

function DimBadge({
  position,
  children,
}: {
  position: [number, number, number];
  children: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[Math.max(0.55, children.length * 0.14), 0.28]} />
        <meshBasicMaterial color="#ffffff" depthTest depthWrite />
      </mesh>
      <Text
        fontSize={0.14}
        color="#111111"
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        {children}
      </Text>
    </group>
  );
}

function DimStem({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const mz = (from[2] + to[2]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dy, dz) || 0.01;
  const tick = 0.14;

  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
    return (
      <group>
        <mesh position={[mx, my, mz]}>
          <boxGeometry args={[0.012, len, 0.012]} />
          <meshBasicMaterial color="#222222" depthTest depthWrite />
        </mesh>
        <mesh position={[from[0], from[1], from[2]]}>
          <boxGeometry args={[tick, 0.012, 0.012]} />
          <meshBasicMaterial color="#222222" depthTest depthWrite />
        </mesh>
        <mesh position={[to[0], to[1], to[2]]}>
          <boxGeometry args={[tick, 0.012, 0.012]} />
          <meshBasicMaterial color="#222222" depthTest depthWrite />
        </mesh>
      </group>
    );
  }

  const angle = Math.atan2(dx, dz);
  const alongX = Math.abs(dx) >= Math.abs(dz);
  return (
    <group>
      <mesh position={[mx, my, mz]} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.012, 0.012, len]} />
        <meshBasicMaterial color="#222222" depthTest depthWrite />
      </mesh>
      <mesh position={[from[0], from[1], from[2]]} rotation={[0, angle, 0]}>
        <boxGeometry args={alongX ? [0.012, 0.012, tick] : [tick, 0.012, 0.012]} />
        <meshBasicMaterial color="#222222" depthTest depthWrite />
      </mesh>
      <mesh position={[to[0], to[1], to[2]]} rotation={[0, angle, 0]}>
        <boxGeometry args={alongX ? [0.012, 0.012, tick] : [tick, 0.012, 0.012]} />
        <meshBasicMaterial color="#222222" depthTest depthWrite />
      </mesh>
    </group>
  );
}

export function SideLabels() {
  const { width, depth, height } = useConfig();
  const halfW = width / 2;
  const halfD = depth / 2;
  const hx = -halfW - 0.58;
  const hz = halfD + 0.12;

  return (
    <HideWhenBehindHouse>
      <DimStem from={[-halfW, 0.04, halfD + 0.48]} to={[halfW, 0.04, halfD + 0.48]} />
      <DimBadge position={[0, 0.24, halfD + 0.72]}>{fmt(width)}</DimBadge>

      <DimStem from={[halfW + 0.48, 0.04, -halfD]} to={[halfW + 0.48, 0.04, halfD]} />
      <DimBadge position={[halfW + 0.78, 0.24, 0]}>{fmt(depth)}</DimBadge>

      <DimStem from={[hx, 0.04, hz]} to={[hx, height, hz]} />
      <DimBadge position={[hx - 0.28, height / 2, hz]}>{fmt(height)}</DimBadge>
    </HideWhenBehindHouse>
  );
}
