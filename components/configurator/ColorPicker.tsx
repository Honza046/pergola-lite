"use client";

import { useMemo, useState } from "react";

import {
  featuredFrameColors,
  frameColorFamilies,
  getRoofFinish,
  roofFinishesByModel,
  roofSectionTitle,
  type Swatch,
} from "@/lib/colors";
import { cn } from "@/lib/cn";
import { useConfig } from "@/lib/store";
import type { RoofModel } from "@/types/config";

const PAGE = 10;

function SwatchButton({
  swatch,
  active,
  onClick,
  size = "md",
  rainbow,
}: {
  swatch?: Swatch;
  active: boolean;
  onClick: () => void;
  size?: "md" | "lg";
  rainbow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 transition",
        size === "lg" ? "size-11" : "size-9",
        active ? "border-[#234836] scale-105" : "border-white ring-1 ring-black/10",
      )}
      style={
        rainbow
          ? {
              background:
                "conic-gradient(#f0c000, #e67e22, #c0392b, #8e44ad, #2980b9, #27ae60, #95a5a6, #8b5a2b, #f0c000)",
            }
          : { backgroundColor: swatch?.hex }
      }
    />
  );
}

function FrameColorPicker() {
  const frameColor = useConfig((s) => s.frameColor);
  const setFrameColor = useConfig((s) => s.setFrameColor);

  const featuredMatch = featuredFrameColors.some((c) => c.hex === frameColor);
  const [customOpen, setCustomOpen] = useState(!featuredMatch);
  const [familyId, setFamilyId] = useState(() => {
    for (const f of frameColorFamilies) {
      if (f.shades.some((s) => s.hex === frameColor)) return f.id;
    }
    return "blue";
  });
  const [page, setPage] = useState(0);

  const family = frameColorFamilies.find((f) => f.id === familyId) ?? frameColorFamilies[0];
  const pages = Math.max(1, Math.ceil(family.shades.length / PAGE));
  const pageShades = useMemo(
    () => family.shades.slice(page * PAGE, page * PAGE + PAGE),
    [family, page],
  );

  return (
    <div>
      <p className="mb-2 text-xs text-muted">Konstrukce</p>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {featuredFrameColors.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <SwatchButton
              swatch={c}
              size="lg"
              active={!customOpen && frameColor === c.hex}
              onClick={() => {
                setCustomOpen(false);
                setFrameColor(c.hex);
              }}
            />
            <span className="max-w-16 text-center text-[10px] leading-tight text-muted">
              {c.label}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <SwatchButton
            size="lg"
            rainbow
            active={customOpen}
            onClick={() => setCustomOpen(true)}
          />
          <span className="max-w-16 text-center text-[10px] leading-tight text-muted">Vlastní</span>
        </div>
      </div>

      {customOpen ? (
        <div className="rounded-md border border-line bg-[#fafafa] p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {frameColorFamilies.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFamilyId(f.id);
                  setPage(0);
                }}
                className={cn(
                  "size-7 rounded-full border-2 transition",
                  familyId === f.id ? "border-[#234836]" : "border-white ring-1 ring-black/10",
                )}
                style={{ backgroundColor: f.hex }}
              />
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {pageShades.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFrameColor(s.hex)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "size-9 rounded-full border-2",
                    frameColor === s.hex ? "border-[#234836]" : "border-white ring-1 ring-black/10",
                  )}
                  style={{ backgroundColor: s.hex }}
                />
                <span className="text-[10px] tabular-nums text-muted">{s.label}</span>
              </button>
            ))}
          </div>

          {pages > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted">
              <button
                type="button"
                className="px-1 hover:text-ink disabled:opacity-30"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={cn(
                    "min-w-5 px-1",
                    page === i ? "font-semibold text-ink" : "hover:text-ink",
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="px-1 hover:text-ink disabled:opacity-30"
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
              <span className="ml-1 tabular-nums">
                {page + 1}/{pages}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RoofColorPicker({ model }: { model: RoofModel }) {
  const roofFinishId = useConfig((s) => s.roofFinishId);
  const setRoofFinishId = useConfig((s) => s.setRoofFinishId);
  const finishes = roofFinishesByModel[model];
  const active = getRoofFinish(model, roofFinishId);

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs text-muted">{roofSectionTitle(model)}</p>
      <div className="flex flex-wrap gap-3">
        {finishes.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setRoofFinishId(f.id)}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                "size-9 rounded-full border-2",
                active.id === f.id ? "border-[#234836] scale-105" : "border-white ring-1 ring-black/10",
              )}
              style={{
                backgroundColor: f.hex,
                backgroundImage:
                  f.id === "clear" || f.id === "extra-clear"
                    ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(180,210,230,0.5))"
                    : undefined,
              }}
            />
            <span className="max-w-16 text-center text-[10px] leading-tight text-muted">
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FillColorPicker() {
  const fills = useConfig((s) => s.fills);
  const fillColor = useConfig((s) => s.fillColor);
  const setFillColor = useConfig((s) => s.setFillColor);
  const frameColor = useConfig((s) => s.frameColor);

  const needsColor = Object.values(fills).some(
    (f) => f === "aluminum_blinds" || f === "screen" || f === "pur_panel",
  );

  const featuredMatch = featuredFrameColors.some((c) => c.hex === fillColor);
  const [customOpen, setCustomOpen] = useState(!featuredMatch);
  const [familyId, setFamilyId] = useState(() => {
    for (const f of frameColorFamilies) {
      if (f.shades.some((s) => s.hex === fillColor)) return f.id;
    }
    return "grey";
  });
  const [page, setPage] = useState(0);

  const family = frameColorFamilies.find((f) => f.id === familyId) ?? frameColorFamilies[0];
  const pages = Math.max(1, Math.ceil(family.shades.length / PAGE));
  const pageShades = useMemo(
    () => family.shades.slice(page * PAGE, page * PAGE + PAGE),
    [family, page],
  );

  if (!needsColor) return null;

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs text-muted">Výplně (žaluzie / screen / PUR)</p>
      <div className="mb-3 flex flex-wrap items-start gap-3">
        {featuredFrameColors.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <SwatchButton
              swatch={c}
              active={!customOpen && fillColor === c.hex}
              onClick={() => {
                setFillColor(c.hex);
                setCustomOpen(false);
              }}
            />
            <span className="max-w-14 text-center text-[10px] leading-tight text-muted">
              {c.label}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <SwatchButton
            active={customOpen}
            rainbow
            onClick={() => setCustomOpen(true)}
          />
          <span className="text-[10px] text-muted">Vlastní</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <SwatchButton
            swatch={{ id: "as-frame", hex: frameColor, label: "Jako konstrukce" }}
            active={!customOpen && fillColor === frameColor}
            onClick={() => {
              setFillColor(frameColor);
              setCustomOpen(false);
            }}
          />
          <span className="max-w-16 text-center text-[10px] leading-tight text-muted">
            Jako konstrukce
          </span>
        </div>
      </div>

      {customOpen ? (
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {frameColorFamilies.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFamilyId(f.id);
                  setPage(0);
                }}
                className={cn(
                  "size-7 rounded-full border-2",
                  familyId === f.id ? "border-[#234836]" : "border-white ring-1 ring-black/10",
                )}
                style={{ backgroundColor: f.hex }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {pageShades.map((s) => (
              <SwatchButton
                key={s.id}
                swatch={s}
                size="md"
                active={fillColor === s.hex}
                onClick={() => setFillColor(s.hex)}
              />
            ))}
          </div>
          {pages > 1 ? (
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="disabled:opacity-30"
              >
                ←
              </button>
              <span>
                {page + 1}/{pages}
              </span>
              <button
                type="button"
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                className="disabled:opacity-30"
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ColorSection() {
  const model = useConfig((s) => s.model);
  return (
    <div>
      <FrameColorPicker />
      <RoofColorPicker model={model} />
      <FillColorPicker />
    </div>
  );
}
