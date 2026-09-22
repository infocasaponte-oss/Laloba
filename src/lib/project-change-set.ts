import type { ProjectSourceFile } from "./generation-patch";
import { validateProjectArtifact } from "./project-artifact";
import { projectTreeSha256,sha256 } from "./project-files";

const encoder=new TextEncoder();

export type ProjectChange=
 |{op:"create";path:string;bytes:number;sha256:string}
 |{op:"update";path:string;bytes:number;sha256:string;previousSha256:string}
 |{op:"delete";path:string;previousSha256:string};

export type ProjectChangeSet={
 schemaVersion:"1";
 baseTreeSha256:string;
 nextTreeSha256:string;
 changes:ProjectChange[];
};

export async function createProjectChangeSet(
 baseFiles:ProjectSourceFile[],
 nextFiles:ProjectSourceFile[],
):Promise<ProjectChangeSet>{
 const base=validateProjectArtifact(baseFiles);
 if(!base.ok)throw new Error(`Invalid base project: ${base.reason}`);
 const next=validateProjectArtifact(nextFiles);
 if(!next.ok)throw new Error(`Invalid next project: ${next.reason}`);

 const baseByPath=new Map(base.files.map((file)=>[file.path,file.content]));
 const nextByPath=new Map(next.files.map((file)=>[file.path,file.content]));
 const paths=Array.from(new Set([...baseByPath.keys(),...nextByPath.keys()])).sort((a,b)=>a.localeCompare(b));
 const changes:ProjectChange[]=[];

 for(const path of paths){
  const before=baseByPath.get(path);
  const after=nextByPath.get(path);
  if(before===after)continue;
  if(before===undefined&&after!==undefined){
   changes.push({op:"create",path,bytes:encoder.encode(after).byteLength,sha256:await sha256(after)});
   continue;
  }
  if(before!==undefined&&after===undefined){
   changes.push({op:"delete",path,previousSha256:await sha256(before)});
   continue;
  }
  if(before!==undefined&&after!==undefined){
   changes.push({
    op:"update",
    path,
    bytes:encoder.encode(after).byteLength,
    previousSha256:await sha256(before),
    sha256:await sha256(after),
   });
  }
 }

 return{
  schemaVersion:"1",
  baseTreeSha256:await projectTreeSha256(base.files),
  nextTreeSha256:await projectTreeSha256(next.files),
  changes,
 };
}
