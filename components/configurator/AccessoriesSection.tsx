"use client";

import { accessoriesCatalog } from "@/lib/catalog";
import { useConfig } from "@/lib/store";
import { segBtn, selCard } from "@/lib/ui";

export function AccessoriesSection() {
  const enabled = useConfig((s) => s.accessoriesEnabled);
  const accessories = useConfig((s) => s.accessories);
  const setAccessoriesEnabled = useConfig((s) => s.setAccessoriesEnabled);
  const setAccessoryQty = useConfig((s) => s.setAccessoryQty);
  const toggleAccessory = useConfig((s) => s.toggleAccessory);

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setAccessoriesEnabled(false)}
          className={segBtn(!enabled)}
        >
          Žádné doplňky
        </button>
        <button
          type="button"
          onClick={() => setAccessoriesEnabled(true)}
          className={segBtn(enabled)}
        >
          Příslušenství
        </button>
      </div>

      {enabled ? (
        <div className="grid gap-2">
          {accessoriesCatalog.map((item) => {
            const qty = accessories[item.id] ?? 0;
            const on = qty > 0;
            return (
              <div
                key={item.id}
                className={selCard(on, "flex items-center gap-3 p-2.5")}
              >
                <button
                  type="button"
                  onClick={() =>
                    item.qty
                      ? setAccessoryQty(item.id, on ? 0 : 1)
                      : toggleAccessory(item.id)
                  }
                  className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-sm bg-[#eef2f6] text-lg"
                  style={{ width: 48, height: 48 }}
                  aria-label={item.title}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-contain p-0.5"
                      style={{ maxWidth: 48, maxHeight: 48 }}
                    />
                  ) : (
                    <span aria-hidden>{item.mark}</span>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() =>
                      item.qty
                        ? setAccessoryQty(item.id, on ? 0 : 1)
                        : toggleAccessory(item.id)
                    }
                    className="w-full text-left"
                  >
                    <span className="block text-sm font-semibold text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                      {item.description}
                    </span>
                  </button>
                </div>

                {item.qty ? (
                  <div className="inline-flex shrink-0 items-center rounded-md border border-line">
                    <button
                      type="button"
                      aria-label="Méně"
                      disabled={qty <= 0}
                      onClick={() => setAccessoryQty(item.id, qty - 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Více"
                      disabled={qty >= item.maxQty}
                      onClick={() => setAccessoryQty(item.id, qty + 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-black/5 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleAccessory(item.id)}
                    className={segBtn(on, "shrink-0 px-2.5 py-1.5 text-[11px]")}
                  >
                    {on ? "Ano" : "Ne"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
