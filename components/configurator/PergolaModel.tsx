"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { Context, HOUSE_FRONT_Z } from "@/components/configurator/Context";
import { TERRAIN_TOP_Y } from "@/components/configurator/Platform";
import { SideLabels } from "@/components/configurator/SideLabels";
import { DECK_HEIGHT, WoodenDeck } from "@/components/configurator/WoodenDeck";
import { useConfig } from "@/lib/store";
import type { FillType, MountType, RoofModel } from "@/types/config";

const POST = 0.15;
const BEAM = 0.16;
const PARTITION = "#f0f0ed";

/** Gap from fixed house front → product moves, house stays */
function mountGap(mount: MountType) {
  if (mount === "freestanding") return 0.45;
  return 0.05;
}

function FrameMat({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.82}
      roughness={0.22}
      envMapIntensity={1.15}
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
  louvreColor,
  louvreAngle,
}: {
  model: RoofModel;
  width: number;
  depth: number;
  frameColor: string;
  louvreColor: string;
  louvreAngle: number;
}) {
  if (model === "bioclimatic") {
    const count = Math.max(6, Math.round(depth / 0.22));
    const bladeW = width - POST * 2 - 0.08;
    const bladeD = (depth - POST * 2) / count - 0.02;
    const rad = THREE.MathUtils.degToRad(louvreAngle);
    return (
      <group>
        {Array.from({ length: count }, (_, i) => {
          const z = -depth / 2 + POST + bladeD / 2 + 0.04 + i * (bladeD + 0.02);
          return (
            <mesh key={i} position={[0, 0, z]} rotation={[rad, 0, 0]} castShadow>
              <boxGeometry args={[bladeW, 0.04, bladeD]} />
              <meshStandardMaterial
                color={louvreColor}
                metalness={0.78}
                roughness={0.24}
                envMapIntensity={1.0}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (model === "glass") {
    return (
      <mesh castShadow>
        <boxGeometry args={[width - POST * 2, 0.02, depth - POST * 2]} />
        <meshPhysicalMaterial
          color="#cfe8f5"
          transmission={0.85}
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.1}
          thickness={0.4}
        />
      </mesh>
    );
  }

  if (model === "polycarbonate") {
    const ribs = Math.max(8, Math.round(width / 0.35));
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[width - POST * 2, 0.03, depth - POST * 2]} />
          <meshStandardMaterial color="#e8f0f4" transparent opacity={0.72} roughness={0.4} />
        </mesh>
        {Array.from({ length: ribs }, (_, i) => {
          const x = -width / 2 + POST + 0.1 + (i / (ribs - 1)) * (width - POST * 2 - 0.2);
          return (
            <mesh key={i} position={[x, 0.01, 0]}>
              <boxGeometry args={[0.02, 0.04, depth - POST * 2]} />
              <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.35} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (model === "carport") {
    return (
      <group>
        {Array.from({ length: 7 }, (_, i) => {
          const z = -depth / 2 + POST + 0.15 + (i / 6) * (depth - POST * 2 - 0.3);
          return (
            <mesh key={i} position={[0, (i % 2) * 0.03, z]} castShadow>
              <boxGeometry args={[width - POST * 2, 0.025, 0.28]} />
              <meshStandardMaterial color={louvreColor} metalness={0.55} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <mesh castShadow>
      <boxGeometry args={[width - POST * 2, 0.06, depth - POST * 2]} />
      <meshStandardMaterial color={louvreColor} metalness={0.2} roughness={0.55} />
    </mesh>
  );
}

function FillPanel({
  side,
  fill,
  width,
  depth,
  height,
}: {
  side: "front" | "back" | "left" | "right";
  fill: FillType;
  width: number;
  depth: number;
  height: number;
}) {
  if (fill === "none") return null;

  const h = height - BEAM - 0.15;
  const y = h / 2 + 0.05;
  const mat =
    fill === "screen" ? (
      <meshStandardMaterial color="#2a2f33" transparent opacity={0.55} roughness={0.85} />
    ) : (
      <meshPhysicalMaterial
        color="#d7eaf5"
        transmission={0.7}
        transparent
        opacity={0.45}
        roughness={0.08}
        thickness={0.2}
      />
    );

  if (side === "front") {
    return (
      <mesh position={[0, y, depth / 2 - 0.04]} castShadow>
        <boxGeometry args={[width - POST * 2 - 0.05, h, 0.03]} />
        {mat}
      </mesh>
    );
  }
  if (side === "back") {
    return (
      <mesh position={[0, y, -depth / 2 + 0.04]} castShadow>
        <boxGeometry args={[width - POST * 2 - 0.05, h, 0.03]} />
        {mat}
      </mesh>
    );
  }
  if (side === "left") {
    return (
      <mesh position={[-width / 2 + 0.04, y, 0]} castShadow>
        <boxGeometry args={[0.03, h, depth - POST * 2 - 0.05]} />
        {mat}
      </mesh>
    );
  }
  return (
    <mesh position={[width / 2 - 0.04, y, 0]} castShadow>
      <boxGeometry args={[0.03, h, depth - POST * 2 - 0.05]} />
      {mat}
    </mesh>
  );
}

/** Thin side wall for corner mount — full pergola depth */
function CornerPartition({ width, depth, height }: { width: number; depth: number; height: number }) {
  const wallH = Math.max(height + 0.35, 3.1);
  const thickness = 0.1;
  return (
    <mesh
      position={[-width / 2 - thickness / 2 - 0.02, wallH / 2, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[thickness, wallH, depth + 0.15]} />
      <meshStandardMaterial color={PARTITION} roughness={0.96} metalness={0} />
    </mesh>
  );
}

export function PergolaModel() {
  const {
    model,
    mount,
    width,
    depth,
    height,
    originX,
    louvreAngle,
    frameColor,
    louvreColor,
    fills,
    lighting,
  } = useConfig();

  const posts = useMemo(() => postPositions(width, depth, mount), [width, depth, mount]);
  const roofY = height - BEAM / 2;
  const halfW = width / 2;
  const halfD = depth / 2;

  // House stays put; pergola slides toward / away from HOUSE_FRONT_Z
  const productZ = HOUSE_FRONT_Z + mountGap(mount) + depth / 2;

  return (
    <group>
      <Context />

      <group position={[originX, TERRAIN_TOP_Y, productZ]}>
        <WoodenDeck width={width} depth={depth} />

        {/* Structure sits on top of the wooden deck */}
        <group position={[0, DECK_HEIGHT, 0]}>
          <SideLabels />

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

          {mount === "corner" ? (
            <CornerPartition width={width} depth={depth} height={height} />
          ) : null}

          {posts.map(([x, z], i) => (
            <mesh key={i} position={[x, height / 2, z]} castShadow receiveShadow>
              <boxGeometry args={[POST, height, POST]} />
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

          <mesh position={[0, roofY + BEAM / 2 + 0.02, depth / 2 - POST / 2]} castShadow>
            <boxGeometry args={[width + 0.04, 0.04, 0.06]} />
            <FrameMat color={frameColor} />
          </mesh>
          <mesh position={[0, roofY + BEAM / 2 + 0.02, -depth / 2 + POST / 2]} castShadow>
            <boxGeometry args={[width + 0.04, 0.04, 0.06]} />
            <FrameMat color={frameColor} />
          </mesh>

          <group position={[0, roofY + 0.04, 0]}>
            <Roof
              model={model}
              width={width}
              depth={depth}
              frameColor={frameColor}
              louvreColor={louvreColor}
              louvreAngle={louvreAngle}
            />
          </group>

          {(Object.keys(fills) as (keyof typeof fills)[]).map((side) => (
            <FillPanel
              key={side}
              side={side}
              fill={fills[side]}
              width={width}
              depth={depth}
              height={height}
            />
          ))}

          {lighting === "led" ? (
            <mesh position={[0, roofY - 0.06, 0]}>
              <boxGeometry args={[width - POST * 2 - 0.2, 0.02, depth - POST * 2 - 0.2]} />
              <meshStandardMaterial color="#fff6d8" emissive="#ffe9a8" emissiveIntensity={1.4} />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  );
}
