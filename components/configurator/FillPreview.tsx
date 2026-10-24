"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";

import { PergolaModel } from "@/components/configurator/PergolaModel";
import type { FillType, SideId } from "@/types/config";

/** Rotate so the edited side always faces the same studio camera */
const SIDE_YAW: Record<SideId, number> = {
  front: 0,
  right: -Math.PI / 2,
  back: Math.PI,
  left: Math.PI / 2,
};

function CameraAim() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 1.05, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function StudioScene({ side, fill }: { side: SideId; fill: FillType }) {
  const fillsOverride = useMemo(
    () => ({
      front: "none" as FillType,
      back: "none" as FillType,
      left: "none" as FillType,
      right: "none" as FillType,
      [side]: fill,
    }),
    [side, fill],
  );

  return (
    <>
      {/* Pulled back so the whole pergola fits in the preview frame */}
      <PerspectiveCamera makeDefault position={[5.8, 3.6, 10.2]} fov={30} near={0.1} far={80} />
      <CameraAim />
      <color attach="background" args={["#e8e6e1"]} />
      <ambientLight intensity={0.7} color="#f5f7fb" />
      <hemisphereLight args={["#eef2f6", "#c8c4bc", 0.55]} />
      <directionalLight
        castShadow
        intensity={1.05}
        position={[5, 9, 4]}
        color="#f7f8fa"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight intensity={0.28} position={[-4, 3, -2]} color="#e4eaf2" />

      <group rotation={[0, SIDE_YAW[side], 0]}>
        <PergolaModel studio fillsOverride={fillsOverride} />
      </group>
    </>
  );
}

/** Same framing for every fill — only the side panel type changes */
export function FillPreview({ side, fill }: { side: SideId; fill: FillType }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <StudioScene side={side} fill={fill} />
        </Suspense>
      </Canvas>
    </div>
  );
}
