"use client";

import { useMemo } from "react";

/** Visible plank thickness — posts sit on top of this */
export const DECK_HEIGHT = 0.07;

const PLANK_W = 0.16;
const GAP = 0.01;
const OVERHANG = 0.18;

const WOOD = ["#c9a56a", "#b89050", "#d4b078", "#a88248", "#c4a060", "#b89858"] as const;

/**
 * Wooden deck under the pergola — clear planks sitting ON the terrain.
 * Top face is at y = DECK_HEIGHT so posts can rest on it.
 */
export function WoodenDeck({ width, depth }: { width: number; depth: number }) {
  const planks = useMemo(() => {
    const deckW = width + OVERHANG * 2;
    const deckD = depth + OVERHANG * 2;
    const step = PLANK_W + GAP;
    const count = Math.max(3, Math.ceil(deckW / step));
    const used = count * PLANK_W + (count - 1) * GAP;
    const startX = -used / 2 + PLANK_W / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * step,
      w: PLANK_W,
      d: deckD,
      color: WOOD[i % WOOD.length],
      // slight height variation so seams catch light
      h: DECK_HEIGHT + (i % 4 === 0 ? 0.003 : 0),
    }));
  }, [width, depth]);

  const rimW = width + OVERHANG * 2 + 0.06;
  const rimD = depth + OVERHANG * 2 + 0.06;

  return (
    <group>
      {/* Dark subframe under planks */}
      <mesh position={[0, DECK_HEIGHT * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[rimW, DECK_HEIGHT * 0.7, rimD]} />
        <meshStandardMaterial color="#6e5638" roughness={0.92} metalness={0.02} />
      </mesh>

      {planks.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.h / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.78}
            metalness={0.05}
            envMapIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Front end-grain strip */}
      {planks.map((p, i) => (
        <mesh
          key={`f-${i}`}
          position={[p.x, p.h / 2, depth / 2 + OVERHANG - 0.008]}
        >
          <boxGeometry args={[p.w * 0.94, p.h * 0.9, 0.014]} />
          <meshStandardMaterial color="#8f7348" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
