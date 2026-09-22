import { Download, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { createGenerationId } from "@/lib/generation-id";
import { createGenerationManifest } from "@/lib/generation-manifest";
import { createProjectSnapshot } from "@/lib/project-files";
import { recordProjectGeneration } from "@/lib/project-history-store";
import { useLaloba } from "@/lib/store";
import type { Project } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { toast } from "sonner";

export function CodePane({ project }: { project: Project }) {
  const setProjectFiles=useLaloba((s)=>s.setProjectFiles);
  const files=project.tree.files;
  const [active,setActive]=useState(files[0]?.path ?? "index.html");
  const current=files.find((file)=>file.path===active) ?? files[0];
  const [draft,setDraft]=useState(current?.content ?? "");

  useEffect(()=>{
    setDraft(current?.content ?? "");
  },[current?.path,current?.content,project.currentGenerationId]);

  function download(){
    const entry=project.tree.files.find((file)=>file.path==="index.html");
    if(!entry)return;
    const blob=new Blob([entry.content],{type:"text/html"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`${slugify(project.name)}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Descargado index.html");
  }

  async function save(){
    if(!current||draft===current.content)return;
    const nextFiles=files.map((file)=>file.path===current.path?{...file,content:draft}:file);
    const generationId=createGenerationId();
    const createdAt=new Date().toISOString();
    try{
      const [snapshot,manifest]=await Promise.all([
        createProjectSnapshot(generationId,nextFiles,createdAt),
        createGenerationManifest(generationId,{schemaVersion:"2",summary:`Edición manual de ${current.path}`,files:nextFiles},createdAt),
      ]);
      if(snapshot.treeSha256!==manifest.treeSha256)throw new Error("Manual edit integrity mismatch");
      recordProjectGeneration(project.id,{id:generationId,summary:`Edición manual de ${current.path}`,snapshot});
      setProjectFiles(project.id,generationId,nextFiles,`Editar ${current.path}`);
      toast.success("Cambio guardado como generación verificada");
    }catch(error){
      toast.error(error instanceof Error?error.message:"No se pudo guardar el cambio");
    }
  }

  return <div className="flex h-full min-h-0">
    <aside className="w-44 shrink-0 overflow-y-auto border-r border-border p-2">
      {files.map((file)=><button key={file.path} type="button" onClick={()=>setActive(file.path)} className={cn("mb-0.5 w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-muted hover:bg-elevated hover:text-fg",active===file.path&&"bg-elevated text-fg")}>{file.path}</button>)}
      <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={download}><Download className="size-3.5"/> Descargar</Button>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs text-muted">{current?.path ?? "Sin archivo"}</span>
        <Button size="sm" onClick={()=>void save()} disabled={!current||draft===current.content}><Save className="size-3.5"/> Guardar</Button>
      </div>
      <Textarea className="h-full min-h-[50vh] flex-1 resize-none rounded-lg font-mono text-xs" value={draft} onChange={(event)=>setDraft(event.target.value)} />
    </div>
  </div>;
}
