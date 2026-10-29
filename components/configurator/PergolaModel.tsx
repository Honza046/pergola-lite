"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { Context, HOUSE_FRONT_Z } from "@/components/configurator/Context";
import { PlacementHandle } from "@/components/configurator/PlacementHandle";
import { TERRAIN_TOP_Y } from "@/components/configurator/Platform";
import { SideLabels } from "@/components/configurator/SideLabels";
import { DECK_HEIGHT, WoodenDeck } from "@/components/configurator/WoodenDeck";
import { ledTempOptions, WALL_SETBACK } from "@/lib/catalog";
import { getRoofFinish, type RoofFinish } from "@/lib/colors";
import { useConfig } from "@/lib/store";
import type { AccessoryId, FillType, LedTemp, MountType, RoofModel } from "@/types/config";

const POST = 0.15;
const BEAM = 0.16;
const PARTITION = "#f0f0ed";
/** Shared roof rafters (příčky) — same for glass / poly / thermo / carport */
const RAFTER_W = 0.05;
const RAFTER_H = 0.07;
const RAFTER_Y = -0.022;

function rafterCountFor(width: number) {
  return Math.max(3, Math.round((width - POST * 2) / 0.85));
}

/** X positions of roof dividing bars — same spacing for all sheet roofs */
function rafterXs(width: number): number[] {
  const spanW = width - POST * 2;
  const n = rafterCountFor(width);
  return Array.from({ length: n }, (_, i) => -spanW / 2 + spanW * ((i + 1) / (n + 1)));
}

function RoofRafters({
  width,
  depth,
  frameColor,
}: {
  width: number;
  depth: number;
  frameColor: string;
}) {
  const spanW = width - POST * 2;
  const spanD = depth - POST * 2;
  const xs = rafterXs(width);
  return (
    <group>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, RAFTER_Y, 0]} castShadow>
          <boxGeometry args={[RAFTER_W, RAFTER_H, spanD - 0.04]} />
          <FrameMat color={frameColor} />
        </mesh>
      ))}
      <mesh position={[-spanW / 2 + 0.025, RAFTER_Y + 0.005, 0]} castShadow>
        <boxGeometry args={[0.04, 0.055, spanD - 0.02]} />
        <FrameMat color={frameColor} />
      </mesh>
      <mesh position={[spanW / 2 - 0.025, RAFTER_Y + 0.005, 0]} castShadow>
        <boxGeometry args={[0.04, 0.055, spanD - 0.02]} />
        <FrameMat color={frameColor} />
      </mesh>
    </group>
  );
}

function FrameMat({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.55}
      roughness={0.42}
      envMapIntensity={0.35}
    />
  );
}

function postPositions(width: number, depth: number, mount: MountType) {
  const x = width / 2 - POST / 2;
  const z = depth / 2 - POST / 2;
  const all: [number, number][] = [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ];
  if (mount === "wall") return all.filter(([, pz]) => pz > 0);
  if (mount === "corner") return [[x, z] as [number, number]];
  return all;
}

function Roof({
  model,
  width,
  depth,
  frameColor,
  finish,
  louvreAngle,
  louvreSide,
}: {
  model: RoofModel;
  width: number;
  depth: number;
  frameColor: string;
  finish: RoofFinish;
  louvreAngle: number;
  louvreSide: "left" | "right";
}) {
  if (model === "bioclimatic") {
    const count = Math.max(6, Math.round(depth / 0.22));
    const bladeW = width - POST * 2 - 0.08;
    const bladeD = (depth - POST * 2) / count - 0.02;
    const signed = louvreSide === "left" ? louvreAngle : -louvreAngle;
    const rad = THREE.MathUtils.degToRad(signed);
    return (
      <group>
        {Array.from({ length: count }, (_, i) => {
          const z = -depth / 2 + POST + bladeD / 2 + 0.04 + i * (bladeD + 0.02);
          return (
            <mesh key={i} position={[0, 0, z]} rotation={[rad, 0, 0]} castShadow>
              <boxGeometry args={[bladeW, 0.04, bladeD]} />
              <meshStandardMaterial
                color={finish.hex}
                metalness={0.45}
                roughness={0.48}
                envMapIntensity={0.28}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (model === "glass") {
    const spanW = width - POST * 2;
    const spanD = depth - POST * 2;
    const g = finish.glass ?? {
      color: "#cfe8f5",
      opacity: 0.5,
      transmission: 0.82,
      roughness: 0.06,
    };
    return (
      <group>
        <mesh position={[0, 0.028, 0]} receiveShadow>
          <boxGeometry args={[spanW, 0.018, spanD]} />
          <meshPhysicalMaterial
            color={g.color}
            transmission={g.transmission}
            transparent
            opacity={g.opacity}
            roughness={g.roughness}
            metalness={0.05}
            thickness={0.35}
            depthWrite={false}
          />
        </mesh>
        <RoofRafters width={width} depth={depth} frameColor={frameColor} />
      </group>
    );
  }

  if (model === "polycarbonate") {
    const spanW = width - POST * 2;
    const spanD = depth - POST * 2;
    const p = finish.poly ?? { color: "#e8f0f4", opacity: 0.72 };
    return (
      <group>
        <mesh position={[0, 0.028, 0]} castShadow receiveShadow>
          <boxGeometry args={[spanW, 0.016, spanD]} />
          <meshPhysicalMaterial
            color={p.color}
            transparent
            opacity={Math.min(p.opacity, 0.55)}
            transmission={0.35}
            roughness={0.28}
            metalness={0.02}
            thickness={0.2}
            depthWrite={false}
          />
        </mesh>
        <RoofRafters width={width} depth={depth} frameColor={frameColor} />
      </group>
    );
  }

  if (model === "thermo") {
    // 40 mm PUR sandwich on top + shared aluminum rafters below
    const spanW = width - POST * 2;
    const spanD = depth - POST * 2;
    const panelT = 0.04;
    const pitch = 0.085;
    const ribCount = Math.max(14, Math.round(spanW / pitch));
    const seamEvery = Math.max(3, Math.round(1.05 / pitch));
    const color = finish.hex;
    const face = {
      color,
      metalness: 0.22,
      roughness: 0.62,
      envMapIntensity: 0.2,
    };
    return (
      <group>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[spanW, panelT, spanD]} />
          <meshStandardMaterial {...face} />
        </mesh>
        {Array.from({ length: ribCount }, (_, i) => {
          const x = -spanW / 2 + pitch / 2 + i * ((spanW - pitch) / Math.max(ribCount - 1, 1));
          const isSeam = i % seamEvery === 0;
          // Inset from front/back so ribs don't stick out as nubs over the fascia
          const ribLen = Math.max(0.4, spanD - 0.22);
          return (
            <mesh
              key={i}
              position={[x, 0.02 + panelT / 2 + (isSeam ? 0.004 : 0.0025), 0]}
              castShadow={isSeam}
            >
              <boxGeometry
                args={[isSeam ? 0.018 : 0.012, isSeam ? 0.008 : 0.005, ribLen]}
              />
              <meshStandardMaterial
                color={isSeam ? "#2a2e32" : color}
                metalness={isSeam ? 0.35 : 0.2}
                roughness={isSeam ? 0.55 : 0.65}
              />
            </mesh>
          );
        })}
        <RoofRafters width={width} depth={depth} frameColor={frameColor} />
      </group>
    );
  }

  if (model === "carport") {
    // Alux trapézový plech: žebra podél hloubky, hustý lichoběžník, flush v rámu
    const spanW = width - POST * 2;
    const spanD = depth - POST * 2;
    const pitch = 0.155;
    const ribCount = Math.max(14, Math.round(spanW / pitch));
    const valleyH = 0.008;
    const ribH = 0.026;
    // Klasický trapéz: širší patka žebra, užší plochý hřeben
    const ribBaseW = 0.072;
    const ribCrestW = 0.038;
    const ribLen = Math.max(0.4, spanD - 0.06);
    const color = finish.hex;
    const matProps = {
      color,
      metalness: 0.62,
      roughness: 0.38,
      envMapIntensity: 0.35,
    };
    // Údolí nízko v kapse rámu — hřebeny ≈ horní hrana nosníků
    const baseY = 0.018;
    return (
      <group>
        <mesh position={[0, baseY, 0]} castShadow receiveShadow>
          <boxGeometry args={[spanW, valleyH, spanD]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {Array.from({ length: ribCount }, (_, i) => {
          const x =
            -spanW / 2 + pitch / 2 + i * ((spanW - pitch) / Math.max(ribCount - 1, 1));
          const y0 = baseY + valleyH / 2;
          return (
            <group key={i} position={[x, 0, 0]}>
              {/* tělo lichoběžníku */}
              <mesh position={[0, y0 + ribH * 0.42, 0]} castShadow>
                <boxGeometry args={[ribBaseW, ribH * 0.84, ribLen]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
              {/* plochý hřeben */}
              <mesh position={[0, y0 + ribH * 0.92, 0]} castShadow>
                <boxGeometry args={[ribCrestW, ribH * 0.2, ribLen]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
              {/* zkosené boky (jemná silueta trapézu) */}
              <mesh position={[-ribBaseW * 0.38, y0 + ribH * 0.45, 0]} rotation={[0, 0, 0.38]}>
                <boxGeometry args={[0.018, ribH * 0.75, ribLen]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
              <mesh position={[ribBaseW * 0.38, y0 + ribH * 0.45, 0]} rotation={[0, 0, -0.38]}>
                <boxGeometry args={[0.018, ribH * 0.75, ribLen]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
            </group>
          );
        })}
        <RoofRafters width={width} depth={depth} frameColor={frameColor} />
      </group>
    );
  }

  return (
    <mesh castShadow>
      <boxGeometry args={[width - POST * 2, 0.06, depth - POST * 2]} />
      <meshStandardMaterial color={finish.hex} metalness={0.2} roughness={0.55} />
    </mesh>
  );
}

function FillMaterial({ fill, color }: { fill: FillType; color: string }) {
  if (fill === "screen") {
    return (
      <meshStandardMaterial color={color} transparent opacity={0.58} roughness={0.85} metalness={0.05} />
    );
  }
  if (fill === "aluminum_blinds") {
    return <meshStandardMaterial color={color} metalness={0.7} roughness={0.28} envMapIntensity={0.4} />;
  }
  if (fill === "pur_panel") {
    // Matte sandwich panel — visually distinct from metallic blinds
    return <meshStandardMaterial color={color} roughness={0.88} metalness={0.02} />;
  }
  if (fill === "glass_frameless") {
    return (
      <meshPhysicalMaterial
        color="#e8f4fb"
        transmission={0.88}
        transparent
        opacity={0.28}
        roughness={0.04}
        thickness={0.15}
      />
    );
  }
  // glass_framed (and legacy glass)
  return (
    <meshPhysicalMaterial
      color="#d7eaf5"
      transmission={0.7}
      transparent
      opacity={0.45}
      roughness={0.08}
      thickness={0.2}
    />
  );
}

/** Perimeter frame around a side fill — sits flush with posts / beam like real kce */
function FillFrame({
  isFrontBack,
  span,
  h,
  frameColor,
}: {
  isFrontBack: boolean;
  span: number;
  h: number;
  frameColor: string;
}) {
  const t = 0.045;
  const depthT = 0.05;
  if (isFrontBack) {
    return (
      <group>
        {/* top + bottom */}
        <mesh position={[0, h / 2 - t / 2, 0]}>
          <boxGeometry args={[span, t, depthT]} />
          <FrameMat color={frameColor} />
        </mesh>
        <mesh position={[0, -h / 2 + t / 2, 0]}>
          <boxGeometry args={[span, t, depthT]} />
          <FrameMat color={frameColor} />
        </mesh>
        {/* left + right */}
        <mesh position={[-span / 2 + t / 2, 0, 0]}>
          <boxGeometry args={[t, h, depthT]} />
          <FrameMat color={frameColor} />
        </mesh>
        <mesh position={[span / 2 - t / 2, 0, 0]}>
          <boxGeometry args={[t, h, depthT]} />
          <FrameMat color={frameColor} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, h / 2 - t / 2, 0]}>
        <boxGeometry args={[depthT, t, span]} />
        <FrameMat color={frameColor} />
      </mesh>
      <mesh position={[0, -h / 2 + t / 2, 0]}>
        <boxGeometry args={[depthT, t, span]} />
        <FrameMat color={frameColor} />
      </mesh>
      <mesh position={[0, 0, -span / 2 + t / 2]}>
        <boxGeometry args={[depthT, h, t]} />
        <FrameMat color={frameColor} />
      </mesh>
      <mesh position={[0, 0, span / 2 - t / 2]}>
        <boxGeometry args={[depthT, h, t]} />
        <FrameMat color={frameColor} />
      </mesh>
    </group>
  );
}

function FillPanel({
  side,
  fill,
  width,
  depth,
  height,
  frameColor,
  fillColor,
  mount,
}: {
  side: "front" | "back" | "left" | "right";
  fill: FillType;
  width: number;
  depth: number;
  height: number;
  frameColor: string;
  fillColor: string;
  mount: MountType;
}) {
  if (fill === "none") return null;

  /**
   * Opening between post inner faces, flush with outer face of structure.
   * Corner / wall: extend fill to the house wall so no gap remains.
   */
  const beamBottom = height - BEAM;
  const botY = 0.02;
  const h = beamBottom - botY;
  const y = botY + h / 2;
  const panelT = 0.05;
  const isFrontBack = side === "front" || side === "back";
  // Overlap slightly into the wall so the joint reads as closed
  const intoWall = 0.03;

  // Default: between post inner faces
  let span = isFrontBack ? width - POST * 2 : depth - POST * 2;
  let ox = 0;
  let oz = 0;

  if (mount === "corner") {
    // Left + back are walls — front runs into left wall; right runs into back wall
    if (side === "front") {
      const left = -width / 2 - intoWall;
      const right = width / 2 - POST;
      span = right - left;
      ox = (left + right) / 2;
    } else if (side === "right") {
      const front = depth / 2 - POST;
      const back = -depth / 2 - intoWall;
      span = front - back;
      oz = (front + back) / 2;
    }
  } else if (mount === "wall") {
    // Back is house wall — side fills run flush into the back
    if (side === "left" || side === "right") {
      const front = depth / 2 - POST;
      const back = -depth / 2 - intoWall;
      span = front - back;
      oz = (front + back) / 2;
    }
  }

  // Flush with outer face of posts (same plane as outer edge of kce)
  const pos: [number, number, number] =
    side === "front"
      ? [ox, y, depth / 2 - panelT / 2]
      : side === "back"
        ? [ox, y, -depth / 2 + panelT / 2]
        : side === "left"
          ? [-width / 2 + panelT / 2, y, oz]
          : [width / 2 - panelT / 2, y, oz];

  const inset = 0.05; // clear of FillFrame rails
  const innerSpan = span - inset * 2;
  const innerH = h - inset * 2;

  if (fill === "aluminum_blinds") {
    // Visible gaps + slight tilt so blades read as louvres, not a solid wall
    const gap = 0.018;
    const count = Math.max(10, Math.round(innerH / 0.12));
    const bladeH = (innerH - gap * (count - 1)) / count;
    const tilt = THREE.MathUtils.degToRad(28);
    const bladeT = 0.012;
    return (
      <group position={pos}>
        <FillFrame isFrontBack={isFrontBack} span={span} h={h} frameColor={frameColor} />
        {Array.from({ length: count }, (_, i) => (
          <mesh
            key={i}
            position={[0, -innerH / 2 + bladeH / 2 + i * (bladeH + gap), 0]}
            rotation={isFrontBack ? [tilt, 0, 0] : [0, 0, -tilt]}
            castShadow
          >
            <boxGeometry
              args={
                isFrontBack
                  ? [innerSpan, bladeH * 0.72, bladeT]
                  : [bladeT, bladeH * 0.72, innerSpan]
              }
            />
            <FillMaterial fill={fill} color={fillColor} />
          </mesh>
        ))}
      </group>
    );
  }

  if (fill === "pur_panel") {
    // Sandwich wall: 3–4 wide matte panels with visible horizontal seams
    const seams = 3;
    const seam = 0.012;
    const panelH = (innerH - seam * seams) / (seams + 1);
    return (
      <group position={pos}>
        <FillFrame isFrontBack={isFrontBack} span={span} h={h} frameColor={frameColor} />
        {Array.from({ length: seams + 1 }, (_, i) => (
          <mesh
            key={i}
            position={[0, -innerH / 2 + panelH / 2 + i * (panelH + seam), 0]}
            castShadow
          >
            <boxGeometry
              args={
                isFrontBack
                  ? [innerSpan, panelH, panelT * 0.85]
                  : [panelT * 0.85, panelH, innerSpan]
              }
            />
            <FillMaterial fill={fill} color={fillColor} />
          </mesh>
        ))}
        {/* Dark seam strips between panels */}
        {Array.from({ length: seams }, (_, i) => (
          <mesh
            key={`seam-${i}`}
            position={[0, -innerH / 2 + panelH + seam / 2 + i * (panelH + seam), panelT * 0.15]}
          >
            <boxGeometry
              args={
                isFrontBack
                  ? [innerSpan * 0.98, seam * 0.7, panelT * 0.35]
                  : [panelT * 0.35, seam * 0.7, innerSpan * 0.98]
              }
            />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} metalness={0} />
          </mesh>
        ))}
      </group>
    );
  }

  if (fill === "glass_framed") {
    const cols = 3;
    const frameT = 0.04;
    return (
      <group position={pos}>
        <FillFrame isFrontBack={isFrontBack} span={span} h={h} frameColor={frameColor} />
        <mesh castShadow>
          <boxGeometry
            args={
              isFrontBack
                ? [innerSpan, innerH, panelT * 0.4]
                : [panelT * 0.4, innerH, innerSpan]
            }
          />
          <FillMaterial fill={fill} color={fillColor} />
        </mesh>
        {isFrontBack
          ? Array.from({ length: cols - 1 }, (_, i) => {
              const x = -innerSpan / 2 + ((i + 1) / cols) * innerSpan;
              return (
                <mesh key={i} position={[x, 0, 0]}>
                  <boxGeometry args={[frameT, innerH, panelT * 0.7]} />
                  <FrameMat color={frameColor} />
                </mesh>
              );
            })
          : Array.from({ length: cols - 1 }, (_, i) => {
              const z = -innerSpan / 2 + ((i + 1) / cols) * innerSpan;
              return (
                <mesh key={i} position={[0, 0, z]}>
                  <boxGeometry args={[panelT * 0.7, innerH, frameT]} />
                  <FrameMat color={frameColor} />
                </mesh>
              );
            })}
      </group>
    );
  }

  // screen / frameless glass — framed bay flush with kce
  return (
    <group position={pos}>
      <FillFrame isFrontBack={isFrontBack} span={span} h={h} frameColor={frameColor} />
      <mesh castShadow>
        <boxGeometry
          args={
            isFrontBack
              ? [innerSpan, innerH, panelT * (fill === "screen" ? 0.35 : 0.45)]
              : [panelT * (fill === "screen" ? 0.35 : 0.45), innerH, innerSpan]
          }
        />
        <FillMaterial fill={fill} color={fillColor} />
      </mesh>
    </group>
  );
}

/** Pick evenly spaced indices from available rafters for LED count */
function pickRafterIndices(total: number, count: number): number[] {
  if (total <= 0) return [];
  const n = Math.min(count, total);
  if (n === 1) return [Math.floor((total - 1) / 2)];
  return Array.from({ length: n }, (_, i) => Math.round((i / (n - 1)) * (total - 1)));
}

/**
 * LED placement:
 * - glass / poly / thermo / carport → along shared roof rafters
 * - bioclimatic → cross strips under louvres
 */
function Accessories3D({
  width,
  depth,
  height,
  roofY,
  frameColor,
  accessories,
}: {
  width: number;
  depth: number;
  height: number;
  roofY: number;
  frameColor: string;
  accessories: Record<AccessoryId, number>;
}) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const postX = halfW - POST / 2;
  const postZ = halfD - POST / 2;
  const qty = (id: AccessoryId) => accessories[id] ?? 0;

  const rain = qty("rain_sensor") > 0;
  const wind = qty("wind_sensor") > 0;
  const sockets = Math.min(4, qty("socket"));
  const heaters = Math.min(2, qty("heater"));
  const remote = qty("remote") > 0;

  if (!rain && !wind && sockets === 0 && heaters === 0 && !remote) return null;

  const socketPosts: [number, number][] = [
    [postX, postZ],
    [-postX, postZ],
    [postX, -postZ],
    [-postX, -postZ],
  ];

  return (
    <group>
      {rain ? (
        // Mount on top of front beam (beam center = roofY, top = roofY + BEAM/2)
        <group position={[0, roofY + BEAM / 2 + 0.018, halfD - POST / 2]}>
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.035, 0.07]} />
            <meshStandardMaterial color="#2a2d30" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.03, 0]} castShadow>
            <sphereGeometry args={[0.028, 16, 12]} />
            <meshStandardMaterial color="#1a1c1e" metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
      ) : null}

      {wind ? (
        // Sit on back-right corner of the frame, not floating over the roof bay
        <group position={[halfW - POST / 2, roofY + BEAM / 2, -halfD + POST / 2]}>
          <mesh position={[0, 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.02, 12]} />
            <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.012, 0.3, 8]} />
            <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshStandardMaterial color="#2a2d30" metalness={0.45} roughness={0.4} />
          </mesh>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.075, 0.32, Math.sin(a) * 0.075]}
                rotation={[0, -a, Math.PI / 2]}
                castShadow
              >
                <capsuleGeometry args={[0.01, 0.04, 4, 8]} />
                <meshStandardMaterial color="#3a3e42" metalness={0.35} roughness={0.5} />
              </mesh>
            );
          })}
        </group>
      ) : null}

      {Array.from({ length: sockets }, (_, i) => {
        const [px, pz] = socketPosts[i] ?? socketPosts[0];
        const outwardX = Math.sign(px) || 1;
        return (
          <group key={`sock-${i}`} position={[px - outwardX * 0.02, 1.05, pz]}>
            <mesh position={[outwardX * 0.04, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.12, 0.08]} />
              <meshStandardMaterial color="#ececec" roughness={0.55} metalness={0.05} />
            </mesh>
            <mesh position={[outwardX * 0.072, 0.02, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
              <meshStandardMaterial color="#222" roughness={0.7} />
            </mesh>
            <mesh position={[outwardX * 0.072, -0.025, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
              <meshStandardMaterial color="#222" roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: heaters }, (_, i) => {
        const n = heaters;
        const x = n === 1 ? 0 : -width * 0.22 + i * width * 0.44;
        return (
          <group key={`heat-${i}`} position={[x, roofY - 0.12, 0]}>
            <mesh castShadow>
              <boxGeometry args={[Math.min(1.35, width * 0.35), 0.07, 0.12]} />
              <meshStandardMaterial color="#1c1c1c" metalness={0.55} roughness={0.35} />
            </mesh>
            <mesh position={[0, -0.042, 0]}>
              <boxGeometry args={[Math.min(1.2, width * 0.32), 0.015, 0.08]} />
              <meshStandardMaterial
                color="#ff6a2a"
                emissive="#ff4a10"
                emissiveIntensity={0.55}
                roughness={0.4}
              />
            </mesh>
          </group>
        );
      })}

      {remote ? (
        <group position={[postX - 0.09, 1.35, postZ - 0.02]} rotation={[0, -0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.045, 0.16, 0.03]} />
            <meshStandardMaterial color="#2b2f33" metalness={0.25} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.02, 0.018]}>
            <boxGeometry args={[0.028, 0.05, 0.006]} />
            <meshStandardMaterial color="#5a9e78" emissive="#234836" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function LedStrips({
  model,
  width,
  depth,
  roofY,
  ledCount,
  ledTemp,
  nightMode,
}: {
  model: RoofModel;
  width: number;
  depth: number;
  roofY: number;
  ledCount: number;
  ledTemp: LedTemp;
  nightMode: boolean;
}) {
  const temp = ledTempOptions.find((t) => t.id === ledTemp) ?? ledTempOptions[0];
  const glow = nightMode ? 2.8 : 1.6;
  const lightI = nightMode ? 1.35 : 0.75;
  const lightDist = nightMode ? 5.5 : 4;
  // Flush under shared rafters (Roof group at roofY+0.02, rafter at RAFTER_Y)
  const stripY = roofY + 0.02 + RAFTER_Y - RAFTER_H / 2 - 0.01;
  const lightY = stripY - 0.1;
  const alongRafters = model !== "bioclimatic";

  if (alongRafters) {
    const xs = rafterXs(width);
    const indices = pickRafterIndices(xs.length, ledCount);
    const stripLen = depth - POST * 2 - 0.2;
    return (
      <group>
        {indices.map((idx) => {
          const x = xs[idx]!;
          return (
            <group key={idx}>
              <mesh position={[x, stripY, 0]}>
                <boxGeometry args={[0.028, 0.014, stripLen]} />
                <meshStandardMaterial
                  color={temp.hex}
                  emissive={temp.emissive}
                  emissiveIntensity={glow}
                  toneMapped={false}
                />
              </mesh>
              <group position={[x, lightY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <spotLight
                  intensity={lightI * 2.2}
                  distance={lightDist}
                  angle={0.85}
                  penumbra={0.55}
                  decay={2}
                  color={temp.emissive}
                />
              </group>
            </group>
          );
        })}
      </group>
    );
  }

  // Bioclimatic — cross strips under louvres
  const spanZ = depth - POST * 2 - 0.25;
  const stripW = width - POST * 2 - 0.25;
  const bioStripY = roofY - 0.025;
  return (
    <group>
      {Array.from({ length: ledCount }, (_, i) => {
        const z =
          ledCount === 1 ? 0 : -spanZ / 2 + (i / (ledCount - 1)) * spanZ;
        return (
          <group key={i}>
            <mesh position={[0, bioStripY, z]}>
              <boxGeometry args={[stripW, 0.016, 0.04]} />
              <meshStandardMaterial
                color={temp.hex}
                emissive={temp.emissive}
                emissiveIntensity={glow}
                toneMapped={false}
              />
            </mesh>
            <group position={[0, bioStripY - 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <spotLight
                intensity={lightI * 2.2}
                distance={lightDist}
                angle={0.9}
                penumbra={0.5}
                decay={2}
                color={temp.emissive}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
}

/** Thin side wall for corner mount — full pergola depth */
function CornerPartition({ width, depth, height }: { width: number; depth: number; height: number }) {
  const wallH = Math.max(height + 0.35, 3.1);
  const thickness = 0.12;
  // Flush to outer left face of the frame (no visible air gap)
  return (
    <mesh
      position={[-width / 2 - thickness / 2 + 0.005, wallH / 2, -0.02]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[thickness, wallH, depth + 0.25]} />
      <meshStandardMaterial color={PARTITION} roughness={0.96} metalness={0} />
    </mesh>
  );
}

export function PergolaModel({
  studio = false,
  fillsOverride,
}: {
  /** Clean product shot without house / labels / placement UI */
  studio?: boolean;
  fillsOverride?: Partial<Record<"front" | "back" | "left" | "right", FillType>>;
} = {}) {
  const {
    model,
    mount,
    width,
    depth,
    height,
    originX,
    setback,
    louvreAngle,
    louvreSide,
    frameColor,
    roofFinishId,
    fills,
    fillColor,
    lighting,
    ledCount,
    ledTemp,
    nightMode,
    accessoriesEnabled,
    accessories,
  } = useConfig();

  const activeFills = {
    front: fillsOverride?.front ?? fills.front,
    back: fillsOverride?.back ?? fills.back,
    left: fillsOverride?.left ?? fills.left,
    right: fillsOverride?.right ?? fills.right,
  };

  const studioMount: MountType = studio ? "freestanding" : mount;
  const posts = useMemo(
    () => postPositions(width, depth, studioMount),
    [width, depth, studioMount],
  );
  const roofFinish = useMemo(
    () => getRoofFinish(model, roofFinishId),
    [model, roofFinishId],
  );
  const roofY = height - BEAM / 2;
  const halfW = width / 2;
  const halfD = depth / 2;

  // House stays put; freestanding can slide farther from the wall
  const gap = mount === "freestanding" ? setback : WALL_SETBACK;
  const productZ = studio ? 0 : HOUSE_FRONT_Z + gap + depth / 2;
  const posX = studio ? 0 : originX;
  const groundY = studio ? 0 : TERRAIN_TOP_Y;

  return (
    <group>
      {!studio ? <Context /> : null}

      <group position={[posX, groundY, productZ]}>
        <WoodenDeck width={width} depth={depth} />
        {!studio ? <PlacementHandle /> : null}

        {/* Structure sits on top of the wooden deck */}
        <group position={[0, DECK_HEIGHT, 0]}>
          {!studio ? <SideLabels /> : null}

          {!studio ? (
            <>
              <Text
                position={[-halfW - 0.75, 0.02, 0]}
                rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                fontSize={0.2}
                color="#7a7a76"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.04}
              >
                Levá
              </Text>
              <Text
                position={[halfW + 0.75, 0.02, 0]}
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                fontSize={0.2}
                color="#7a7a76"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.04}
              >
                Pravá
              </Text>
              <Text
                position={[0, 0.02, halfD + 0.75]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.2}
                color="#7a7a76"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.04}
              >
                Přední
              </Text>
              <Text
                position={[0, 0.02, -halfD - 0.75]}
                rotation={[-Math.PI / 2, 0, Math.PI]}
                fontSize={0.2}
                color="#7a7a76"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.04}
              >
                Zadní
              </Text>
            </>
          ) : null}

          {!studio && mount === "corner" ? (
            <CornerPartition width={width} depth={depth} height={height} />
          ) : null}

          {/* Posts stop flush with beam tops — no corner stubs above the roof */}
          {posts.map(([x, z], i) => (
            <mesh key={i} position={[x, (height - 0.01) / 2, z]} castShadow receiveShadow>
              <boxGeometry args={[POST, height - 0.01, POST]} />
              <FrameMat color={frameColor} />
            </mesh>
          ))}

          <mesh position={[0, roofY, -depth / 2 + POST / 2]} castShadow>
            <boxGeometry args={[width, BEAM, POST]} />
            <FrameMat color={frameColor} />
          </mesh>
          <mesh position={[0, roofY, depth / 2 - POST / 2]} castShadow>
            <boxGeometry args={[width, BEAM, POST]} />
            <FrameMat color={frameColor} />
          </mesh>
          <mesh position={[-width / 2 + POST / 2, roofY, 0]} castShadow>
            <boxGeometry args={[POST, BEAM, depth]} />
            <FrameMat color={frameColor} />
          </mesh>
          <mesh position={[width / 2 - POST / 2, roofY, 0]} castShadow>
            <boxGeometry args={[POST, BEAM, depth]} />
            <FrameMat color={frameColor} />
          </mesh>

          {/* Roof sits on the beams — no extra cap strips above the fascia */}
          <group position={[0, roofY + 0.02, 0]}>
            <Roof
              model={model}
              width={width}
              depth={depth}
              frameColor={frameColor}
              finish={roofFinish}
              louvreAngle={louvreAngle}
              louvreSide={louvreSide}
            />
          </group>

          {(Object.keys(activeFills) as (keyof typeof activeFills)[]).map((side) => (
            <FillPanel
              key={side}
              side={side}
              fill={activeFills[side]}
              width={width}
              depth={depth}
              height={height}
              frameColor={frameColor}
              fillColor={fillColor}
              mount={studioMount}
            />
          ))}

          {!studio && accessoriesEnabled ? (
            <Accessories3D
              width={width}
              depth={depth}
              height={height}
              roofY={roofY}
              frameColor={frameColor}
              accessories={accessories}
            />
          ) : null}

          {!studio && lighting === "led" ? (
            <LedStrips
              model={model}
              width={width}
              depth={depth}
              roofY={roofY}
              ledCount={ledCount}
              ledTemp={ledTemp}
              nightMode={nightMode}
            />
          ) : null}
        </group>
      </group>
    </group>
  );
}
