import { z } from "zod";
import { validateGeneratedHtml } from "./generated-html";

const generatedFileSchema = z.object({
  path: z.literal("index.html"),
  content: z.string().min(1).max(512_000),
}).strict();

export const generationResultSchema = z.object({
  schemaVersion: z.literal("1"),
  summary: z.string().trim().min(1).max(800),
  files: z.array(generatedFileSchema).length(1),
}).strict();

export type GenerationResult = z.infer<typeof generationResultSchema>;

export function parseGenerationResult(text: string):
  | { ok: true; result: GenerationResult }
  | { ok: false; reason: string } {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  let raw: unknown;
  try { raw = JSON.parse(candidate.trim()); }
  catch { return { ok: false, reason: "El generador no devolvió JSON válido." }; }

  const parsed = generationResultSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "La respuesta no cumple el contrato de generación v1." };

  const html = validateGeneratedHtml(parsed.data.files[0].content);
  if (!html.ok) return html;
  return { ok: true, result: { ...parsed.data, files: [{ path: "index.html", content: html.html }] } };
}
