export type RoofModel = "bioclimatic" | "glass" | "polycarbonate" | "thermo" | "carport";
export type MountType = "freestanding" | "wall" | "corner";
export type SideId = "front" | "back" | "left" | "right";
export type FillType =
  | "none"
  | "screen"
  | "aluminum_blinds"
  | "glass_framed"
  | "glass_frameless"
  | "pur_panel";
export type Lighting = "none" | "led";
export type LedTemp = "warm" | "day" | "cold";
export type AccessoryId = "rain_sensor" | "wind_sensor" | "socket" | "heater" | "remote";
export type ControlId = "remote_5ch" | "remote_16ch" | "wall_switch" | "smart_home";
export type ServiceId = "delivery" | "installation";
/** Which side moves when width changes (other edge stays fixed) */
export type WidthExpand = "left" | "center" | "right";
/** Which way bioclimatic louvres open (viewer facing the house) */
export type LouvreSide = "left" | "right";

export type ColorOption = {
  id: string;
  label: string;
  hex: string;
};

export type ConfigState = {
  model: RoofModel;
  mount: MountType;
  width: number;
  depth: number;
  height: number;
  /** Which side grows when changing width (left / both / right) */
  widthExpand: WidthExpand;
  /** World X of pergola center — only shifts when width slider moves */
  originX: number;
  /** Gap house front → back edge of pergola (freestanding only), meters */
  setback: number;
  /** Open angle of louvres in degrees (visual tilt) */
  louvreAngle: number;
  /** Open toward left or right */
  louvreSide: LouvreSide;
  frameColor: string;
  /** @deprecated kept for compatibility — roof uses roofFinishId */
  louvreColor: string;
  /** Model-specific roof / glass / poly finish id */
  roofFinishId: string;
  fills: Record<SideId, FillType>;
  /** Color for opaque side fills (blinds, screen, PUR) */
  fillColor: string;  lighting: Lighting;
  /** Number of LED strips when lighting === "led" */
  ledCount: number;
  ledTemp: LedTemp;
  /** Accessories enabled (toggle section) */
  accessoriesEnabled: boolean;
  /** Selected accessory qty — 0 = off, >0 = on (qty for multi) */
  accessories: Record<AccessoryId, number>;
  /** Control / remote options — qty 0 = not selected */
  controls: Record<ControlId, number>;
  servicesEnabled: boolean;
  services: Record<ServiceId, boolean>;
};
