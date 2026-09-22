import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { Folder, LayoutGrid, Plug, Search, Settings, Star } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLaloba } from "@/lib/store";

export function useCommandPalette() {
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen((v)=>!v)}
      if(e.key==="Escape")setOpen(false);
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);
  return{open,setOpen};
}

export function CommandPalette({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}) {
  const navigate=useNavigate();
  const projects=useLaloba((s)=>s.projects),folders=useLaloba((s)=>s.folders);
  function go(to:string){onOpenChange(false);void navigate({to:to as never})}
  if(!open)return null;
  return <div className="fixed inset-0 z-[80]">
    <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Cerrar búsqueda" onClick={()=>onOpenChange(false)}/>
    <Command label="Buscar" className="absolute top-[18%] left-1/2 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border),var(--shadow-lift)]">
      <div className="flex items-center gap-2 border-b border-border px-3"><Search className="size-4 text-subtle"/><Command.Input autoFocus placeholder="Buscar proyectos, carpetas, páginas…" className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"/></div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">Sin resultados</Command.Empty>
        <Command.Group heading="Ir a" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase">
          <Item onSelect={()=>go("/")} icon={<LayoutGrid className="size-4"/>}>Panel</Item>
          <Item onSelect={()=>go("/templates")} icon={<LayoutGrid className="size-4"/>}>Plantillas</Item>
          <Item onSelect={()=>go("/connectors")} icon={<Plug className="size-4"/>}>Conectores</Item>
          <Item onSelect={()=>go("/settings")} icon={<Settings className="size-4"/>}>Ajustes</Item>
          <Item onSelect={()=>go("/inbox")} icon={<Star className="size-4"/>}>Bandeja</Item>
        </Command.Group>
        <Command.Group heading="Proyectos" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase">
          {projects.map((p)=><Item key={p.id} onSelect={()=>go(`/projects/${p.id}`)} icon={p.starred?<Star className="size-4"/>:<LayoutGrid className="size-4"/>}>{p.name}</Item>)}
        </Command.Group>
        <Command.Group heading="Carpetas" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase">
          {folders.map((f)=><Item key={f.id} onSelect={()=>go(`/?folder=${f.id}`)} icon={<Folder className="size-4"/>}>{f.name}</Item>)}
        </Command.Group>
      </Command.List>
    </Command>
  </div>;
}
function Item({children,icon,onSelect}:{children:ReactNode;icon:ReactNode;onSelect:()=>void}) {
 return <Command.Item onSelect={onSelect} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-elevated"><span className="text-muted">{icon}</span>{children}</Command.Item>;
}
