import { applyGenerationPatch, type GenerationPatch, type ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot, projectTreeSha256, sha256 } from "./project-files";

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
};

async function patchSha256(patch:GenerationPatch){
 return sha256(JSON.stringify(patch));
}

export async function preparePatchAuthorization(
 generationId:string,projectId:string,prompt:string,patch:GenerationPatch,currentFiles:ProjectSourceFile[],now=new Date()
):Promise<PendingPatchAuthorization>{
 await applyGenerationPatch(currentFiles,patch);
 return{schemaVersion:"2",generationId,projectId,prompt,patch,patchSha256:await patchSha256(patch),baseTreeSha256:await projectTreeSha256(currentFiles),preparedAt:now.toISOString()};
}

export async function authorizePatch(
 pending:PendingPatchAuthorization,projectId:string,currentFiles:ProjectSourceFile[],now=new Date()
){
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 const preparedAt=Date.parse(pending.preparedAt);
 if(!Number.isFinite(preparedAt)||now.getTime()-preparedAt>PATCH_AUTHORIZATION_TTL_MS||now.getTime()<preparedAt)throw new Error("Authorization expired; regenerate before applying");
 if(await patchSha256(pending.patch)!==pending.patchSha256)throw new Error("Authorization payload changed after preparation");
 if(await projectTreeSha256(currentFiles)!==pending.baseTreeSha256)throw new Error("Project tree changed after generation; regenerate before applying");
 const files=await applyGenerationPatch(currentFiles,pending.patch);
 const snapshot=await createProjectSnapshot(pending.generationId,files);
 return{files,snapshot};
}
