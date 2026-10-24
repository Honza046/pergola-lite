import {
  accessoriesCatalog,
  controlsCatalog,
  fills,
  ledTempOptions,
  models,
  mounts,
  servicesCatalog,
  sides,
} from "@/lib/catalog";
import { getRoofFinish, labelForHex, roofSectionTitle } from "@/lib/colors";
import type { ConfigState } from "@/types/config";

function m(n: number) {
  return n.toFixed(1).replace(".", ",");
}

/** Human-readable Czech summary of the current 3D configuration */
export function buildInquirySummary(config: ConfigState): string[] {
  const model = models.find((x) => x.id === config.model)?.title ?? config.model;
  const mount = mounts.find((x) => x.id === config.mount)?.title ?? config.mount;
  const roof = getRoofFinish(config.model, config.roofFinishId);
  const lines: string[] = [
    `Model: ${model}`,
    `Kotvení: ${mount}`,
    `Rozměry: ${m(config.width)} × ${m(config.depth)} × ${m(config.height)} m (${m(config.width * config.depth)} m²)`,
    `Barva konstrukce: ${labelForHex(config.frameColor)}`,
    `${roofSectionTitle(config.model)}: ${roof.label}`,
    `Barva výplní: ${
      config.fillColor.toLowerCase() === config.frameColor.toLowerCase()
        ? "Jako konstrukce"
        : labelForHex(config.fillColor)
    }`,
  ];

  for (const side of sides) {
    const fill = fills.find((f) => f.id === config.fills[side.id]);
    if (fill && fill.id !== "none") {
      lines.push(`Výplň ${side.title.toLowerCase()}: ${fill.title}`);
    }
  }

  if (config.lighting === "led") {
    const temp = ledTempOptions.find((t) => t.id === config.ledTemp)?.title ?? config.ledTemp;
    lines.push(`LED osvětlení: ${config.ledCount}× · ${temp}`);
  }

  if (config.accessoriesEnabled) {
    for (const a of accessoriesCatalog) {
      const qty = config.accessories[a.id] ?? 0;
      if (qty > 0) lines.push(`Příslušenství: ${a.title}${qty > 1 ? ` × ${qty}` : ""}`);
    }
  }

  for (const c of controlsCatalog) {
    const qty = config.controls[c.id] ?? 0;
    if (qty > 0) lines.push(`Ovládání: ${c.title}${qty > 1 ? ` × ${qty}` : ""}`);
  }

  if (config.servicesEnabled) {
    for (const s of servicesCatalog) {
      if (config.services[s.id]) lines.push(`Služba: ${s.title}`);
    }
  }

  return lines;
}

export type InquiryPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  note?: string;
  summary: string[];
  config: ConfigState;
};
