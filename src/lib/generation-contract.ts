import { z } from "zod";

export const appSpecSchema = z.object({
  schemaVersion: z.literal("1"),
  name: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(500),
  pages: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().trim().min(1).max(80),
    purpose: z.string().trim().min(1).max(500),
  }).strict()).min(1).max(12),
  capabilities: z.array(z.enum(["forms", "local-state", "charts", "tables", "search"])).max(8).default([]),
}).strict();

export type AppSpec = z.infer<typeof appSpecSchema>;

export type GenerationPlan = {
  schemaVersion: "1";
  files: Array<{ path: string; purpose: string }>;
  checks: string[];
};

export function planApplication(spec: AppSpec): GenerationPlan {
  const files = [{ path: "index.html", purpose: `Aplicación ${spec.name}` }];
  return {
    schemaVersion: "1",
    files,
    checks: ["generated-html", "sandbox-preview"],
  };
}
