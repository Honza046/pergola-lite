import type {
  ColorOption,
  FillType,
  MountType,
  RoofModel,
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
    description: "Pergola s otočnými lamelami — stín, vzduch i déšť.",
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

export const fills: { id: FillType; title: string }[] = [
  { id: "none", title: "Bez výplně" },
  { id: "screen", title: "Screen roleta" },
  { id: "glass", title: "Zasklení" },
];

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
} as const;

export const widthExpandOptions: { id: WidthExpand; title: string; hint: string }[] = [
  { id: "left", title: "Levá", hint: "Při změně šířky se hýbe levá strana" },
  { id: "center", title: "Střed", hint: "Při změně šířky roste od středu na obě strany" },
  { id: "right", title: "Pravá", hint: "Při změně šířky se hýbe pravá strana" },
];
