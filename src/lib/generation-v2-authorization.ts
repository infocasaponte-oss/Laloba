import { createGenerationManifest } from "./generation-manifest";
import { assertGenerationId } from "./generation-id";
import { type GenerationResultV2,generationResultV2Sha256 } from "./generation-result-v2";
import { createProjectSnapshot,projectTreeSha256,sha256,type ProjectSnapshot } from "./project-files";
import { assertProjectId } from "./project-id";
import { validateProjectArtifact } from "./project-artifact";
import type { ProjectSourceFile } from "./generation-patch";

export const GENERATION_V2_AUTHORIZATION_TTL_MS=10*60*1000;

export type PendingGenerationV2Authorization={
 schemaVersion:"2";
 generationId:string;
 projectId:string;
 prompt:string;
 result:GenerationResultV2;
 resultSha256:string;
 baseTreeSha256:string;
 preparedAt:string;
 authorizationSha256:string;
};

async function envelopeSha256(input:Omit<PendingGenerationV2Authorization,"result"|"authorizationSha256">){
 return sha256(JSON.stringify({
  schemaVersion:"2",
  generationId:input.generationId,
  projectId:input.projectId,
  prompt:input.prompt,
  resultSha256:input.resultSha256,
  baseTreeSha256:input.baseTreeSha256,
  preparedAt:input.preparedAt,
 }));
}

export async function prepareGenerationV2Authorization(
 generationId:string,
 projectId:string,
 prompt:string,
 result:GenerationResultV2,
 currentFiles:ProjectSourceFile[],
 now=new Date(),
):Promise<PendingGenerationV2Authorization>{
 assertGenerationId(generationId);
 assertProjectId(projectId);
 const base=validateProjectArtifact(currentFiles);
 if(!base.ok)throw new Error(`Invalid base project: ${base.reason}`);
 const candidate=validateProjectArtifact(result.files);
 if(!candidate.ok)throw new Error(`Invalid generation artifact: ${candidate.reason}`);
 const normalizedResult={...result,files:candidate.files};
 const resultSha256=await generationResultV2Sha256(normalizedResult);
 const baseTreeSha256=await projectTreeSha256(base.files);
 const preparedAt=now.toISOString();
 const envelope={
  schemaVersion:"2" as const,
  generationId,
  projectId,
  prompt,
  resultSha256,
  baseTreeSha256,
  preparedAt,
 };
 return{
  ...envelope,
  result:normalizedResult,
  authorizationSha256:await envelopeSha256(envelope),
 };
}

export async function authorizeGenerationV2(
 pending:PendingGenerationV2Authorization,
 projectId:string,
 currentFiles:ProjectSourceFile[],
 now=new Date(),
):Promise<{
 files:ProjectSourceFile[];
 snapshot:ProjectSnapshot;
 manifest:Awaited<ReturnType<typeof createGenerationManifest>>;
}>{
 assertGenerationId(pending.generationId);
 assertProjectId(projectId);
 assertProjectId(pending.projectId);
 const envelope={
  schemaVersion:pending.schemaVersion,
  generationId:pending.generationId,
  projectId:pending.projectId,
  prompt:pending.prompt,
  resultSha256:pending.resultSha256,
  baseTreeSha256:pending.baseTreeSha256,
  preparedAt:pending.preparedAt,
 };
 if(await envelopeSha256(envelope)!==pending.authorizationSha256){
  throw new Error("Authorization envelope changed after preparation");
 }
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 const preparedAt=Date.parse(pending.preparedAt);
 if(!Number.isFinite(preparedAt)||now.getTime()-preparedAt>GENERATION_V2_AUTHORIZATION_TTL_MS||now.getTime()<preparedAt){
  throw new Error("Authorization expired; regenerate before applying");
 }
 if(await generationResultV2Sha256(pending.result)!==pending.resultSha256){
  throw new Error("Authorization payload changed after preparation");
 }
 const current=validateProjectArtifact(currentFiles);
 if(!current.ok)throw new Error(`Invalid base project: ${current.reason}`);
 if(await projectTreeSha256(current.files)!==pending.baseTreeSha256){
  throw new Error("Project tree changed after generation; regenerate before applying");
 }
 const candidate=validateProjectArtifact(pending.result.files);
 if(!candidate.ok)throw new Error(`Invalid generation artifact: ${candidate.reason}`);
 const authorizedAt=now.toISOString();
 const result={...pending.result,files:candidate.files};
 const [snapshot,manifest]=await Promise.all([
  createProjectSnapshot(pending.generationId,candidate.files,authorizedAt),
  createGenerationManifest(pending.generationId,result,authorizedAt),
 ]);
 if(snapshot.treeSha256!==manifest.treeSha256)throw new Error("Generation integrity mismatch");
 return{files:candidate.files,snapshot,manifest};
}
