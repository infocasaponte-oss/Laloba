import type { AppSpec } from "./generation-contract";

export type PolicyDecision = { allowed: true } | { allowed: false; reason: string };

const capabilitySet = new Set(["forms", "local-state", "charts", "tables", "search"]);

export function authorizeGeneration(spec: AppSpec): PolicyDecision {
  for (const capability of spec.capabilities) {
    if (!capabilitySet.has(capability)) return { allowed: false, reason: `Capacidad no autorizada: ${capability}` };
  }
  if (spec.pages.length > 12) return { allowed: false, reason: "Demasiadas páginas." };
  return { allowed: true };
}
