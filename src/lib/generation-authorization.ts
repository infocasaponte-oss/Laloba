import { generationResultSha256, type GenerationResult } from "./generation-result";
import { createGenerationManifest } from "./generation-manifest";
import { createProjectSnapshot, sha256, type ProjectSnapshot } from "./project-files";
import { assertGenerationId } from "./generation-id";

export const GENERATION_AUTHORIZATION_TTL_MS=10*60*1000;

export type PendingGenerationAuthorization={
 schemaVersion:"1";
 generationId:string;
 projectId:string;
 prompt:string;
 result:GenerationResult;
 resultSha256:string;
 previousHtmlSha256:string;
 preparedAt:string;
};

export async function prepareGenerationAuthorization(
 generationId:string,projectId:string,prompt:string,result:GenerationResult,currentHtml:string,now=new Date()
):Promise<PendingGenerationAuthorization>{
 assertGenerationId(generationId);
 return{schemaVersion:"1",generationId,projectId,prompt,result,resultSha256:await generationResultSha256(result),previousHtmlSha256:await sha256(currentHtml),preparedAt:now.toISOString()};
}

export async function authorizeGeneration(
 pending:PendingGenerationAuthorization,projectId:string,currentHtml:string,now=new Date()
):Promise<{snapshot:ProjectSnapshot;manifest:Awaited<ReturnType<typeof createGenerationManifest>>}>{
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 const preparedAt=Date.parse(pending.preparedAt);
 if(!Number.isFinite(preparedAt)||now.getTime()-preparedAt>GENERATION_AUTHORIZATION_TTL_MS||now.getTime()<preparedAt)throw new Error("Authorization expired; regenerate before applying");
 if(await generationResultSha256(pending.result)!==pending.resultSha256)throw new Error("Authorization payload changed after preparation");
 if(await sha256(currentHtml)!==pending.previousHtmlSha256)throw new Error("Project changed after generation; regenerate before applying");
 const [snapshot,manifest]=await Promise.all([
  createProjectSnapshot(pending.generationId,pending.result.files),
  createGenerationManifest(pending.generationId,pending.result),
 ]);
 if(snapshot.treeSha256!==manifest.treeSha256)throw new Error("Generation integrity mismatch");
 return{snapshot,manifest};
}
