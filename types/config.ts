export type RoofModel = "bioclimatic" | "glass" | "polycarbonate" | "thermo" | "carport";
export type MountType = "freestanding" | "wall" | "corner";
export type SideId = "front" | "back" | "left" | "right";
export type FillType = "none" | "screen" | "glass";
export type Lighting = "none" | "led";
/** Which side moves when width changes (other edge stays fixed) */
export type WidthExpand = "left" | "center" | "right";

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
  louvreAngle: number;
  frameColor: string;
  louvreColor: string;
  fills: Record<SideId, FillType>;
  lighting: Lighting;
};
