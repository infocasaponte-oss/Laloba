import { generationResultSha256,type GenerationResult } from "./generation-result";
import { createGenerationManifest } from "./generation-manifest";
import { createProjectSnapshot,sha256,type ProjectSnapshot } from "./project-files";
import { assertGenerationId } from "./generation-id";
import { assertProjectId } from "./project-id";

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
 authorizationSha256:string;
};

async function authorizationSha256(input:Omit<PendingGenerationAuthorization,"result"|"authorizationSha256">){
 return sha256(JSON.stringify({
  schemaVersion:"1",
  generationId:input.generationId,
  projectId:input.projectId,
  prompt:input.prompt,
  resultSha256:input.resultSha256,
  previousHtmlSha256:input.previousHtmlSha256,
  preparedAt:input.preparedAt,
 }));
}

export async function prepareGenerationAuthorization(
 generationId:string,projectId:string,prompt:string,result:GenerationResult,currentHtml:string,now=new Date()
):Promise<PendingGenerationAuthorization>{
 assertGenerationId(generationId);
 assertProjectId(projectId);
 const resultSha=await generationResultSha256(result);
 const previousHtmlSha=await sha256(currentHtml);
 const preparedAt=now.toISOString();
 const envelope={schemaVersion:"1" as const,generationId,projectId,prompt,resultSha256:resultSha,previousHtmlSha256:previousHtmlSha,preparedAt};
 return{...envelope,result,authorizationSha256:await authorizationSha256(envelope)};
}

export async function authorizeGeneration(
 pending:PendingGenerationAuthorization,projectId:string,currentHtml:string,now=new Date()
):Promise<{snapshot:ProjectSnapshot;manifest:Awaited<ReturnType<typeof createGenerationManifest>>}>{
 assertGenerationId(pending.generationId);
 assertProjectId(projectId);
 assertProjectId(pending.projectId);
 const envelope={schemaVersion:pending.schemaVersion,generationId:pending.generationId,projectId:pending.projectId,prompt:pending.prompt,resultSha256:pending.resultSha256,previousHtmlSha256:pending.previousHtmlSha256,preparedAt:pending.preparedAt};
 if(await authorizationSha256(envelope)!==pending.authorizationSha256)throw new Error("Authorization envelope changed after preparation");
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 const preparedAt=Date.parse(pending.preparedAt);
 if(!Number.isFinite(preparedAt)||now.getTime()-preparedAt>GENERATION_AUTHORIZATION_TTL_MS||now.getTime()<preparedAt)throw new Error("Authorization expired; regenerate before applying");
 if(await generationResultSha256(pending.result)!==pending.resultSha256)throw new Error("Authorization payload changed after preparation");
 if(await sha256(currentHtml)!==pending.previousHtmlSha256)throw new Error("Project changed after generation; regenerate before applying");
 const authorizedAt=now.toISOString();
 const [snapshot,manifest]=await Promise.all([
  createProjectSnapshot(pending.generationId,pending.result.files,authorizedAt),
  createGenerationManifest(pending.generationId,pending.result,authorizedAt),
 ]);
 if(snapshot.treeSha256!==manifest.treeSha256)throw new Error("Generation integrity mismatch");
 return{snapshot,manifest};
}
