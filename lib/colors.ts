import type { RoofModel } from "@/types/config";

export type Swatch = {
  id: string;
  label: string;
  hex: string;
};

export type ColorFamily = {
  id: string;
  label: string;
  /** Representative hue for the family chip */
  hex: string;
  shades: Swatch[];
};

/** Featured construction colors (Alux-style top row) */
export const featuredFrameColors: Swatch[] = [
  { id: "7016", label: "Antracitově šedá", hex: "#383e42" },
  { id: "9006", label: "9006", hex: "#a5a8a6" },
];

/** RAL-like families for custom construction color */
export const frameColorFamilies: ColorFamily[] = [
  {
    id: "yellow",
    label: "Žlutá",
    hex: "#f0c000",
    shades: [
      { id: "1000", label: "1000", hex: "#ccc58f" },
      { id: "1002", label: "1002", hex: "#d2b773" },
      { id: "1003", label: "1003", hex: "#f7b500" },
      { id: "1004", label: "1004", hex: "#e49e00" },
      { id: "1015", label: "1015", hex: "#eae3c5" },
      { id: "1018", label: "1018", hex: "#f3e03b" },
    ],
  },
  {
    id: "orange",
    label: "Oranžová",
    hex: "#e67e22",
    shades: [
      { id: "2000", label: "2000", hex: "#dd7907" },
      { id: "2001", label: "2001", hex: "#be4e20" },
      { id: "2002", label: "2002", hex: "#c63927" },
      { id: "2003", label: "2003", hex: "#fa842b" },
      { id: "2004", label: "2004", hex: "#e75b12" },
      { id: "2008", label: "2008", hex: "#ed6d2a" },
    ],
  },
  {
    id: "red",
    label: "Rudá",
    hex: "#c0392b",
    shades: [
      { id: "3000", label: "3000", hex: "#a72920" },
      { id: "3001", label: "3001", hex: "#9b2423" },
      { id: "3002", label: "3002", hex: "#a02128" },
      { id: "3003", label: "3003", hex: "#8d1d2c" },
      { id: "3004", label: "3004", hex: "#6b1c23" },
      { id: "3011", label: "3011", hex: "#791f24" },
    ],
  },
  {
    id: "violet",
    label: "Fialová",
    hex: "#8e44ad",
    shades: [
      { id: "4001", label: "4001", hex: "#816183" },
      { id: "4005", label: "4005", hex: "#6c4675" },
      { id: "4006", label: "4006", hex: "#99389f" },
      { id: "4007", label: "4007", hex: "#4a203b" },
      { id: "4008", label: "4008", hex: "#904684" },
      { id: "4009", label: "4009", hex: "#a18594" },
    ],
  },
  {
    id: "blue",
    label: "Modrá",
    hex: "#2980b9",
    shades: [
      { id: "5000", label: "5000", hex: "#314f6f" },
      { id: "5001", label: "5001", hex: "#1a5257" },
      { id: "5002", label: "5002", hex: "#00387b" },
      { id: "5003", label: "5003", hex: "#1f3855" },
      { id: "5004", label: "5004", hex: "#191e28" },
      { id: "5005", label: "5005", hex: "#005387" },
      { id: "5007", label: "5007", hex: "#376b8c" },
      { id: "5008", label: "5008", hex: "#2b3a44" },
      { id: "5009", label: "5009", hex: "#225f78" },
      { id: "5010", label: "5010", hex: "#004f7c" },
      { id: "5011", label: "5011", hex: "#1a2b3c" },
      { id: "5012", label: "5012", hex: "#0089b6" },
      { id: "5013", label: "5013", hex: "#193153" },
      { id: "5014", label: "5014", hex: "#637d96" },
      { id: "5015", label: "5015", hex: "#007cb0" },
      { id: "5017", label: "5017", hex: "#005b8c" },
      { id: "5018", label: "5018", hex: "#058b8c" },
      { id: "5019", label: "5019", hex: "#005e8c" },
      { id: "5020", label: "5020", hex: "#00414b" },
      { id: "5021", label: "5021", hex: "#007577" },
      { id: "5022", label: "5022", hex: "#222d5a" },
      { id: "5023", label: "5023", hex: "#42698f" },
      { id: "5024", label: "5024", hex: "#6093ac" },
    ],
  },
  {
    id: "green",
    label: "Zelená",
    hex: "#27ae60",
    shades: [
      { id: "6000", label: "6000", hex: "#3c7460" },
      { id: "6001", label: "6001", hex: "#266d3b" },
      { id: "6002", label: "6002", hex: "#276235" },
      { id: "6003", label: "6003", hex: "#4e6151" },
      { id: "6005", label: "6005", hex: "#0f3d2e" },
      { id: "6009", label: "6009", hex: "#27352a" },
      { id: "6011", label: "6011", hex: "#6c7c59" },
      { id: "6018", label: "6018", hex: "#4b972a" },
      { id: "6021", label: "6021", hex: "#86a47c" },
    ],
  },
  {
    id: "grey",
    label: "Šedá",
    hex: "#95a5a6",
    shades: [
      { id: "7000", label: "7000", hex: "#7a888e" },
      { id: "7001", label: "7001", hex: "#8a969a" },
      { id: "7004", label: "7004", hex: "#969695" },
      { id: "7015", label: "7015", hex: "#4d5057" },
      { id: "7016", label: "7016", hex: "#383e42" },
      { id: "7021", label: "7021", hex: "#2f3234" },
      { id: "7024", label: "7024", hex: "#474a50" },
      { id: "7035", label: "7035", hex: "#c5c7c4" },
      { id: "7040", label: "7040", hex: "#9da3a6" },
      { id: "9005", label: "9005", hex: "#0a0a0a" },
      { id: "9006", label: "9006", hex: "#a5a8a6" },
      { id: "9010", label: "9010", hex: "#f7f7f2" },
      { id: "9016", label: "9016", hex: "#f6f6f6" },
    ],
  },
  {
    id: "brown",
    label: "Hnědá",
    hex: "#8b5a2b",
    shades: [
      { id: "8001", label: "8001", hex: "#9c6b30" },
      { id: "8003", label: "8003", hex: "#7e4b26" },
      { id: "8004", label: "8004", hex: "#8d4931" },
      { id: "8007", label: "8007", hex: "#70462e" },
      { id: "8011", label: "8011", hex: "#5b3a29" },
      { id: "8014", label: "8014", hex: "#4a3526" },
      { id: "8017", label: "8017", hex: "#442f29" },
      { id: "8019", label: "8019", hex: "#3d2b1f" },
    ],
  },
];

export type RoofFinish = {
  id: string;
  label: string;
  /** Preview swatch */
  hex: string;
  /** Optional metallic roof */
  metal?: boolean;
  /** Glass / polycarbonate look */
  glass?: {
    color: string;
    opacity: number;
    transmission: number;
    roughness: number;
  };
  poly?: {
    color: string;
    opacity: number;
  };
};

export const roofFinishesByModel: Record<RoofModel, RoofFinish[]> = {
  bioclimatic: [
    { id: "7016", label: "Antracit 7016", hex: "#383e42", metal: true },
    { id: "9005", label: "Černá 9005", hex: "#0a0a0a", metal: true },
    { id: "9006", label: "Stříbrná 9006", hex: "#a5a8a6", metal: true },
    { id: "9010", label: "Bílá 9010", hex: "#f7f7f2", metal: true },
    { id: "8019", label: "Hnědá 8019", hex: "#3d2b1f", metal: true },
  ],
  glass: [
    {
      id: "clear",
      label: "Čiré",
      hex: "#d8eef8",
      glass: { color: "#cfe8f5", opacity: 0.35, transmission: 0.9, roughness: 0.04 },
    },
    {
      id: "extra-clear",
      label: "Extra čiré",
      hex: "#eef7fc",
      glass: { color: "#e8f4fb", opacity: 0.22, transmission: 0.95, roughness: 0.03 },
    },
    {
      id: "milky",
      label: "Mléčné",
      hex: "#f2f4f6",
      glass: { color: "#f0f2f4", opacity: 0.78, transmission: 0.25, roughness: 0.35 },
    },
    {
      id: "smoke",
      label: "Kouřové",
      hex: "#8a9199",
      glass: { color: "#6a727a", opacity: 0.55, transmission: 0.45, roughness: 0.08 },
    },
    {
      id: "bronze",
      label: "Bronzové",
      hex: "#a67c52",
      glass: { color: "#8b6914", opacity: 0.5, transmission: 0.4, roughness: 0.1 },
    },
    {
      id: "green",
      label: "Zelené",
      hex: "#7aa88a",
      glass: { color: "#4a7a5a", opacity: 0.45, transmission: 0.5, roughness: 0.08 },
    },
  ],
  polycarbonate: [
    {
      id: "clear",
      label: "Čirý",
      hex: "#e8f0f4",
      poly: { color: "#e8f0f4", opacity: 0.55 },
    },
    {
      id: "opal",
      label: "Opál / mléčný",
      hex: "#f5f6f7",
      poly: { color: "#f4f5f6", opacity: 0.88 },
    },
    {
      id: "smoke",
      label: "Kouřový",
      hex: "#9aa3ab",
      poly: { color: "#8a939b", opacity: 0.7 },
    },
    {
      id: "bronze",
      label: "Bronzový",
      hex: "#b8956a",
      poly: { color: "#a88858", opacity: 0.72 },
    },
    {
      id: "blue",
      label: "Modrý",
      hex: "#7eb0c8",
      poly: { color: "#6aa0bc", opacity: 0.65 },
    },
  ],
  thermo: [
    { id: "7016", label: "Antracit 7016", hex: "#383e42", metal: true },
    { id: "9005", label: "Černá 9005", hex: "#0a0a0a", metal: true },
    { id: "9006", label: "Stříbrná 9006", hex: "#a5a8a6", metal: true },
    { id: "9010", label: "Bílá 9010", hex: "#f7f7f2", metal: true },
    { id: "8019", label: "Hnědá 8019", hex: "#3d2b1f", metal: true },
    { id: "3000", label: "Červená 3000", hex: "#a72920", metal: true },
  ],
  carport: [
    { id: "7016", label: "Antracit 7016", hex: "#383e42", metal: true },
    { id: "9005", label: "Černá 9005", hex: "#0a0a0a", metal: true },
    { id: "9006", label: "Stříbrná 9006", hex: "#a5a8a6", metal: true },
    { id: "9010", label: "Bílá 9010", hex: "#f7f7f2", metal: true },
    { id: "3000", label: "Červená 3000", hex: "#a72920", metal: true },
    { id: "5010", label: "Modrá 5010", hex: "#004f7c", metal: true },
  ],
};

export function defaultRoofFinishId(model: RoofModel) {
  return roofFinishesByModel[model][0]?.id ?? "7016";
}

export function getRoofFinish(model: RoofModel, id: string): RoofFinish {
  const list = roofFinishesByModel[model];
  return list.find((f) => f.id === id) ?? list[0];
}

export function roofSectionTitle(model: RoofModel) {
  switch (model) {
    case "bioclimatic":
      return "Lamely";
    case "glass":
      return "Sklo";
    case "polycarbonate":
      return "Polykarbonát";
    case "thermo":
      return "Thermo panel";
    case "carport":
      return "Trapézový plech";
  }
}

/** Resolve hex to human RAL / finish label for inquiry summaries */
export function labelForHex(hex: string, model?: RoofModel): string {
  const h = hex.toLowerCase();
  for (const c of featuredFrameColors) {
    if (c.hex.toLowerCase() === h) {
      return c.label.match(/^\d/) ? `RAL ${c.label}` : c.label;
    }
  }
  for (const fam of frameColorFamilies) {
    for (const s of fam.shades) {
      if (s.hex.toLowerCase() === h) {
        const name = s.label.match(/^\d+$/) ? `RAL ${s.label}` : s.label;
        return name;
      }
    }
  }
  if (model) {
    for (const f of roofFinishesByModel[model]) {
      if (f.hex.toLowerCase() === h) return f.label;
    }
  }
  for (const list of Object.values(roofFinishesByModel)) {
    for (const f of list) {
      if (f.hex.toLowerCase() === h) return f.label;
    }
  }
  return hex.toUpperCase();
}
