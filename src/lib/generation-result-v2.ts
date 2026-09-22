import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";

const MAX_FILES = 80;
const MAX_TOTAL_BYTES = 2_000_000;
const encoder = new TextEncoder();

const fileSchema = z.object({
  path: z.string().min(1).max(180),
  content: z.string().max(512_000),
}).strict();

export const generationResultV2Schema = z.object({
  schemaVersion: z.literal("2"),
  summary: z.string().trim().min(1).max(800),
  files: z.array(fileSchema).min(1).max(MAX_FILES),
}).strict();

export function parseGenerationResultV2(text: string) {
  let raw: unknown;
  try { raw = JSON.parse(text.trim()); }
  catch { return { ok: false as const, reason: "El generador no devolvió JSON válido." }; }
  const parsed = generationResultV2Schema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, reason: "La respuesta no cumple el contrato v2." };

  const seen = new Set<string>(); let total = 0;
  for (const file of parsed.data.files) {
    const path = validateGeneratedPath(file.path);
    if (!path.ok) return { ok: false as const, reason: `${file.path}: ${path.reason}` };
    if (seen.has(path.path)) return { ok: false as const, reason: `Ruta duplicada: ${path.path}` };
    seen.add(path.path);
    total += encoder.encode(file.content).byteLength;
    if (total > MAX_TOTAL_BYTES) return { ok: false as const, reason: "La generación supera el tamaño total permitido." };
  }
  return { ok: true as const, result: parsed.data };
}
