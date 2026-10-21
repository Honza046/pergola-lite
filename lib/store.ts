"use client";

import { create } from "zustand";

import type {
  ConfigState,
  FillType,
  Lighting,
  MountType,
  RoofModel,
  SideId,
  WidthExpand,
} from "@/types/config";

type ConfigStore = ConfigState & {
  setModel: (model: RoofModel) => void;
  setMount: (mount: MountType) => void;
  setWidth: (width: number) => void;
  setDepth: (depth: number) => void;
  setHeight: (height: number) => void;
  setWidthExpand: (widthExpand: WidthExpand) => void;
  setLouvreAngle: (louvreAngle: number) => void;
  setFrameColor: (frameColor: string) => void;
  setLouvreColor: (louvreColor: string) => void;
  setFill: (side: SideId, fill: FillType) => void;
  setLighting: (lighting: Lighting) => void;
};

export const useConfig = create<ConfigStore>((set, get) => ({
  model: "bioclimatic",
  mount: "freestanding",
  width: 4,
  depth: 3,
  height: 2.4,
  widthExpand: "center",
  originX: 0,
  louvreAngle: 35,
  frameColor: "#383e42",
  louvreColor: "#383e42",
  fills: { front: "none", back: "none", left: "none", right: "none" },
  lighting: "none",

  setModel: (model) => set({ model }),
  setMount: (mount) => set({ mount }),
  setWidth: (nextWidth) => {
    const { width, widthExpand, originX } = get();
    let nextOrigin = originX;
    if (widthExpand === "right") {
      // left edge fixed → right side moves
      const left = originX - width / 2;
      nextOrigin = left + nextWidth / 2;
    } else if (widthExpand === "left") {
      // right edge fixed → left side moves
      const right = originX + width / 2;
      nextOrigin = right - nextWidth / 2;
    }
    // center: originX stays — grows both ways
    set({ width: nextWidth, originX: nextOrigin });
  },
  setDepth: (depth) => set({ depth }),
  setHeight: (height) => set({ height }),
  // Switching mode must NOT move the pergola — only affects next width change
  setWidthExpand: (widthExpand) => set({ widthExpand }),
  setLouvreAngle: (louvreAngle) => set({ louvreAngle }),
  setFrameColor: (frameColor) => set({ frameColor }),
  setLouvreColor: (louvreColor) => set({ louvreColor }),
  setFill: (side, fill) =>
    set((state) => ({ fills: { ...state.fills, [side]: fill } })),
  setLighting: (lighting) => set({ lighting }),
}));
