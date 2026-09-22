import { validateGeneratedHtml } from "./generated-html";
import { validateGeneratedPath } from "./generated-path";
import type { ProjectSourceFile } from "./generation-patch";

export const MAX_PROJECT_FILES=80;
export const MAX_PROJECT_FILE_BYTES=512_000;
export const MAX_PROJECT_TOTAL_BYTES=2_000_000;
const encoder=new TextEncoder();

export type ProjectArtifactValidation=
 |{ok:true;files:ProjectSourceFile[]}
 |{ok:false;reason:string};

export function validateProjectArtifact(files:ProjectSourceFile[]):ProjectArtifactValidation{
 if(files.length<1||files.length>MAX_PROJECT_FILES)return{ok:false,reason:"El proyecto contiene un número de archivos no permitido."};
 const seen=new Set<string>();
 let total=0;
 const normalized:ProjectSourceFile[]=[];
 for(const file of files){
  const path=validateGeneratedPath(file.path);
  if(!path.ok)return{ok:false,reason:`${file.path}: ${path.reason}`};
  if(seen.has(path.path))return{ok:false,reason:`Ruta duplicada: ${path.path}`};
  seen.add(path.path);
  const bytes=encoder.encode(file.content).byteLength;
  if(bytes>MAX_PROJECT_FILE_BYTES)return{ok:false,reason:`${path.path} supera el tamaño máximo permitido.`};
  total+=bytes;
  if(total>MAX_PROJECT_TOTAL_BYTES)return{ok:false,reason:"El proyecto supera el tamaño total permitido."};
  normalized.push({path:path.path,content:file.content});
 }
 const entrypoint=normalized.find(file=>file.path==="index.html");
 if(!entrypoint)return{ok:false,reason:"El proyecto no contiene index.html."};
 const html=validateGeneratedHtml(entrypoint.content);
 if(!html.ok)return html;
 return{ok:true,files:normalized.map(file=>file.path==="index.html"?{...file,content:html.html}:file).sort((a,b)=>a.path.localeCompare(b.path))};
}
