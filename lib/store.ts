"use client";

import { create } from "zustand";

import { blockedFillSides } from "@/lib/catalog";
import { defaultRoofFinishId, getRoofFinish } from "@/lib/colors";
import type {
  AccessoryId,
  ConfigState,
  ControlId,
  FillType,
  LedTemp,
  Lighting,
  LouvreSide,
  MountType,
  RoofModel,
  ServiceId,
  SideId,
  WidthExpand,
} from "@/types/config";

const emptyAccessories: Record<AccessoryId, number> = {
  rain_sensor: 0,
  wind_sensor: 0,
  socket: 0,
  heater: 0,
  remote: 0,
};

const emptyControls: Record<ControlId, number> = {
  remote_5ch: 0,
  remote_16ch: 0,
  wall_switch: 0,
  smart_home: 0,
};

const emptyServices: Record<ServiceId, boolean> = {
  delivery: false,
  installation: false,
};

type ConfigStore = ConfigState & {
  setModel: (model: RoofModel) => void;
  setMount: (mount: MountType) => void;
  setWidth: (width: number) => void;
  setDepth: (depth: number) => void;
  setHeight: (height: number) => void;
  setWidthExpand: (widthExpand: WidthExpand) => void;
  setSetback: (setback: number) => void;
  setOriginX: (originX: number) => void;
  setLouvreAngle: (louvreAngle: number) => void;
  setLouvreSide: (louvreSide: LouvreSide) => void;
  setFrameColor: (frameColor: string) => void;
  setLouvreColor: (louvreColor: string) => void;
  setRoofFinishId: (roofFinishId: string) => void;
  setFill: (side: SideId, fill: FillType) => void;
  setFillColor: (fillColor: string) => void;  setLighting: (lighting: Lighting) => void;
  setLedCount: (ledCount: number) => void;
  setLedTemp: (ledTemp: LedTemp) => void;
  /** Day / night scene toggle — night makes LED glow readable */
  nightMode: boolean;
  setNightMode: (nightMode: boolean) => void;
  setAccessoriesEnabled: (enabled: boolean) => void;
  setAccessoryQty: (id: AccessoryId, qty: number) => void;
  toggleAccessory: (id: AccessoryId) => void;
  setControlQty: (id: ControlId, qty: number) => void;
  setServicesEnabled: (enabled: boolean) => void;
  toggleService: (id: ServiceId) => void;
};

const initialModel: RoofModel = "bioclimatic";
const initialFinish = defaultRoofFinishId(initialModel);

export const useConfig = create<ConfigStore>((set, get) => ({
  model: initialModel,
  mount: "freestanding",
  width: 4,
  depth: 3,
  height: 2.4,
  widthExpand: "center",
  originX: 0,
  setback: 0.8,
  louvreAngle: 35,
  louvreSide: "left",
  frameColor: "#383e42",
  louvreColor: getRoofFinish(initialModel, initialFinish).hex,
  roofFinishId: initialFinish,
  fills: { front: "none", back: "none", left: "none", right: "none" },
  fillColor: "#383e42",
  lighting: "none",
  ledCount: 1,
  ledTemp: "warm",
  nightMode: false,
  accessoriesEnabled: false,
  accessories: { ...emptyAccessories },
  controls: { ...emptyControls },
  servicesEnabled: false,
  services: { ...emptyServices },

  setModel: (model) => {
    const roofFinishId = defaultRoofFinishId(model);
    set({
      model,
      roofFinishId,
      louvreColor: getRoofFinish(model, roofFinishId).hex,
    });
  },
  setMount: (mount) =>
    set((state) => {
      const blocked = new Set(blockedFillSides(mount));
      const fills = { ...state.fills };
      for (const side of blocked) fills[side] = "none";
      return { mount, fills };
    }),
  setSetback: (setback) => set({ setback }),
  setOriginX: (originX) => set({ originX }),
  setWidth: (nextWidth) => {
    const { width, widthExpand, originX } = get();
    let nextOrigin = originX;
    if (widthExpand === "right") {
      const left = originX - width / 2;
      nextOrigin = left + nextWidth / 2;
    } else if (widthExpand === "left") {
      const right = originX + width / 2;
      nextOrigin = right - nextWidth / 2;
    }
    set({ width: nextWidth, originX: nextOrigin });
  },
  setDepth: (depth) => set({ depth }),
  setHeight: (height) => set({ height }),
  setWidthExpand: (widthExpand) => set({ widthExpand }),
  setLouvreAngle: (louvreAngle) => set({ louvreAngle }),
  setLouvreSide: (louvreSide) => set({ louvreSide }),
  setFrameColor: (frameColor) => set({ frameColor }),
  setLouvreColor: (louvreColor) => set({ louvreColor }),
  setRoofFinishId: (roofFinishId) => {
    const { model } = get();
    set({
      roofFinishId,
      louvreColor: getRoofFinish(model, roofFinishId).hex,
    });
  },
  setFill: (side, fill) =>
    set((state) => ({ fills: { ...state.fills, [side]: fill } })),
  setFillColor: (fillColor) => set({ fillColor }),  setLighting: (lighting) =>
    set({
      lighting,
      // Turning lights on → night so glow is visible
      ...(lighting === "led" ? { nightMode: true } : {}),
    }),
  setLedCount: (ledCount) => set({ ledCount: Math.min(4, Math.max(1, Math.round(ledCount))) }),
  setLedTemp: (ledTemp) => set({ ledTemp }),
  setNightMode: (nightMode) => set({ nightMode }),
  setAccessoriesEnabled: (accessoriesEnabled) =>
    set((state) => ({
      accessoriesEnabled,
      accessories: accessoriesEnabled ? state.accessories : { ...emptyAccessories },
    })),
  setAccessoryQty: (id, qty) =>
    set((state) => ({
      accessories: { ...state.accessories, [id]: Math.max(0, Math.round(qty)) },
      accessoriesEnabled: true,
    })),
  toggleAccessory: (id) =>
    set((state) => {
      const next = state.accessories[id] > 0 ? 0 : 1;
      return {
        accessories: { ...state.accessories, [id]: next },
        accessoriesEnabled: true,
      };
    }),
  setControlQty: (id, qty) =>
    set((state) => ({
      controls: { ...state.controls, [id]: Math.max(0, Math.round(qty)) },
    })),
  setServicesEnabled: (servicesEnabled) =>
    set((state) => ({
      servicesEnabled,
      services: servicesEnabled ? state.services : { ...emptyServices },
    })),
  toggleService: (id) =>
    set((state) => ({
      servicesEnabled: true,
      services: { ...state.services, [id]: !state.services[id] },
    })),
}));
