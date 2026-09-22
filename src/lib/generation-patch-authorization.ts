import { applyGenerationPatch, type GenerationPatch, type ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot, sha256 } from "./project-files";

export type PendingPatchAuthorization={
  schemaVersion:"2";
  generationId:string;
  projectId:string;
  prompt:string;
  patch:GenerationPatch;
  baseTreeSha256:string;
  preparedAt:string;
};

async function treeSha256(files:ProjectSourceFile[]){
  const canonical=[...files].sort((a,b)=>a.path.localeCompare(b.path));
  const rows:string[]=[];
  for(const file of canonical)rows.push(`${file.path}\0${await sha256(file.content)}`);
  return sha256(rows.join("\n"));
}

export async function preparePatchAuthorization(
 generationId:string,projectId:string,prompt:string,patch:GenerationPatch,currentFiles:ProjectSourceFile[]
):Promise<PendingPatchAuthorization>{
 // Apply once while preparing so conflicts are detected before asking a human to approve.
 await applyGenerationPatch(currentFiles,patch);
 return{schemaVersion:"2",generationId,projectId,prompt,patch,baseTreeSha256:await treeSha256(currentFiles),preparedAt:new Date().toISOString()};
}

export async function authorizePatch(
 pending:PendingPatchAuthorization,projectId:string,currentFiles:ProjectSourceFile[]
){
 if(pending.projectId!==projectId)throw new Error("Authorization belongs to another project");
 if(await treeSha256(currentFiles)!==pending.baseTreeSha256)throw new Error("Project tree changed after generation; regenerate before applying");
 const files=await applyGenerationPatch(currentFiles,pending.patch);
 const snapshot=await createProjectSnapshot(pending.generationId,files);
 return{files,snapshot};
}
