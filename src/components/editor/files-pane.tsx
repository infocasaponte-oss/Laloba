import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";
import { toast } from "sonner";

export function FilesPane({ project }: { project: Project }) {
  const extras = project.files.filter((f) => f.path !== "index.html");
  return <div className="h-full overflow-y-auto p-6">
    <div className="mb-4 flex items-center justify-between">
      <div><h2 className="font-display text-lg font-semibold">Archivos</h2><p className="text-sm text-muted">Informes, exportaciones y adjuntos del proyecto.</p></div>
      <Button variant="secondary" onClick={()=>toast("Subida de archivos en demo")}><Upload className="size-4" /> Subir</Button>
    </div>
    <ul className="space-y-2">
      <li className="flex items-center gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
        <FileText className="size-4 text-muted" /><div className="min-w-0 flex-1"><p className="truncate text-sm">index.html</p><p className="text-xs text-muted">{Math.round(project.html.length/1024)} KB</p></div>
      </li>
      {extras.map((f)=><li key={f.path} className="flex items-center gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
        <FileText className="size-4 text-muted" /><div className="min-w-0 flex-1"><p className="truncate text-sm">{f.path}</p><p className="text-xs text-muted">{Math.round(f.content.length/1024)} KB</p></div>
      </li>)}
      {extras.length===0&&<p className="pt-6 text-sm text-muted">No hay documentos extra. Sube un CSV o PDF para que Laloba lo use de contexto.</p>}
    </ul>
  </div>;
}
