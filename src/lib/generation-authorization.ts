import type { GenerationResult } from "./generation-result";
import { createGenerationManifest } from "./generation-manifest";
import { createProjectSnapshot, sha256, type ProjectSnapshot } from "./project-files";

export type PendingGenerationAuthorization = {
  schemaVersion: "1";
  generationId: string;
  projectId: string;
  prompt: string;
  result: GenerationResult;
  previousHtmlSha256: string;
  preparedAt: string;
};

export async function prepareGenerationAuthorization(
  generationId: string,
  projectId: string,
  prompt: string,
  result: GenerationResult,
  currentHtml: string,
): Promise<PendingGenerationAuthorization> {
  return {
    schemaVersion: "1",
    generationId,
    projectId,
    prompt,
    result,
    previousHtmlSha256: await sha256(currentHtml),
    preparedAt: new Date().toISOString(),
  };
}

export async function authorizeGeneration(
  pending: PendingGenerationAuthorization,
  projectId: string,
  currentHtml: string,
): Promise<{snapshot:ProjectSnapshot;manifest:Awaited<ReturnType<typeof createGenerationManifest>>}> {
  if(pending.projectId!==projectId) throw new Error("Authorization belongs to another project");
  if(await sha256(currentHtml)!==pending.previousHtmlSha256) {
    throw new Error("Project changed after generation; regenerate before applying");
  }
  const [snapshot,manifest]=await Promise.all([
    createProjectSnapshot(pending.generationId,pending.result.files),
    createGenerationManifest(pending.generationId,pending.result),
  ]);
  return {snapshot,manifest};
}
