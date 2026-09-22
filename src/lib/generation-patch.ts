import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";
import { sha256 } from "./project-files";

const MAX_OPERATIONS=80;
const MAX_TOTAL_BYTES=2_000_000;
const encoder=new TextEncoder();

const operationSchema=z.discriminatedUnion("op",[
  z.object({op:z.literal("create"),path:z.string().min(1).max(180),content:z.string().max(512_000)}).strict(),
  z.object({op:z.literal("update"),path:z.string().min(1).max(180),baseSha256:z.string().regex(/^[a-f0-9]{64}$/),content:z.string().max(512_000)}).strict(),
  z.object({op:z.literal("delete"),path:z.string().min(1).max(180),baseSha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
]);

export const generationPatchSchema=z.object({
  schemaVersion:z.literal("2"),
  summary:z.string().trim().min(1).max(800),
  operations:z.array(operationSchema).min(1).max(MAX_OPERATIONS),
}).strict();
export type GenerationPatch=z.infer<typeof generationPatchSchema>;
export type ProjectSourceFile={path:string;content:string};

export function parseGenerationPatch(text:string){
  let raw:unknown;
  try{raw=JSON.parse(text.trim())}catch{return{ok:false as const,reason:"El generador no devolvió JSON válido."}}
  const parsed=generationPatchSchema.safeParse(raw);
  if(!parsed.success)return{ok:false as const,reason:"La respuesta no cumple el contrato de patch v2."};
  const seen=new Set<string>();let total=0;
  for(const operation of parsed.data.operations){
    const path=validateGeneratedPath(operation.path);
    if(!path.ok)return{ok:false as const,reason:`${operation.path}: ${path.reason}`};
    if(seen.has(path.path))return{ok:false as const,reason:`Operaciones duplicadas para: ${path.path}`};
    seen.add(path.path);
    if("content" in operation){total+=encoder.encode(operation.content).byteLength;if(total>MAX_TOTAL_BYTES)return{ok:false as const,reason:"El patch supera el tamaño total permitido."}}
  }
  return{ok:true as const,patch:parsed.data};
}

export async function applyGenerationPatch(files:ProjectSourceFile[],patch:GenerationPatch){
  const next=new Map<string,string>();
  for(const file of files){
    const validated=validateGeneratedPath(file.path);
    if(!validated.ok)throw new Error(validated.reason);
    if(next.has(validated.path))throw new Error(`Duplicate project path: ${validated.path}`);
    next.set(validated.path,file.content);
  }
  for(const operation of patch.operations){
    const path=validateGeneratedPath(operation.path);
    if(!path.ok)throw new Error(path.reason);
    const current=next.get(path.path);
    if(operation.op==="create"){
      if(current!==undefined)throw new Error(`Conflict: ${path.path} already exists`);
      next.set(path.path,operation.content);continue;
    }
    if(current===undefined)throw new Error(`Conflict: ${path.path} no longer exists`);
    if(await sha256(current)!==operation.baseSha256)throw new Error(`Conflict: ${path.path} changed after generation`);
    if(operation.op==="delete")next.delete(path.path);else next.set(path.path,operation.content);
  }
  return Array.from(next,([path,content])=>({path,content})).sort((a,b)=>a.path.localeCompare(b.path));
}
