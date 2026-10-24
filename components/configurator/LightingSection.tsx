"use client";

import { ledCountLimits, ledTempOptions } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { segBtn, selCard } from "@/lib/ui";
import { useConfig } from "@/lib/store";

export function LightingSection() {
  const lighting = useConfig((s) => s.lighting);
  const ledCount = useConfig((s) => s.ledCount);
  const ledTemp = useConfig((s) => s.ledTemp);
  const setLighting = useConfig((s) => s.setLighting);
  const setLedCount = useConfig((s) => s.setLedCount);
  const setLedTemp = useConfig((s) => s.setLedTemp);

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setLighting("none")}
          className={segBtn(lighting === "none")}
        >
          Žádné osvětlení
        </button>
        <button
          type="button"
          onClick={() => setLighting("led")}
          className={segBtn(lighting === "led")}
        >
          Světla
        </button>
      </div>

      {lighting === "led" ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-muted">LED pásky</p>
            <div className={selCard(true, "p-3")}>
              <div className="flex gap-3">
                <div className="grid size-14 shrink-0 place-items-center rounded-sm bg-[#eef2f6]">
                  <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
                    <rect x="6" y="18" width="28" height="3" rx="1" fill="#2b6cb0" />
                    {Array.from({ length: 5 }, (_, i) => (
                      <path
                        key={i}
                        d={`M${10 + i * 5} 18 L${10 + i * 5} 10`}
                        stroke="#2b6cb0"
                        strokeWidth="1.2"
                        opacity={0.55 + i * 0.05}
                      />
                    ))}
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    Osvětlení LED pásky
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">
                    Pozici v 3D lze později upravit · cena za kus
                  </p>
                  <div className="mt-2 inline-flex items-center rounded-md border border-line">
                    <button
                      type="button"
                      aria-label="Méně"
                      disabled={ledCount <= ledCountLimits.min}
                      onClick={() => setLedCount(ledCount - 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                      {ledCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Více"
                      disabled={ledCount >= ledCountLimits.max}
                      onClick={() => setLedCount(ledCount + 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted">Color temperature</p>
            <div className="flex flex-wrap gap-3">
              {ledTempOptions.map((opt) => {
                const active = ledTemp === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={opt.title}
                    onClick={() => setLedTemp(opt.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "size-10 rounded-full border-2 transition",
                        active ? "border-forest scale-105" : "border-white ring-1 ring-black/10",
                      )}
                      style={{ backgroundColor: opt.hex }}
                    />
                    <span className="text-[10px] text-muted">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
