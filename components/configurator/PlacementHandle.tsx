"use client";

import { type ThreeEvent, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { HOUSE_FRONT_Z } from "@/components/configurator/Context";
import { TERRAIN_TOP_Y } from "@/components/configurator/Platform";
import { dimensionLimits } from "@/lib/catalog";
import { useConfig } from "@/lib/store";

const SIDE_MAX = 4;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Freestanding only — grab the center disc and drag the pergola on the ground.
 */
export function PlacementHandle() {
  const mount = useConfig((s) => s.mount);
  const depth = useConfig((s) => s.depth);
  const setSetback = useConfig((s) => s.setSetback);
  const setOriginX = useConfig((s) => s.setOriginX);

  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -TERRAIN_TOP_Y));
  const raycaster = useRef(new THREE.Raycaster());
  const hit = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());

  const applyHit = useCallback(
    (wx: number, wz: number) => {
      setOriginX(clamp(wx, -SIDE_MAX, SIDE_MAX));
      setSetback(
        clamp(
          wz - HOUSE_FRONT_Z - depth / 2,
          dimensionLimits.setback.min,
          dimensionLimits.setback.max,
        ),
      );
    },
    [depth, setOriginX, setSetback],
  );

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    if (controls) controls.enabled = false;
    gl.domElement.style.cursor = "grabbing";
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (ev: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      if (raycaster.current.ray.intersectPlane(plane.current, hit.current)) {
        applyHit(hit.current.x, hit.current.z);
      }
    };

    const onUp = () => {
      setDragging(false);
      if (controls) controls.enabled = true;
      gl.domElement.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (controls) controls.enabled = true;
    };
  }, [dragging, applyHit, camera, controls, gl]);

  if (mount !== "freestanding") return null;

  const active = dragging || hover;

  return (
    <group position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        onPointerDown={onPointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          gl.domElement.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHover(false);
          if (!dragging) gl.domElement.style.cursor = "";
        }}
      >
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh renderOrder={20}>
        <ringGeometry args={[0.16, 0.3, 40]} />
        <meshBasicMaterial
          color={active ? "#2f6b4a" : "#234836"}
          transparent
          opacity={dragging ? 0.98 : 0.88}
          depthTest={false}
        />
      </mesh>
      <mesh renderOrder={21}>
        <circleGeometry args={[0.08, 24]} />
        <meshBasicMaterial
          color={active ? "#3d8a5c" : "#2f6b4a"}
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
