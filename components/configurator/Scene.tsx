"use client";

import { Environment, OrbitControls, PerspectiveCamera, SoftShadows } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { Moon, Sun } from "lucide-react";
import * as THREE from "three";

import { PergolaModel } from "@/components/configurator/PergolaModel";
import { useConfig } from "@/lib/store";

function ToneExposure({ night }: { night: boolean }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = night ? 1.02 : 1.0;
  }, [gl, night]);
  return null;
}

/** Realistic soft sky — day blue / deep night */
function AluxSkyDome({
  night,
  sunPos,
}: {
  night: boolean;
  sunPos: [number, number, number];
}) {
  const mat = useMemo(() => {
    // Soft evening / blue hour — not pitch black
    const top = night ? new THREE.Color("#1a2740") : new THREE.Color("#7eb3d9");
    const mid = night ? new THREE.Color("#2a3a55") : new THREE.Color("#c5d6e6");
    const bot = night ? new THREE.Color("#3a465c") : new THREE.Color("#e8eef4");
    const sun = new THREE.Vector3(sunPos[0], sunPos[1], sunPos[2]).normalize();
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: top },
        midColor: { value: mid },
        botColor: { value: bot },
        sunDir: { value: sun },
        night: { value: night ? 1.0 : 0.0 },
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
        uniform float night;
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

          // sun / moon glow
          float sunAmt = pow(max(dot(n, sunDir), 0.0), mix(8.0, 24.0, night));
          vec3 glow = mix(vec3(1.0, 0.92, 0.75), vec3(0.72, 0.82, 1.0), night);
          col += glow * sunAmt * mix(0.55, 0.35, night);

          // soft clouds (day) / faint haze (night)
          vec2 uv = n.xz / max(n.y + 0.35, 0.15);
          float clouds = fbm(uv * 2.2 + 0.15);
          clouds = smoothstep(0.42, 0.72, clouds);
          float band = smoothstep(0.0, 0.28, h) * smoothstep(0.78, 0.28, h);
          col = mix(col, mix(vec3(0.96, 0.97, 0.99), vec3(0.18, 0.22, 0.32), night), clouds * band * mix(0.55, 0.12, night));

          // stars at night
          if (night > 0.5 && h > 0.15) {
            float star = step(0.997, hash(floor(n.xy * 180.0)));
            col += vec3(0.85, 0.9, 1.0) * star * smoothstep(0.15, 0.55, h);
          }

          float haze = smoothstep(0.35, -0.05, h);
          col = mix(col, botColor, haze * mix(0.35, 0.55, night));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [night, sunPos[0], sunPos[1], sunPos[2]]);

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

function SceneContent({ night }: { night: boolean }) {
  const sunPos: [number, number, number] = night ? [-6, 10, 4] : [9, 14, 6];
  const fogColor = night ? "#2a3548" : "#e6ebf0";

  return (
    <>
      <PerspectiveCamera makeDefault position={CAM_POS} fov={30} near={0.1} far={250} />
      <ToneExposure night={night} />

      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, night ? 32 : 36, night ? 88 : 95]} />

      <AluxSkyDome night={night} sunPos={sunPos} />

      <SoftShadows size={18} samples={12} focus={0.8} />

      <ambientLight
        intensity={night ? 0.2 : 0.55}
        color={night ? "#3a4558" : "#f4f7fb"}
      />
      <hemisphereLight
        args={[
          night ? "#4a5a72" : "#eef3f8",
          night ? "#1c2028" : "#d8dde3",
          night ? 0.32 : 0.48,
        ]}
      />

      {/* Sun / moon */}
      <directionalLight
        castShadow
        intensity={night ? 0.42 : 1.15}
        position={sunPos}
        color={night ? "#b8c8e0" : "#f5f7fa"}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.045}
        shadow-camera-near={1}
        shadow-camera-far={56}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      {!night ? (
        <directionalLight intensity={0.35} position={[-8, 6, -4]} color="#e8eef5" />
      ) : (
        <directionalLight intensity={0.18} position={[8, 4, -6]} color="#8898b0" />
      )}

      <Suspense fallback={null}>
        <Environment
          preset={night ? "night" : "city"}
          environmentIntensity={night ? 0.16 : 0.22}
        />
      </Suspense>

      <PergolaModel />

      <OrbitControls
        makeDefault
        target={CAM_TARGET}
        // Allow looking up under the roof (ALUX-style underside view)
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI * 0.88}
        minDistance={4}
        maxDistance={28}
        enablePan={false}
      />
    </>
  );
}

export function Scene() {
  const night = useConfig((s) => s.nightMode);
  const setNightMode = useConfig((s) => s.setNightMode);
  const hasLeds = useConfig((s) => s.lighting === "led");

  return (
    <div className={`relative h-full w-full ${night ? "bg-[#2a3548]" : "bg-[#e6ebf0]"}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <SceneContent night={night} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0">
        <button
          type="button"
          aria-label={night ? "Denní světlo" : "Noční režim"}
          title={night ? "Přepnout na den" : "Přepnout na noc"}
          onClick={() => setNightMode(!night)}
          className="pointer-events-auto absolute top-4 left-4 grid size-10 place-items-center rounded-full border border-black/8 bg-white/95 text-ink shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition hover:bg-white"
        >
          {night ? (
            <Sun className="size-4" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4" strokeWidth={1.75} />
          )}
        </button>
        {night && hasLeds ? (
          <p className="pointer-events-none absolute top-4 left-16 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            LED svítí
          </p>
        ) : null}
      </div>
    </div>
  );
}
