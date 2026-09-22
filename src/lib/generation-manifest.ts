import type { GenerationResult } from "./generation-result";

export type GenerationManifest = {
  schemaVersion: "1";
  generatedAt: string;
  files: Array<{ path: string; bytes: number; sha256: string }>;
};

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createGenerationManifest(
  result: GenerationResult,
  generatedAt = new Date().toISOString(),
): Promise<GenerationManifest> {
  const encoder = new TextEncoder();
  const files = await Promise.all(result.files.map(async (file) => {
    const bytes = encoder.encode(file.content);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return { path: file.path, bytes: bytes.byteLength, sha256: hex(digest) };
  }));
  return { schemaVersion: "1", generatedAt, files };
}
