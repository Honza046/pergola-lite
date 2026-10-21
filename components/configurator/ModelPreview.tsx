"use client";

import type { RoofModel } from "@/types/config";

/**
 * Universal corner close-up — Alux-style crop of post + roof junction.
 * Swap later via `models[].image` for real company photos.
 */
export function ModelPreview({ id }: { id: RoofModel }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[#eceff2]" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="#eceff2" />

        {/* Soft floor / wall hint */}
        <rect x="0" y="88" width="120" height="32" fill="#e2e5e9" />
        <path d="M0 88 L120 72 L120 120 L0 120 Z" fill="#d8dce0" opacity="0.55" />

        {/* Vertical post (front-left corner, low angle) */}
        <path d="M22 118 L22 42 L34 36 L34 112 Z" fill="#2c3135" />
        <path d="M34 36 L42 40 L42 116 L34 112 Z" fill="#3a4045" />

        {/* Horizontal front beam */}
        <path d="M22 42 L108 28 L108 38 L22 52 Z" fill="#2c3135" />
        <path d="M108 28 L114 32 L114 42 L108 38 Z" fill="#3a4045" />

        {/* Side beam going back */}
        <path d="M34 36 L78 18 L86 22 L42 40 Z" fill="#34393e" />

        {/* Roof material by type — fills the upper corner */}
        <RoofCorner id={id} />

        {/* Tiny highlight on post edge */}
        <path d="M33.2 40 L33.2 110" stroke="#5a6066" strokeWidth="0.7" opacity="0.5" />
      </svg>
    </div>
  );
}

function RoofCorner({ id }: { id: RoofModel }) {
  // Roof plane sits above the beams, perspective into the corner
  if (id === "bioclimatic") {
    return (
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const t = i / 8;
          const x1 = 36 + t * 8;
          const y1 = 34 - t * 14;
          return (
            <path
              key={i}
              d={`M${x1} ${y1} L${108 - t * 4} ${y1 - 10} L${108 - t * 4} ${y1 - 7.5} L${x1} ${y1 + 2.5} Z`}
              fill={i % 2 === 0 ? "#1f2326" : "#2a2f33"}
            />
          );
        })}
      </g>
    );
  }

  if (id === "glass") {
    return (
      <g>
        <path d="M36 34 L108 18 L108 34 L36 48 Z" fill="#9fd0ea" opacity="0.55" />
        <path d="M36 34 L108 18 L108 34 L36 48 Z" fill="none" stroke="#2c3135" strokeWidth="1" />
        {/* Internal rafters */}
        <path d="M52 31 L100 20" stroke="#2c3135" strokeWidth="1.2" opacity="0.7" />
        <path d="M68 28 L108 19" stroke="#2c3135" strokeWidth="1.2" opacity="0.7" />
        <path d="M84 25 L108 20" stroke="#2c3135" strokeWidth="1.2" opacity="0.55" />
        <path d="M44 30 L70 22" stroke="#fff" strokeWidth="1" opacity="0.45" />
      </g>
    );
  }

  if (id === "polycarbonate") {
    return (
      <g>
        {Array.from({ length: 8 }, (_, i) => {
          const t0 = i / 8;
          const t1 = (i + 1) / 8;
          const x0 = 36 + t0 * 72;
          const x1 = 36 + t1 * 72;
          const yTop0 = 34 - t0 * 16;
          const yTop1 = 34 - t1 * 16;
          const yBot0 = 48 - t0 * 14;
          const yBot1 = 48 - t1 * 14;
          return (
            <path
              key={i}
              d={`M${x0} ${yTop0} L${x1} ${yTop1} L${x1} ${yBot1} L${x0} ${yBot0} Z`}
              fill={i % 2 === 0 ? "#d5e0ea" : "#c0cedc"}
              stroke="#2c3135"
              strokeWidth="0.5"
            />
          );
        })}
      </g>
    );
  }

  if (id === "thermo") {
    return (
      <g>
        <path d="M36 34 L108 18 L108 36 L36 50 Z" fill="#3a4045" />
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d={`M${40 + i * 12} ${36 - i * 2.2} L${104} ${20 + i * 0.4}`}
            stroke="#4e555b"
            strokeWidth="1.4"
          />
        ))}
        <path d="M36 34 L108 18 L108 36 L36 50 Z" fill="none" stroke="#2c3135" strokeWidth="0.8" />
      </g>
    );
  }

  // carport — trapezoidal sheet
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const y = 28 + i * 3.2;
        return (
          <path
            key={i}
            d={`M38 ${y} l10 -2.2 10 2.2 10 -2.2 10 2.2 10 -2.2 10 2.2 10 -2.2`}
            fill="none"
            stroke="#2c3135"
            strokeWidth="1.6"
          />
        );
      })}
      <path d="M36 34 L108 18" stroke="#2c3135" strokeWidth="1" opacity="0.4" />
    </g>
  );
}
