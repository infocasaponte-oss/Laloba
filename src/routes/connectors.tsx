import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLaloba } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATS = ["todos", "datos", "pagos", "ia", "trabajo", "auth", "mcp"] as const;

export const Route = createFileRoute("/connectors")({ component: ConnectorsPage });

function ConnectorsPage() {
  const connectors = useLaloba((s) => s.connectors);
  const toggle = useLaloba((s) => s.toggleConnector);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("todos");
  const [sort, setSort] = useState<"popular" | "az" | "za">("popular");

  const list = useMemo(() => {
    let rows = connectors.filter((c) => {
      if (cat !== "todos" && c.category !== cat) return false;
      if (q && !`${c.name} ${c.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if (sort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "za") rows = [...rows].sort((a, b) => b.name.localeCompare(a.name, "es"));
    return rows;
  }, [connectors, q, cat, sort]);

  return <AppShell><div className="mx-auto max-w-5xl px-4 py-8">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold">Conectores</h1><p className="mt-2 text-sm text-muted">Servicios de la app y servidores MCP para el chat.</p></div><ButtonPlus/></div>
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar" className="max-w-xs"/>
      {CATS.map((c)=><button key={c} type="button" onClick={()=>setCat(c)} className={cn("rounded-full px-3 py-1.5 text-sm capitalize text-muted hover:bg-elevated",cat===c&&"bg-elevated text-fg")}>{c}</button>)}
      <select value={sort} onChange={(e)=>setSort(e.target.value as typeof sort)} className="ml-auto h-10 rounded-full bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]"><option value="popular">Popular</option><option value="az">A → Z</option><option value="za">Z → A</option></select>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((c)=><article key={c.id} className="flex flex-col rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"><div className="flex items-start justify-between gap-3"><h2 className="font-medium">{c.name}</h2><Switch checked={c.connected} onCheckedChange={()=>{toggle(c.id);toast(c.connected?`${c.name} desconectado`:`${c.name} conectado`)}}/></div><p className="mt-2 flex-1 text-sm text-muted">{c.description}</p><p className="mt-3 text-[11px] tracking-wide text-subtle uppercase">{c.category}</p></article>)}</div>
  </div></AppShell>;
}
function ButtonPlus(){return <button type="button" onClick={()=>toast("Añade un MCP con URL y token en producción")} className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-fg">Añadir MCP</button>}
