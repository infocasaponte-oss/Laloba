import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useLaloba } from "@/lib/store";
import type { Project } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { toast } from "sonner";

export function CodePane({ project }: { project: Project }) {
  const setHtml = useLaloba((s) => s.setHtml);
  const files = project.files.length ? project.files : [{ path: "index.html", content: project.html }];
  const [active, setActive] = useState(files[0]?.path ?? "index.html");
  const current = files.find((f) => f.path === active) ?? files[0];
  function download() {
    const blob = new Blob([project.html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(project.name)}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Descargado index.html");
  }
  return <div className="flex h-full min-h-0">
    <aside className="w-44 shrink-0 overflow-y-auto border-r border-border p-2">
      {files.map((f)=><button key={f.path} type="button" onClick={()=>setActive(f.path)} className={cn("mb-0.5 w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-muted hover:bg-elevated hover:text-fg",active===f.path&&"bg-elevated text-fg")}>{f.path}</button>)}
      <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={download}><Download className="size-3.5" /> Descargar</Button>
    </aside>
    <div className="min-w-0 flex-1 p-2">
      <Textarea className="h-full min-h-[50vh] resize-none rounded-lg font-mono text-xs" value={current?.content ?? ""} onChange={(e)=>{if(current?.path==="index.html")setHtml(project.id,e.target.value,"Edición en código")}} />
    </div>
  </div>;
}
