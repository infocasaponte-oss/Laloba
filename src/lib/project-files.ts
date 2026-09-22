import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";
import { assertGenerationId, isValidGenerationId } from "./generation-id";

export const projectFileSchema=z.object({path:z.string().min(1).max(180),content:z.string().max(512_000),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type ProjectFile=z.infer<typeof projectFileSchema>;
export type ProjectSnapshot={schemaVersion:"1";generationId:string;createdAt:string;files:ProjectFile[];treeSha256:string};
const encoder=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
export async function sha256(content:string){return hex(await crypto.subtle.digest("SHA-256",encoder.encode(content)))}

export async function projectTreeSha256(files:Array<{path:string;content:string}>){
 const normalized:Array<{path:string;sha256:string}>=[];
 const seen=new Set<string>();
 for(const file of files){
  const path=validateGeneratedPath(file.path);
  if(!path.ok)throw new Error(path.reason);
  if(seen.has(path.path))throw new Error(`Duplicate path: ${path.path}`);
  seen.add(path.path);
  normalized.push({path:path.path,sha256:await sha256(file.content)});
 }
 normalized.sort((a,b)=>a.path.localeCompare(b.path));
 return sha256(JSON.stringify(normalized));
}

export async function createProjectSnapshot(generationId:string,files:Array<{path:string;content:string}>,createdAt=new Date().toISOString()):Promise<ProjectSnapshot>{
 assertGenerationId(generationId);
 const seen=new Set<string>();const normalized:ProjectFile[]=[];
 for(const file of files){const path=validateGeneratedPath(file.path);if(!path.ok)throw new Error(path.reason);if(seen.has(path.path))throw new Error(`Duplicate path: ${path.path}`);seen.add(path.path);normalized.push({path:path.path,content:file.content,sha256:await sha256(file.content)})}
 normalized.sort((a,b)=>a.path.localeCompare(b.path));
 return{schemaVersion:"1",generationId,createdAt,files:normalized,treeSha256:await projectTreeSha256(normalized)};
}

export async function verifyProjectSnapshot(snapshot:ProjectSnapshot){
 if(!isValidGenerationId(snapshot.generationId))return false;
 const seen=new Set<string>();
 for(const file of snapshot.files){
  const parsed=projectFileSchema.safeParse(file);if(!parsed.success)return false;
  const path=validateGeneratedPath(file.path);if(!path.ok||seen.has(path.path))return false;seen.add(path.path);
  if(await sha256(file.content)!==file.sha256)return false;
 }
 if(!/^[a-f0-9]{64}$/.test(snapshot.treeSha256))return false;
 if(await projectTreeSha256(snapshot.files)!==snapshot.treeSha256)return false;
 return true;
}
