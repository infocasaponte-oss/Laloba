import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";
import { assertGenerationId,isValidGenerationId } from "./generation-id";
import { validateProjectArtifact } from "./project-artifact";

export const projectFileSchema=z.object({
 path:z.string().min(1).max(180),
 content:z.string().max(512_000),
 sha256:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export const projectSnapshotSchema=z.object({
 schemaVersion:z.literal("1"),
 generationId:z.string().refine(isValidGenerationId),
 createdAt:z.string().min(1).max(64),
 files:z.array(projectFileSchema).min(1).max(80),
 treeSha256:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export type ProjectFile=z.infer<typeof projectFileSchema>;
export type ProjectSnapshot=z.infer<typeof projectSnapshotSchema>;
const encoder=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");

export async function sha256(content:string){
 return hex(await crypto.subtle.digest("SHA-256",encoder.encode(content)));
}

function canonicalTimestamp(value:string){
 const parsed=new Date(value);
 return Number.isFinite(parsed.getTime())&&parsed.toISOString()===value;
}

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

export async function createProjectSnapshot(
 generationId:string,
 files:Array<{path:string;content:string}>,
 createdAt=new Date().toISOString(),
):Promise<ProjectSnapshot>{
 assertGenerationId(generationId);
 if(!canonicalTimestamp(createdAt))throw new Error("Invalid snapshot timestamp");
 const artifact=validateProjectArtifact(files);
 if(!artifact.ok)throw new Error(`Invalid project artifact: ${artifact.reason}`);
 const normalized:ProjectFile[]=[];
 for(const file of artifact.files){
  normalized.push({path:file.path,content:file.content,sha256:await sha256(file.content)});
 }
 return{
  schemaVersion:"1",
  generationId,
  createdAt,
  files:normalized,
  treeSha256:await projectTreeSha256(normalized),
 };
}

export async function verifyProjectSnapshot(snapshot:ProjectSnapshot){
 const parsed=projectSnapshotSchema.safeParse(snapshot);
 if(!parsed.success)return false;
 if(!canonicalTimestamp(parsed.data.createdAt))return false;
 const artifact=validateProjectArtifact(parsed.data.files);
 if(!artifact.ok)return false;
 for(const file of parsed.data.files){
  if(await sha256(file.content)!==file.sha256)return false;
 }
 if(await projectTreeSha256(parsed.data.files)!==parsed.data.treeSha256)return false;
 return true;
}
