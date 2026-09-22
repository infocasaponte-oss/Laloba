import { z } from "zod";
import { validateProjectArtifact } from "./project-artifact";

const MAX_FILES=80;
const fileSchema=z.object({
 path:z.string().min(1).max(180),
 content:z.string().max(512_000),
}).strict();

export const generationResultV2Schema=z.object({
 schemaVersion:z.literal("2"),
 summary:z.string().trim().min(1).max(800),
 files:z.array(fileSchema).min(1).max(MAX_FILES),
}).strict();

export type GenerationResultV2=z.infer<typeof generationResultV2Schema>;

export function parseGenerationResultV2(text:string){
 let raw:unknown;
 try{raw=JSON.parse(text.trim())}
 catch{return{ok:false as const,reason:"El generador no devolvió JSON válido."}}
 const parsed=generationResultV2Schema.safeParse(raw);
 if(!parsed.success)return{ok:false as const,reason:"La respuesta no cumple el contrato v2."};
 const artifact=validateProjectArtifact(parsed.data.files);
 if(!artifact.ok)return{ok:false as const,reason:artifact.reason};
 return{ok:true as const,result:{...parsed.data,files:artifact.files}};
}
