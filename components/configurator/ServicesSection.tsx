"use client";

import { servicesCatalog } from "@/lib/catalog";
import { useConfig } from "@/lib/store";
import { segBtn, selCard } from "@/lib/ui";

export function ServicesSection() {
  const enabled = useConfig((s) => s.servicesEnabled);
  const services = useConfig((s) => s.services);
  const setServicesEnabled = useConfig((s) => s.setServicesEnabled);
  const toggleService = useConfig((s) => s.toggleService);

  return (
    <div>
      <div className="mb-2 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setServicesEnabled(false)}
          className={segBtn(!enabled)}
        >
          Žádné služby
        </button>
        <button
          type="button"
          onClick={() => setServicesEnabled(true)}
          className={segBtn(enabled)}
        >
          Služby
        </button>
      </div>

      {enabled ? (
        <>
          <p className="mb-2 text-[11px] text-muted">Lze vybrat více možností</p>
          <div className="grid gap-2">
            {servicesCatalog.map((item) => {
              const on = services[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleService(item.id)}
                  className={selCard(on, "flex items-center gap-3 p-3 text-left")}
                >
                  <span
                    className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[#eef2f6]"
                    style={{ width: 48, height: 48 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      style={{ maxWidth: 48, maxHeight: 48 }}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
