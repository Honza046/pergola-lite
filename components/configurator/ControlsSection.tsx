"use client";

import { controlsCatalog } from "@/lib/catalog";
import { useConfig } from "@/lib/store";
import { selCard } from "@/lib/ui";

export function ControlsSection() {
  const controls = useConfig((s) => s.controls);
  const setControlQty = useConfig((s) => s.setControlQty);

  return (
    <div className="grid gap-2">
      {controlsCatalog.map((item) => {
        const qty = controls[item.id] ?? 0;
        const on = qty > 0;
        return (
          <div
            key={item.id}
            className={selCard(on, "flex items-center gap-3 p-2.5")}
          >
            <button
              type="button"
              onClick={() => setControlQty(item.id, on ? 0 : 1)}
              className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[#eef2f6]"
              style={{ width: 48, height: 48 }}
              aria-label={item.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-contain p-0.5"
                style={{ maxWidth: 48, maxHeight: 48 }}
              />
            </button>

            <button
              type="button"
              onClick={() => setControlQty(item.id, on ? 0 : 1)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {item.description}
              </span>
            </button>

            <div className="inline-flex shrink-0 items-center rounded-md border border-line">
              <button
                type="button"
                aria-label="Méně"
                disabled={qty <= 0}
                onClick={() => setControlQty(item.id, qty - 1)}
                className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-7 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Více"
                disabled={qty >= item.maxQty}
                onClick={() => setControlQty(item.id, qty + 1)}
                className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
