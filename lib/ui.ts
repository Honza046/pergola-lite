import { cn } from "@/lib/cn";

/** Segmented toggle — selected = solid forest green */
export function segBtn(active: boolean, className?: string) {
  return cn(
    "rounded-md border px-2 py-2.5 text-center text-xs font-semibold transition",
    active
      ? "border-forest bg-forest text-white"
      : "border-line bg-white text-ink hover:border-ink/25",
    className,
  );
}

/** Selectable card / list row */
export function selCard(active: boolean, className?: string) {
  return cn(
    "rounded-md border bg-white transition",
    active
      ? "border-forest bg-moss shadow-[0_0_0_1px_var(--forest)]"
      : "border-line hover:border-ink/20",
    className,
  );
}
