import type {
  AccessoryId,
  ColorOption,
  ControlId,
  FillType,
  LedTemp,
  LouvreSide,
  MountType,
  RoofModel,
  ServiceId,
  SideId,
  WidthExpand,
} from "@/types/config";

export const models: {
  id: RoofModel;
  title: string;
  description: string;
  /** Optional real photo — when set, replaces the universal SVG preview */
  image?: string;
}[] = [
  {
    id: "bioclimatic",
    title: "Bioklimatická",
    description: "Pergola s otočnými lamelami. Stín, vzduch i déšť.",
    image: "/models/model-bioclimatic.jpg",
  },
  {
    id: "glass",
    title: "Zasklená",
    description: "Prosklená střecha z bezpečnostního skla.",
    image: "/models/model-glass.jpg",
  },
  {
    id: "polycarbonate",
    title: "Polykarbonát",
    description: "Dutinková / plná polykarbonátová střecha.",
    image: "/models/model-polycarbonate.jpg",
  },
  {
    id: "thermo",
    title: "Thermo panel",
    description: "Pevná izolovaná střecha pro celoroční komfort.",
    image: "/models/model-thermo.jpg",
  },
  {
    id: "carport",
    title: "Přístřešek",
    description: "Trapézová střecha nad stání nebo terasu.",
    image: "/models/model-carport.jpg",
  },
];

export const mounts: { id: MountType; title: string; description: string }[] = [
  { id: "freestanding", title: "Volně stojící", description: "Vlastní konstrukce v ploše." },
  { id: "wall", title: "Ke zdi", description: "Jedna strana navazuje na dům." },
  { id: "corner", title: "Do rohu", description: "Kotvení ke dvěma stěnám." },
];

export const sides: { id: SideId; title: string }[] = [
  { id: "front", title: "Přední" },
  { id: "back", title: "Zadní" },
  { id: "left", title: "Levá" },
  { id: "right", title: "Pravá" },
];

export const fills: {
  id: FillType;
  title: string;
  description?: string;
  /** Small schematic icon for lists */
  image: string;
}[] = [
  {
    id: "none",
    title: "Bez výplně",
    description: "Strana zůstane otevřená.",
    image: "/fills/none.jpg",
  },
  {
    id: "screen",
    title: "Screenová roleta",
    description: "Stahovací screen proti slunci a hmyzu.",
    image: "/fills/screen.jpg",
  },
  {
    id: "aluminum_blinds",
    title: "Hliníkové fixní žaluzie",
    description: "Pevné hliníkové lamely pro stínění.",
    image: "/fills/aluminum_blinds.jpg",
  },
  {
    id: "glass_framed",
    title: "Rámové zasklení",
    description: "Posuvné / pevné panely v hliníkovém rámu.",
    image: "/fills/glass_framed.jpg",
  },
  {
    id: "glass_frameless",
    title: "Bezrámové zasklení",
    description: "Téměř celoskleněné panely bez viditelných sloupků.",
    image: "/fills/glass_frameless.jpg",
  },
  {
    id: "pur_panel",
    title: "PUR panelová stěna",
    description: "Izolovaná sendvičová stěna pro celoroční komfort.",
    image: "/fills/pur_panel.jpg",
  },
];
/** Sides blocked by house wall for given mounting */
export function blockedFillSides(mount: MountType): SideId[] {
  if (mount === "wall") return ["back"];
  if (mount === "corner") return ["back", "left"];
  return [];
}

export const colors: ColorOption[] = [
  { id: "7016", label: "Antracit 7016", hex: "#383e42" },
  { id: "9005", label: "Černá 9005", hex: "#0a0a0a" },
  { id: "9010", label: "Bílá 9010", hex: "#f7f7f2" },
  { id: "9006", label: "Stříbrná 9006", hex: "#a5a8a6" },
  { id: "8019", label: "Hnědá 8019", hex: "#3d2b1f" },
  { id: "6005", label: "Zelená 6005", hex: "#0f3d2e" },
];

export const dimensionLimits = {
  width: { min: 2, max: 8, step: 0.1 },
  depth: { min: 2, max: 5, step: 0.1 },
  height: { min: 2, max: 3.5, step: 0.05 },
  /** Freestanding: distance from house wall to rear of pergola */
  setback: { min: 0.3, max: 4, step: 0.1 },
} as const;

/** Fixed gap when mounted to wall / corner — flush against facade */
export const WALL_SETBACK = 0;

export const widthExpandOptions: { id: WidthExpand; title: string; hint: string }[] = [
  { id: "left", title: "Levá", hint: "Při změně šířky se hýbe levá strana" },
  { id: "center", title: "Střed", hint: "Při změně šířky roste od středu na obě strany" },
  { id: "right", title: "Pravá", hint: "Při změně šířky se hýbe pravá strana" },
];

export const louvreSideOptions: { id: LouvreSide; title: string; hint: string }[] = [
  { id: "left", title: "Levé", hint: "Lamely se otevírají doleva" },
  { id: "right", title: "Pravé", hint: "Lamely se otevírají doprava" },
];

export const ledTempOptions: { id: LedTemp; title: string; hex: string; emissive: string }[] = [
  { id: "warm", title: "Teplá", hex: "#f5d9a0", emissive: "#ffd080" },
  { id: "day", title: "Denní", hex: "#f2f0e6", emissive: "#fff6d8" },
  { id: "cold", title: "Studená", hex: "#d8e8f5", emissive: "#c8e0ff" },
];

export const ledCountLimits = { min: 1, max: 4 } as const;

/** Universal accessories — swap / extend per company offer later */
export const accessoriesCatalog: {
  id: AccessoryId;
  title: string;
  description: string;
  /** If true, show +/- quantity (1–maxQty); else on/off via 0/1 */
  qty: boolean;
  maxQty: number;
  image?: string;
  mark?: string;
}[] = [
  {
    id: "rain_sensor",
    title: "Dešťové čidlo",
    description: "Automatické zavření při dešti.",
    qty: false,
    maxQty: 1,
    image: "/accessories/rain.jpg",
  },
  {
    id: "wind_sensor",
    title: "Senzor větru",
    description: "Ochrana konstrukce při silném větru.",
    qty: false,
    maxQty: 1,
    image: "/accessories/wind.jpg",
  },
  {
    id: "socket",
    title: "Elektrická zásuvka exteriér IP44",
    description: "Venkovní zásuvka na konstrukci.",
    qty: true,
    maxQty: 4,
    image: "/accessories/socket.jpg",
  },
  {
    id: "heater",
    title: "Infračervený zářič",
    description: "Připrava / montáž topidla pod střechou.",
    qty: true,
    maxQty: 2,
    mark: "♨",
  },
  {
    id: "remote",
    title: "Dálkové ovládání",
    description: "Ruční ovladač lamel a doplňků.",
    qty: false,
    maxQty: 1,
    image: "/controls/situo.jpg",
  },
];
/** Universal control options — swap labels/images per company later */
export const controlsCatalog: {
  id: ControlId;
  title: string;
  description: string;
  maxQty: number;
  image: string;
}[] = [
  {
    id: "remote_5ch",
    title: "5kanálový ovladač",
    description: "Ruční dálkové ovládání pro lamely a doplňky.",
    maxQty: 3,
    image: "/controls/situo.jpg",
  },
  {
    id: "remote_16ch",
    title: "16kanálový ovladač s displejem",
    description: "Rozšířené ovládání více zón / produktů.",
    maxQty: 2,
    image: "/controls/patio.jpg",
  },
  {
    id: "wall_switch",
    title: "Nástěnný vypínač",
    description: "Elegantní spínač na stěnu u pergoly.",
    maxQty: 4,
    image: "/controls/wall-switch.jpg",
  },
  {
    id: "smart_home",
    title: "Smart Home hub",
    description: "Napojení na chytré domácnosti / aplikaci.",
    maxQty: 1,
    image: "/controls/tahoma.jpg",
  },
];

export const servicesCatalog: {
  id: ServiceId;
  title: string;
  description: string;
  image: string;
}[] = [
  {
    id: "delivery",
    title: "Doprava",
    description: "Cena se vypočítává na základě vzdálenosti.",
    image: "/services/delivery.jpg",
  },
  {
    id: "installation",
    title: "Montáž",
    description: "Nechte náš tým namontovat pergolu za vás.",
    image: "/services/installation.jpg",
  },
];
