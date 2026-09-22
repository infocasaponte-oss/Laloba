import { z } from "zod";
import { validateGeneratedHtml } from "./generated-html";
import { sha256 } from "./project-files";

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


export async function generationResultSha256(result:GenerationResult){
 const parsed=generationResultSchema.safeParse(result);
 if(!parsed.success)throw new Error("Invalid generation result");
 const canonical={
  schemaVersion:"1" as const,
  summary:parsed.data.summary,
  files:[{path:"index.html" as const,content:parsed.data.files[0].content}],
 };
 return sha256(JSON.stringify(canonical));
}

export function parseGenerationResult(text: string):
  | { ok: true; result: GenerationResult }
  | { ok: false; reason: string } {
  let raw: unknown;
  try { raw = JSON.parse(text.trim()); }
  catch { return { ok: false, reason: "El generador no devolvió JSON válido." }; }

  const parsed = generationResultSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "La respuesta no cumple el contrato de generación v1." };

  const html = validateGeneratedHtml(parsed.data.files[0].content);
  if (!html.ok) return html;
  return { ok: true, result: { ...parsed.data, files: [{ path: "index.html", content: html.html }] } };
}
