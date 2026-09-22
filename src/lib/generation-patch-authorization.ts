import { applyGenerationPatch,generationPatchSha256,type GenerationPatch,type ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot,projectTreeSha256,sha256 } from "./project-files";
import { assertGenerationId } from "./generation-id";
import { assertProjectId } from "./project-id";
import { validateProjectArtifact } from "./project-artifact";
import { createGenerationManifest } from "./generation-manifest";

export const PATCH_AUTHORIZATION_TTL_MS=10*60*1000;

export type PendingPatchAuthorization={
 schemaVersion:"2";
 generationId:string;
 projectId:string;
 prompt:string;
 patch:GenerationPatch;
 patchSha256:string;
 baseTreeSha256:string;
 preparedAt:string;
 authorizationSha256:string;
};

async function authorizationSha256(input:Omit<PendingPatchAuthorization,"patch"|"authorizationSha256">){
 return sha256(JSON.stringify({
  schemaVersion:"2",
  generationId:input.generationId,
  projectId:input.projectId,
  prompt:input.prompt,
  patchSha256:input.patchSha256,
  baseTreeSha256:input.baseTreeSha256,
  preparedAt:input.preparedAt,
 }));
}

export async function preparePatchAuthorization(
 generationId:string,projectId:string,prompt:string,patch:GenerationPatch,currentFiles:ProjectSourceFile[],now=new Date()
):Promise<PendingPatchAuthorization>{
 assertGenerationId(generationId);
 assertProjectId(projectId);
 const nextFiles=await applyGenerationPatch(currentFiles,patch);
 const artifact=validateProjectArtifact(nextFiles);
 if(!artifact.ok)throw new Error(`Patch would produce an invalid project: ${artifact.reason}`);
 const patchHash=await generationPatchSha256(patch);
 const baseTreeHash=await projectTreeSha256(currentFiles);
 const preparedAt=now.toISOString();
 const envelope={schemaVersion:"2" as const,generationId,projectId,prompt,patchSha256:patchHash,baseTreeSha256:baseTreeHash,preparedAt};
 return{...envelope,patch,authorizationSha256:await authorizationSha256(envelope)};
}

export async function authorizePatch(
 pending:PendingPatchAuthorization,projectId:string,currentFiles:ProjectSourceFile[],now=new Date()
){
 assertGenerationId(pending.generationId);
 assertProjectId(projectId);
 assertProjectId(pending.projectId);
 const envelope={schemaVersion:pending.schemaVersion,generationId:pending.generationId,projectId:pending.projectId,prompt:pending.prompt,patchSha256:pending.patchSha256,baseTreeSha256:pending.baseTreeSha256,preparedAt:pending.preparedAt};
 if(await authorizationSha256(envelope)!==pending.authorizationSha256)throw new Error("Authorization envelope changed after preparation");
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 const preparedAt=Date.parse(pending.preparedAt);
 if(!Number.isFinite(preparedAt)||now.getTime()-preparedAt>PATCH_AUTHORIZATION_TTL_MS||now.getTime()<preparedAt)throw new Error("Authorization expired; regenerate before applying");
 if(await generationPatchSha256(pending.patch)!==pending.patchSha256)throw new Error("Authorization payload changed after preparation");
 if(await projectTreeSha256(currentFiles)!==pending.baseTreeSha256)throw new Error("Project tree changed after generation; regenerate before applying");
 const files=await applyGenerationPatch(currentFiles,pending.patch);
 const artifact=validateProjectArtifact(files);
 if(!artifact.ok)throw new Error(`Patch would produce an invalid project: ${artifact.reason}`);
 const authorizedAt=now.toISOString();
 const [snapshot,manifest]=await Promise.all([
  createProjectSnapshot(pending.generationId,artifact.files,authorizedAt),
  createGenerationManifest(pending.generationId,{schemaVersion:"2",summary:pending.patch.summary,files:artifact.files},authorizedAt),
 ]);
 if(snapshot.treeSha256!==manifest.treeSha256)throw new Error("Patch integrity mismatch");
 return{files:artifact.files,snapshot,manifest};
}
