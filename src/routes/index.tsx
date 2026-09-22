import { createFileRoute,Link } from "@tanstack/react-router";
import { FolderPlus } from "lucide-react";
import { useMemo,useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProjectCard } from "@/components/project-card";
import { PromptBox } from "@/components/prompt-box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";
import { useLaloba } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

type Search={folder?:string;starred?:boolean};
export const Route=createFileRoute("/")({
 validateSearch:(s:Record<string,unknown>):Search=>{const next:Search={};if(typeof s.folder==="string")next.folder=s.folder;if(s.starred===true||s.starred==="true")next.starred=true;return next},
 component:Home,
});
function Home(){
 const {folder,starred}=Route.useSearch(),displayName=useLaloba((s)=>s.displayName),projects=useLaloba((s)=>s.projects),folders=useLaloba((s)=>s.folders),templates=useLaloba((s)=>s.templates),addFolder=useLaloba((s)=>s.addFolder),first=displayName.split(" ")[0]??"Alex",[q,setQ]=useState("");
 const visible=useMemo(()=>projects.filter((p)=>{if(folder&&p.folderId!==folder)return false;if(starred&&!p.starred)return false;if(q&&!p.name.toLowerCase().includes(q.toLowerCase()))return false;return true}),[projects,folder,starred,q]);
 const folderName=folders.find((f)=>f.id===folder)?.name;
 return <AppShell><div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12"><p className="text-sm text-muted">Workspace Laloba Studio</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">¿Qué construimos hoy, {first}?</h1><div className="mt-6"><PromptBox/></div>
  <Tabs defaultValue="recents" className="mt-10"><div className="flex flex-wrap items-center gap-3"><TabsList><TabsTrigger value="recents">Recientes</TabsTrigger><TabsTrigger value="templates">Plantillas</TabsTrigger><TabsTrigger value="starred">Destacados</TabsTrigger></TabsList><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Filtrar proyectos" className="ml-auto h-9 max-w-56"/><Button size="sm" variant="secondary" onClick={()=>{const name=window.prompt("Nombre de carpeta");if(name)addFolder(name)}}><FolderPlus className="size-4"/> Carpeta</Button></div>
   {(folderName||starred)&&<p className="mt-4 text-sm text-muted">{starred?"Destacados":`Carpeta · ${folderName}`} · <Link to="/" className="underline">ver todos</Link></p>}
   <TabsContent value="recents" className="mt-5">{visible.length===0?<p className="py-12 text-center text-sm text-muted">No hay proyectos aquí. Empieza con el recuadro de arriba.</p>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((p)=><ProjectCard key={p.id} project={p}/>)}</div>}</TabsContent>
   <TabsContent value="templates" className="mt-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{templates.map((t)=><Link key={t.id} to="/templates" className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"><div className="h-28" style={{background:`linear-gradient(160deg, hsl(${t.hue} 12% 18%), hsl(${(t.hue+30)%360} 8% 10%))`}}/><div className="p-3"><h3 className="font-medium">{t.name}</h3><p className="mt-1 text-xs text-muted">{t.description}</p></div></Link>)}</div></TabsContent>
   <TabsContent value="starred" className="mt-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{projects.filter((p)=>p.starred).map((p)=><ProjectCard key={p.id} project={p}/>)}</div></TabsContent>
  </Tabs>
  <section className="mt-12"><h2 className="font-display text-sm font-medium text-muted">Actividad</h2><ul className="mt-3 space-y-2 text-sm">{projects.slice(0,4).map((p)=><li key={p.id} className="flex justify-between gap-3 text-muted"><Link to="/projects/$id" params={{id:p.id}} className="text-fg hover:underline">{p.name}</Link><span className="tabular-nums">{formatRelative(p.updatedAt)}</span></li>)}</ul></section>
 </div></AppShell>;
}
