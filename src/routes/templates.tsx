import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useLaloba } from "@/lib/store";
import type { Template } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATS=["todas","apps","sitios","dashboards","comercio"] as const;
export const Route=createFileRoute("/templates")({component:TemplatesPage});
function TemplatesPage(){
 const templates=useLaloba((s)=>s.templates),createProject=useLaloba((s)=>s.createProject),navigate=useNavigate();
 const [cat,setCat]=useState<(typeof CATS)[number]>("todas");
 const list=useMemo(()=>cat==="todas"?templates:templates.filter((t)=>t.category===cat),[templates,cat]);
 function remix(t:Template){const p=createProject({name:t.name,prompt:`Remix de plantilla: ${t.description}`,html:t.html,mode:"build"});void navigate({to:"/projects/$id",params:{id:p.id}})}
 return <AppShell><div className="mx-auto max-w-5xl px-4 py-8"><h1 className="font-display text-3xl font-semibold">Plantillas</h1><p className="mt-2 max-w-xl text-sm text-muted">Remixea una base lista. El código es tuyo y Laloba sigue el hilo en el chat.</p><div className="mt-6 flex flex-wrap gap-1">{CATS.map((c)=><button key={c} type="button" onClick={()=>setCat(c)} className={cn("rounded-full px-3 py-1.5 text-sm capitalize text-muted hover:bg-elevated",cat===c&&"bg-elevated text-fg")}>{c}</button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((t)=><article key={t.id} className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"><div className="h-32" style={{background:`linear-gradient(160deg, hsl(${t.hue} 14% 20%), hsl(${(t.hue+50)%360} 8% 10%))`}}/><div className="p-4"><p className="text-[11px] tracking-wide text-subtle uppercase">{t.category}</p><h2 className="mt-1 font-medium">{t.name}</h2><p className="mt-1 text-sm text-muted">{t.description}</p><Button className="mt-3" size="sm" onClick={()=>remix(t)}>Remix</Button></div></article>)}</div></div></AppShell>
}
