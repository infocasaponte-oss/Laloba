import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLaloba } from "@/lib/store";
import { formatRelative } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({ component: InboxPage });

function InboxPage() {
  const inbox=useLaloba((s)=>s.inbox), news=useLaloba((s)=>s.news), mark=useLaloba((s)=>s.markInbox), resolve=useLaloba((s)=>s.resolveInbox);
  const unread=inbox.filter((i)=>!i.read).length;
  return <AppShell><div className="mx-auto max-w-3xl px-4 py-8">
    <h1 className="font-display text-3xl font-semibold">Bandeja</h1><p className="mt-2 text-sm text-muted">Invitaciones, accesos y novedades del producto.{unread>0?` ${unread} sin leer.`:""}</p>
    <Tabs defaultValue="inbox" className="mt-6"><TabsList><TabsTrigger value="inbox">Bandeja</TabsTrigger><TabsTrigger value="news">Novedades</TabsTrigger></TabsList>
      <TabsContent value="inbox" className="mt-5 space-y-3">{inbox.length===0&&<p className="text-sm text-muted">Nada pendiente.</p>}{inbox.map((item)=><article key={item.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]" onClick={()=>mark(item.id,true)}><div className="flex items-start justify-between gap-3"><h2 className="font-medium">{item.title}</h2>{!item.read&&<span className="mt-1 size-2 shrink-0 rounded-full bg-steel"/>}</div><p className="mt-1 text-sm text-muted">{item.body}</p><p className="mt-2 text-xs text-subtle">{formatRelative(item.createdAt)}</p>{item.actionable&&<div className="mt-3 flex gap-2"><Button size="sm" onClick={()=>{resolve(item.id);toast("Aceptado")}}>Aceptar</Button><Button size="sm" variant="secondary" onClick={()=>{resolve(item.id);toast("Rechazado")}}>Rechazar</Button></div>}</article>)}</TabsContent>
      <TabsContent value="news" className="mt-5 space-y-3">{news.map((n)=><article key={n.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"><p className="text-[11px] tracking-wide text-subtle uppercase">{n.tag} · {n.date}</p><h2 className="mt-1 font-medium">{n.title}</h2><p className="mt-1 text-sm text-muted">{n.body}</p></article>)}</TabsContent>
    </Tabs>
  </div></AppShell>;
}
