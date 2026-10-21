"use client";

import { Environment, OrbitControls, PerspectiveCamera, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState } from "react";
import { Sun } from "lucide-react";
import * as THREE from "three";

import { PergolaModel } from "@/components/configurator/PergolaModel";

/** Realistic soft sky + layered clouds — no CDN */
function AluxSkyDome({
  bright,
  sunPos,
}: {
  bright: boolean;
  sunPos: [number, number, number];
}) {
  const mat = useMemo(() => {
    const top = bright ? new THREE.Color("#5a9fd4") : new THREE.Color("#3d4a5c");
    const mid = bright ? new THREE.Color("#a8c8e4") : new THREE.Color("#6a7688");
    const bot = bright ? new THREE.Color("#dce6ef") : new THREE.Color("#8a94a0");
    const sun = new THREE.Vector3(sunPos[0], sunPos[1], sunPos[2]).normalize();
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: top },
        midColor: { value: mid },
        botColor: { value: bot },
        sunDir: { value: sun },
        bright: { value: bright ? 1.0 : 0.0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 botColor;
        uniform vec3 sunDir;
        uniform float bright;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.05;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 n = normalize(vWorldPos);
          float h = n.y;
          float t = clamp(h * 0.55 + 0.42, 0.0, 1.0);
          vec3 col = mix(botColor, midColor, smoothstep(0.22, 0.5, t));
          col = mix(col, topColor, smoothstep(0.48, 0.95, t));

          // sun glow
          float sunAmt = pow(max(dot(n, sunDir), 0.0), 8.0);
          col += vec3(1.0, 0.92, 0.75) * sunAmt * (0.35 + 0.45 * bright);

          // soft volumetric clouds
          vec2 uv = n.xz / max(n.y + 0.35, 0.15);
          float clouds = fbm(uv * 2.2 + 0.15);
          clouds = smoothstep(0.42, 0.72, clouds);
          float band = smoothstep(0.0, 0.28, h) * smoothstep(0.78, 0.28, h);
          col = mix(col, vec3(0.96, 0.97, 0.99), clouds * band * (0.5 + 0.25 * bright));

          // horizon haze
          float haze = smoothstep(0.35, -0.05, h);
          col = mix(col, botColor, haze * 0.35);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [bright, sunPos[0], sunPos[1], sunPos[2]]);

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[140, 48, 24]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** Fixed studio framing — house stays the same size when dimensions change */
const CAM_POS: [number, number, number] = [11.5, 6.2, 14.5];
const CAM_TARGET: [number, number, number] = [0, 1.6, -0.8];

function SceneContent({ bright }: { bright: boolean }) {
  const sunPos: [number, number, number] = bright ? [9, 13, 5] : [-4, 8, 6];
  const fogColor = bright ? "#d8e4f0" : "#8e98a6";

  return (
    <>
      <PerspectiveCamera makeDefault position={CAM_POS} fov={30} near={0.1} far={250} />

      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 32, 90]} />

      <AluxSkyDome bright={bright} sunPos={sunPos} />

      <SoftShadows size={20} samples={10} focus={0.65} />

      <ambientLight intensity={bright ? 0.4 : 0.22} />
      <hemisphereLight
        args={[bright ? "#eaf3ff" : "#a8b4c4", bright ? "#cfc4b0" : "#5c6066", bright ? 0.55 : 0.28]}
      />

      <directionalLight
        castShadow
        intensity={bright ? 2.05 : 0.7}
        position={sunPos}
        color={bright ? "#fff4e0" : "#c0c8d8"}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
        shadow-camera-near={1}
        shadow-camera-far={56}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <directionalLight intensity={bright ? 0.4 : 0.15} position={[-8, 5, -4]} color="#cfe0ff" />

      <Suspense fallback={null}>
        <Environment
          preset={bright ? "park" : "dawn"}
          environmentIntensity={bright ? 0.7 : 0.35}
        />
      </Suspense>

      <PergolaModel />

      <OrbitControls
        makeDefault
        target={CAM_TARGET}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={28}
        enablePan={false}
      />
    </>
  );
}

export function Scene() {
  const [bright, setBright] = useState(true);

  return (
    <div className="relative h-full w-full bg-[#d8e4f0]">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <SceneContent bright={bright} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0">
        <button
          type="button"
          aria-label={bright ? "Tlumené světlo" : "Denní světlo"}
          onClick={() => setBright((v) => !v)}
          className="pointer-events-auto absolute top-4 left-4 grid size-10 place-items-center rounded-full border border-black/8 bg-white/95 text-ink shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition hover:bg-white"
        >
          <Sun className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
