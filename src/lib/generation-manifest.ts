import type { GenerationResult } from "./generation-result";
import type { GenerationResultV2 } from "./generation-result-v2";
import { projectTreeSha256, sha256 } from "./project-files";

export type GenerationManifest={
 schemaVersion:"2";
 generationId:string;
 generatedAt:string;
 treeSha256:string;
 files:Array<{path:string;bytes:number;sha256:string}>;
};

export async function createGenerationManifest(
 generationId:string,
 result:GenerationResult|GenerationResultV2,
 generatedAt=new Date().toISOString(),
):Promise<GenerationManifest>{
 const encoder=new TextEncoder();
 const files=await Promise.all([...result.files].sort((a,b)=>a.path.localeCompare(b.path)).map(async(file)=>({
  path:file.path,
  bytes:encoder.encode(file.content).byteLength,
  sha256:await sha256(file.content),
 })));
 return{schemaVersion:"2",generationId,generatedAt,treeSha256:await projectTreeSha256(result.files),files};
}
