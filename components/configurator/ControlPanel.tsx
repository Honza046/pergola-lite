"use client";

import { useState } from "react";

import { AccessoriesSection } from "@/components/configurator/AccessoriesSection";
import { ColorSection } from "@/components/configurator/ColorPicker";
import { ControlsSection } from "@/components/configurator/ControlsSection";
import { FillSection } from "@/components/configurator/FillSection";
import { InquiryModal } from "@/components/configurator/InquiryModal";
import { LightingSection } from "@/components/configurator/LightingSection";
import { ServicesSection } from "@/components/configurator/ServicesSection";
import {
  models,
  mounts,
  dimensionLimits,
  louvreSideOptions,
  widthExpandOptions,
} from "@/lib/catalog";
import { useConfig } from "@/lib/store";
import { segBtn, selCard } from "@/lib/ui";

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
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-line px-4 py-4">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
          Ateliér venku
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
                  className={selCard(active, "flex gap-3 p-2 text-left")}
                >
                  <div className="size-[5.5rem] shrink-0 overflow-hidden rounded-sm bg-[#eef1f3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="size-full object-cover object-center"
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
                  className={segBtn(active)}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
          {config.mount === "freestanding" ? (
            <p className="mt-3 text-[12px] leading-snug text-muted">
              Pergolu posuneš chycením zeleného bodu uprostřed podlahy.
            </p>
          ) : null}
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
                      className={segBtn(active, "px-1.5 py-2 text-[11px] leading-tight")}
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
              <div>
                <p className="mb-1.5 text-xs font-medium text-ink">Otevírání lamel</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {louvreSideOptions.map((item) => {
                    const active = config.louvreSide === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.hint}
                        onClick={() => config.setLouvreSide(item.id)}
                        className={segBtn(active)}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-muted">
                  {louvreSideOptions.find((o) => o.id === config.louvreSide)?.hint}
                </p>
              </div>
            ) : null}
          </div>
        </Section>

        <Section title="Barvy">
          <ColorSection />
        </Section>

        <Section title="Výplně">
          <FillSection />
        </Section>

        <Section title="Osvětlení">
          <LightingSection />
        </Section>

        <Section title="Příslušenství">
          <AccessoriesSection />
        </Section>

        <Section title="Ovládání">
          <ControlsSection />
        </Section>

        <Section title="Služby">
          <ServicesSection />
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
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-forest text-sm font-semibold text-white transition hover:bg-forest-deep"
          onClick={() => setInquiryOpen(true)}
        >
          Přidat do poptávky
        </button>
      </div>

      {inquiryOpen ? <InquiryModal onClose={() => setInquiryOpen(false)} /> : null}
    </div>
  );
}
