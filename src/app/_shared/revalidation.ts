import { revalidatePath } from "next/cache";

export const cacheAreas = {
  billing: ["/invoices"],
  inventory: ["/stock", "/stock/movements"],
  overview: ["/dashboard", "/reports"],
  purchasingCosts: ["/expenses"]
} as const;

type RevalidationTarget = string | readonly string[] | null | undefined;

export function revalidatePaths(...targets: RevalidationTarget[]) {
  const paths = new Set(
    targets.flatMap((target) => {
      if (!target) return [];
      return typeof target === "string" ? [target] : [...target];
    })
  );

  for (const path of paths) {
    revalidatePath(path);
  }
}
