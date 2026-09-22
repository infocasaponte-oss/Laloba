import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";

export const MAX_GENERATION_REQUEST_BYTES=96_000;
export const MAX_PATCH_CONTEXT_BYTES=56_000;
const encoder=new TextEncoder();

const messageSchema=z.object({
 role:z.enum(["user","assistant"]),
 content:z.string().trim().min(1).max(12_000),
}).strict();

const sourceFileSchema=z.object({
 path:z.string().min(1).max(180),
 content:z.string().max(40_000),
}).strict();

export const generationChatRequestSchema=z.object({
 mode:z.enum(["build","plan"]).default("build"),
 buildKind:z.enum(["initial","patch"]).optional(),
 messages:z.array(messageSchema).min(1).max(24),
 currentHtml:z.string().max(40_000).optional(),
 currentFiles:z.array(sourceFileSchema).min(1).max(80).optional(),
 knowledge:z.string().max(4_000).optional(),
}).strict().superRefine((value,ctx)=>{
 if(value.mode==="build"&&value.buildKind==="patch"&&!value.currentFiles?.length){
  ctx.addIssue({code:"custom",message:"Patch generation requires current files",path:["currentFiles"]});
 }
 if(value.mode==="plan"&&(value.currentHtml||value.currentFiles||value.buildKind)){
  ctx.addIssue({code:"custom",message:"Plan mode cannot carry build state",path:["mode"]});
 }
 if(!value.currentFiles)return;
 const seen=new Set<string>();
 let total=0;
 for(let index=0;index<value.currentFiles.length;index++){
  const file=value.currentFiles[index];
  const path=validateGeneratedPath(file.path);
  if(!path.ok){
   ctx.addIssue({code:"custom",message:path.reason,path:["currentFiles",index,"path"]});
   continue;
  }
  if(seen.has(path.path)){
   ctx.addIssue({code:"custom",message:`Duplicate project path: ${path.path}`,path:["currentFiles",index,"path"]});
  }
  seen.add(path.path);
  total+=encoder.encode(file.content).byteLength;
 }
 if(total>MAX_PATCH_CONTEXT_BYTES){
  ctx.addIssue({code:"custom",message:"Patch context too large",path:["currentFiles"]});
 }
});

export type GenerationChatRequest=z.infer<typeof generationChatRequestSchema>;
