"use client";

import { Html } from "@react-three/drei";

import { useConfig } from "@/lib/store";

function fmt(v: number) {
  const n = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1).replace(".", ",");
  return `${n}m`;
}

function DimBadge({
  position,
  children,
}: {
  position: [number, number, number];
  children: string;
}) {
  return (
    <Html position={position} center occlude style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
      <div
        style={{
          background: "#fff",
          color: "#111",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.01em",
          padding: "5px 10px",
          borderRadius: 6,
          boxShadow: "0 2px 10px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Thin dimension stem with Alux-style end ticks */
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

  // Vertical (height)
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
    return (
      <group>
        <mesh position={[mx, my, mz]}>
          <boxGeometry args={[0.012, len, 0.012]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        {/* End ticks — horizontal */}
        <mesh position={[from[0], from[1], from[2]]}>
          <boxGeometry args={[tick, 0.012, 0.012]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[to[0], to[1], to[2]]}>
          <boxGeometry args={[tick, 0.012, 0.012]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>
    );
  }

  // Horizontal in XZ
  const angle = Math.atan2(dx, dz);
  const alongX = Math.abs(dx) >= Math.abs(dz);
  return (
    <group>
      <mesh position={[mx, my, mz]} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.012, 0.012, len]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      {/* End ticks perpendicular to stem */}
      <mesh position={[from[0], from[1], from[2]]} rotation={[0, angle, 0]}>
        <boxGeometry args={alongX ? [0.012, 0.012, tick] : [tick, 0.012, 0.012]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      <mesh position={[to[0], to[1], to[2]]} rotation={[0, angle, 0]}>
        <boxGeometry args={alongX ? [0.012, 0.012, tick] : [tick, 0.012, 0.012]} />
        <meshBasicMaterial color="#222" />
      </mesh>
    </group>
  );
}

export function SideLabels() {
  const { width, depth, height } = useConfig();
  const halfW = width / 2;
  const halfD = depth / 2;

  // Height line clear of the post (left + slightly forward)
  const hx = -halfW - 0.58;
  const hz = halfD + 0.12;

  return (
    <group>
      {/* Width — front */}
      <DimStem from={[-halfW, 0.04, halfD + 0.48]} to={[halfW, 0.04, halfD + 0.48]} />
      <DimBadge position={[0, 0.24, halfD + 0.72]}>{fmt(width)}</DimBadge>

      {/* Depth — right */}
      <DimStem from={[halfW + 0.48, 0.04, -halfD]} to={[halfW + 0.48, 0.04, halfD]} />
      <DimBadge position={[halfW + 0.78, 0.24, 0]}>{fmt(depth)}</DimBadge>

      {/* Height — outside left front post, not through it */}
      <DimStem from={[hx, 0.04, hz]} to={[hx, height, hz]} />
      <DimBadge position={[hx - 0.28, height / 2, hz]}>{fmt(height)}</DimBadge>
    </group>
  );
}
