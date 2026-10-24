"use client";

import { useEffect, useMemo, useState } from "react";

import { FillPreview } from "@/components/configurator/FillPreview";
import { blockedFillSides, fills, sides } from "@/lib/catalog";
import { useConfig } from "@/lib/store";
import { selCard } from "@/lib/ui";
import type { FillType, SideId } from "@/types/config";

function SideGlyph({ side, active, blocked }: { side: SideId; active: boolean; blocked: boolean }) {
  const stroke = blocked ? "#c5c5c5" : active ? "#234836" : "#6b6560";
  const edge =
    side === "front"
      ? "M8 28 H32"
      : side === "back"
        ? "M8 8 H32"
        : side === "left"
          ? "M8 8 V28"
          : "M32 8 V28";
  return (
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
      <rect x="8" y="8" width="24" height="20" fill="none" stroke="#cfd4da" strokeWidth="1.5" />
      <path d={edge} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="square" />
    </svg>
  );
}

function FillModal({ side, onClose }: { side: SideId; onClose: () => void }) {
  const current = useConfig((s) => s.fills[side]);
  const setFill = useConfig((s) => s.setFill);
  const [picked, setPicked] = useState<FillType>(current);
  const sideTitle = sides.find((s) => s.id === side)?.title ?? side;
  const preview = fills.find((f) => f.id === picked) ?? fills[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        onKeyDown={() => {}}
        role="presentation"
      />
      <div className="relative z-10 flex w-full max-w-[920px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
          <h3 className="text-sm font-semibold text-ink">Vyberte možnost · {sideTitle}</h3>
          <button
            type="button"
            aria-label="Zavřít"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md text-lg leading-none text-muted hover:bg-black/5"
          >
            ×
          </button>
        </div>

        <div className="grid gap-0 sm:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]">
          <div className="grid content-start gap-1.5 p-2.5">
            {fills.map((opt) => {
              const active = picked === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPicked(opt.id)}
                  title={opt.description}
                  className={selCard(active, "flex items-center gap-2.5 px-2 py-1.5 text-left")}
                >
                  <span
                    className="shrink-0 overflow-hidden rounded-sm bg-[#f3f4f6]"
                    style={{ width: 40, height: 40 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={opt.image}
                      alt=""
                      className="h-full w-full object-contain"
                      style={{ maxWidth: 40, maxHeight: 40 }}
                    />
                  </span>
                  <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
                    {opt.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex min-h-[320px] flex-col border-t border-line bg-[#f7f7f5] p-3 sm:min-h-[380px] sm:border-l sm:border-t-0">
            <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-md bg-[#e8e6e1] sm:min-h-[300px]">
              <FillPreview side={side} fill={picked} />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-ink">{preview.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{preview.description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-3 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md bg-[#ececec] px-3.5 text-sm font-medium text-ink hover:bg-[#e2e2e2]"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={() => {
              setFill(side, picked);
              onClose();
            }}
            className="h-9 rounded-md bg-forest px-3.5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Potvrdit
          </button>
        </div>
      </div>
    </div>
  );
}

export function FillSection() {
  const mount = useConfig((s) => s.mount);
  const fillMap = useConfig((s) => s.fills);
  const [activeSide, setActiveSide] = useState<SideId>("front");
  const [modalSide, setModalSide] = useState<SideId | null>(null);

  const blocked = useMemo(() => new Set(blockedFillSides(mount)), [mount]);

  useEffect(() => {
    if (blocked.has(activeSide)) {
      const first = sides.find((s) => !blocked.has(s.id));
      if (first) setActiveSide(first.id);
    }
  }, [mount, blocked, activeSide]);

  const selectable = sides.filter((s) => !blocked.has(s.id));
  const activeFill = fills.find((f) => f.id === fillMap[activeSide]);

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sides.map((s) => {
          const isBlocked = blocked.has(s.id);
          const isActive = activeSide === s.id;
          const fill = fills.find((f) => f.id === fillMap[s.id]);
          const hasFill = !!fill && fill.id !== "none";
          return (
            <button
              key={s.id}
              type="button"
              disabled={isBlocked}
              title={
                isBlocked
                  ? "Tato strana je u stěny"
                  : hasFill
                    ? `${s.title}: ${fill.title}`
                    : s.title
              }
              onClick={() => {
                if (isBlocked) return;
                setActiveSide(s.id);
              }}
              className={selCard(!isBlocked && isActive, "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 px-1.5 py-2 text-center disabled:cursor-not-allowed disabled:opacity-40")}
            >
              {isBlocked ? (
                <>
                  <SideGlyph side={s.id} active={false} blocked />
                  <span className="text-[10px] font-medium text-ink">{s.title}</span>
                  <span className="text-[9px] text-muted">U stěny</span>
                </>
              ) : (
                <>
                  <SideGlyph side={s.id} active={isActive} blocked={false} />
                  <span className="text-[10px] font-medium text-ink">{s.title}</span>
                  <span
                    className={
                      hasFill
                        ? "line-clamp-2 w-full text-[9px] leading-tight text-forest"
                        : "text-[9px] text-muted"
                    }
                  >
                    {hasFill && fill ? fill.title : "Bez výplně"}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {selectable.length === 0 ? (
        <p className="text-[12px] text-muted">Pro toto kotvení nejsou dostupné výplně stran.</p>
      ) : (
        <button
          type="button"
          onClick={() => setModalSide(activeSide)}
          disabled={blocked.has(activeSide)}
          className="flex h-auto w-full items-center gap-3 rounded-md border border-line bg-white p-2.5 text-left transition hover:border-forest/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span
            className="shrink-0 overflow-hidden rounded-sm bg-[#f3f4f6]"
            style={{ width: 48, height: 48 }}
          >
            {activeFill ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeFill.image}
                alt=""
                className="h-full w-full object-contain"
                style={{ maxWidth: 48, maxHeight: 48 }}
              />
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted">
              {sides.find((s) => s.id === activeSide)?.title}
            </span>
            <span className="block text-sm font-semibold text-ink">
              {activeFill?.title ?? "Vybrat výplň"}
            </span>
          </span>
          <span className="shrink-0 rounded-md bg-forest px-3 py-1.5 text-[12px] font-semibold text-white">
            {activeFill && activeFill.id !== "none" ? "Změnit" : "Vybrat"}
          </span>
        </button>
      )}

      {modalSide ? <FillModal side={modalSide} onClose={() => setModalSide(null)} /> : null}
    </div>
  );
}
