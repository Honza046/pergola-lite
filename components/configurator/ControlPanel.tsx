"use client";

import {
  models,
  mounts,
  colors,
  fills,
  sides,
  dimensionLimits,
  widthExpandOptions,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useConfig } from "@/lib/store";
import type { FillType, SideId } from "@/types/config";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line px-4 py-4">
      <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit = "m",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular-nums text-muted">
          {value.toFixed(step < 0.1 ? 2 : 1).replace(".", ",")} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line"
      />
      <span className="mt-1 flex justify-between text-[10px] text-muted">
        <span>
          {min}
          {unit === "°" ? "°" : ` ${unit}`}
        </span>
        <span>
          {max}
          {unit === "°" ? "°" : ` ${unit}`}
        </span>
      </span>
    </label>
  );
}

export function ControlPanel() {
  const config = useConfig();
  const activeModel = models.find((m) => m.id === config.model);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-line px-4 py-4">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
          Pergola Ateliér
        </p>
        <h2 className="mt-0.5 text-[22px] font-semibold tracking-tight text-ink">
          {activeModel?.title ?? "Pergola"}
        </h2>
        <p className="mt-1 text-[13px] leading-snug text-muted">{activeModel?.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Model">
          <div className="grid gap-2.5">
            {models.map((item) => {
              const active = config.model === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => config.setModel(item.id)}
                  className={cn(
                    "flex gap-3 rounded-md border bg-white p-2 text-left transition",
                    active
                      ? "border-[#e30613] shadow-[0_0_0_1px_#e30613]"
                      : "border-line hover:border-black/20",
                  )}
                >
                  <div className="size-[5.5rem] shrink-0 overflow-hidden rounded-sm bg-[#eceff2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <span className="min-w-0 flex-1 self-center py-0.5 pr-1">
                    <span className="block text-sm font-semibold text-ink">{item.title}</span>
                    <span className="mt-1 block text-[12px] leading-snug text-muted">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Kotvení">
          <div className="grid grid-cols-3 gap-1.5">
            {mounts.map((item) => {
              const active = config.mount === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => config.setMount(item.id)}
                  className={cn(
                    "rounded-md border px-2 py-2.5 text-center text-xs font-medium transition",
                    active
                      ? "border-[#e30613] bg-[#e30613] text-white"
                      : "border-line bg-white text-ink hover:border-black/20",
                  )}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Rozměry">
          <div className="space-y-4">
            <SliderRow
              label="Šířka"
              value={config.width}
              {...dimensionLimits.width}
              onChange={config.setWidth}
            />
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink">Rozšiřovat šířku</p>
              <div className="grid grid-cols-3 gap-1.5">
                {widthExpandOptions.map((item) => {
                  const active = config.widthExpand === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.hint}
                      onClick={() => config.setWidthExpand(item.id)}
                      className={cn(
                        "rounded-md border px-1.5 py-2 text-center text-[11px] font-medium leading-tight transition",
                        active
                          ? "border-[#e30613] bg-[#e30613] text-white"
                          : "border-line bg-white text-ink hover:border-black/20",
                      )}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-muted">
                {widthExpandOptions.find((o) => o.id === config.widthExpand)?.hint}
              </p>
            </div>
            <SliderRow
              label="Hloubka"
              value={config.depth}
              {...dimensionLimits.depth}
              onChange={config.setDepth}
            />
            <SliderRow
              label="Výška"
              value={config.height}
              {...dimensionLimits.height}
              onChange={config.setHeight}
            />
            {config.model === "bioclimatic" ? (
              <SliderRow
                label="Otočení lamel"
                value={config.louvreAngle}
                min={0}
                max={90}
                step={1}
                unit="°"
                onChange={config.setLouvreAngle}
              />
            ) : null}
          </div>
        </Section>

        <Section title="Barvy">
          <p className="mb-2 text-xs text-muted">Konstrukce</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={`frame-${c.id}`}
                type="button"
                title={c.label}
                onClick={() => config.setFrameColor(c.hex)}
                className={cn(
                  "size-9 rounded-md border-2 transition",
                  config.frameColor === c.hex ? "border-[#e30613] scale-105" : "border-white ring-1 ring-line",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <p className="mb-2 text-xs text-muted">Střecha / lamely</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={`roof-${c.id}`}
                type="button"
                title={c.label}
                onClick={() => config.setLouvreColor(c.hex)}
                className={cn(
                  "size-9 rounded-md border-2 transition",
                  config.louvreColor === c.hex ? "border-[#e30613] scale-105" : "border-white ring-1 ring-line",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </Section>

        <Section title="Výplně stran">
          <div className="space-y-2.5">
            {sides.map((side) => (
              <div key={side.id} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs font-medium">{side.title}</span>
                <div className="flex flex-1 gap-1">
                  {fills.map((fill) => {
                    const active = config.fills[side.id as SideId] === fill.id;
                    return (
                      <button
                        key={fill.id}
                        type="button"
                        onClick={() => config.setFill(side.id as SideId, fill.id as FillType)}
                        className={cn(
                          "flex-1 rounded-md border px-1 py-1.5 text-[10px] font-medium transition",
                          active
                            ? "border-[#e30613] bg-[#e30613] text-white"
                            : "border-line bg-white hover:border-black/20",
                        )}
                      >
                        {fill.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Osvětlení">
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: "none" as const, title: "Bez osvětlení" },
                { id: "led" as const, title: "LED pásek" },
              ] as const
            ).map((item) => {
              const active = config.lighting === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => config.setLighting(item.id)}
                  className={cn(
                    "rounded-md border px-2 py-2.5 text-xs font-medium transition",
                    active
                      ? "border-[#e30613] bg-[#e30613] text-white"
                      : "border-line bg-white hover:border-black/20",
                  )}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="border-t border-line bg-white p-4">
        <p className="mb-3 text-[12px] tabular-nums text-muted">
          {config.width.toFixed(1).replace(".", ",")} × {config.depth.toFixed(1).replace(".", ",")} ×{" "}
          {config.height.toFixed(1).replace(".", ",")} m ·{" "}
          {(config.width * config.depth).toFixed(1).replace(".", ",")} m²
        </p>
        <button
          type="button"
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#e30613] text-sm font-semibold text-white transition hover:bg-[#c10510]"
          onClick={() => {
            window.alert(
              "Poptávka z 3D konfigurátoru (demo).\n\nSpecifikace je připravená — napojení na lead API doplníme později.",
            );
          }}
        >
          Přidat do poptávky
        </button>
      </div>
    </div>
  );
}
