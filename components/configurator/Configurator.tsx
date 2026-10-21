"use client";

import dynamic from "next/dynamic";

import { ControlPanel } from "@/components/configurator/ControlPanel";

const Scene = dynamic(
  () => import("@/components/configurator/Scene").then((m) => m.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#f3f5f8] text-sm text-muted">
        Načítám 3D scénu…
      </div>
    ),
  },
);

export function Configurator() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-md bg-ink text-[11px] font-bold tracking-tight text-white">
            AV
          </span>
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-ink">Ateliér venku</p>
            <p className="text-[11px] text-muted">3D konfigurátor</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="hidden sm:inline">CS</span>
          <span className="hidden rounded-full border border-line px-2.5 py-1 sm:inline">
            localhost:3003
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="relative h-[48vh] border-b border-line sm:h-[52vh] lg:h-auto lg:min-h-0 lg:border-r lg:border-b-0">
          <Scene />
        </div>
        <aside className="min-h-0 overflow-hidden bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.03)]">
          <ControlPanel />
        </aside>
      </div>
    </div>
  );
}
