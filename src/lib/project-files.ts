import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";

export const projectFileSchema = z.object({
  path: z.string().min(1).max(180),
  content: z.string().max(512_000),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export type ProjectFile = z.infer<typeof projectFileSchema>;

export type ProjectSnapshot = {
  schemaVersion: "1";
  generationId: string;
  createdAt: string;
  files: ProjectFile[];
};

const encoder = new TextEncoder();
function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, "0")).join("");
}
export async function sha256(content: string) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(content)));
}

export async function createProjectSnapshot(
  generationId: string,
  files: Array<{ path: string; content: string }>,
  createdAt = new Date().toISOString(),
): Promise<ProjectSnapshot> {
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(generationId)) throw new Error("Invalid generation id");
  const seen = new Set<string>();
  const normalized: ProjectFile[] = [];
  for (const file of files) {
    const path = validateGeneratedPath(file.path);
    if (!path.ok) throw new Error(path.reason);
    if (seen.has(path.path)) throw new Error(`Duplicate path: ${path.path}`);
    seen.add(path.path);
    normalized.push({ path: path.path, content: file.content, sha256: await sha256(file.content) });
  }
  return { schemaVersion: "1", generationId, createdAt, files: normalized };
}

export async function verifyProjectSnapshot(snapshot: ProjectSnapshot) {
  for (const file of snapshot.files) {
    if ((await sha256(file.content)) !== file.sha256) return false;
  }
  return true;
}
