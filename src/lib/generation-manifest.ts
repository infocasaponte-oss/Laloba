import type { GenerationResult } from "./generation-result";
import type { GenerationResultV2 } from "./generation-result-v2";
import { projectTreeSha256,sha256 } from "./project-files";
import { assertGenerationId } from "./generation-id";
import { validateProjectArtifact } from "./project-artifact";

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
 assertGenerationId(generationId);
 const artifact=validateProjectArtifact(result.files);
 if(!artifact.ok)throw new Error(`Invalid generation artifact: ${artifact.reason}`);
 const encoder=new TextEncoder();
 const files=await Promise.all(artifact.files.map(async(file)=>({
  path:file.path,
  bytes:encoder.encode(file.content).byteLength,
  sha256:await sha256(file.content),
 })));
 return{schemaVersion:"2",generationId,generatedAt,treeSha256:await projectTreeSha256(artifact.files),files};
}
