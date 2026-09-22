import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, History, Menu, MessageSquare, PanelLeft, Share2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ChatPanel } from "@/components/editor/chat-panel";
import { CodePane } from "@/components/editor/code-pane";
import { FilesPane } from "@/components/editor/files-pane";
import { MorePanel } from "@/components/editor/more-panel";
import { PreviewPane } from "@/components/editor/preview-pane";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSep, DropdownTrigger } from "@/components/ui/dropdown";
import { Input, Textarea } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { extractHtml, stripHtmlBlock } from "@/lib/html-apps";
import { validateGeneratedHtml } from "@/lib/generated-html";
import { streamChat } from "@/lib/stream-chat";
import { useHasHydrated, useLaloba } from "@/lib/store";
import type { Mode } from "@/lib/types";
import { cn, formatRelative, slugify, uid } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "preview" | "files" | "code" | "more";
export const Route = createFileRoute("/projects/$id")({
  validateSearch: (s: Record<string, unknown>): { autostart?: string } => typeof s.autostart === "string" ? { autostart: s.autostart } : {},
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams(); const { autostart } = Route.useSearch(); const hydrated = useHasHydrated();
  const project = useLaloba((s) => s.projects.find((p) => p.id === id)); const navigate = useNavigate();
  if (!hydrated) return <div className="grid min-h-dvh place-items-center text-muted">Cargando…</div>;
  if (!project) return <div className="grid min-h-dvh place-items-center"><div className="text-center"><p className="font-display text-lg">Proyecto no encontrado</p><Link to="/" className="mt-3 inline-block text-sm text-muted underline">Volver al panel</Link></div></div>;
  return <Editor projectId={project.id} autostart={autostart === "1"} onMissing={() => void navigate({ to: "/" })} />;
}

function Editor({ projectId, autostart }: { projectId: string; autostart: boolean; onMissing: () => void }) {
  const project = useLaloba((s) => s.projects.find((p) => p.id === projectId))!;
  const appendMessage=useLaloba((s)=>s.appendMessage), setHtml=useLaloba((s)=>s.setHtml), spendCredits=useLaloba((s)=>s.spendCredits);
  const knowledge=useLaloba((s)=>s.knowledge), addDraft=useLaloba((s)=>s.addDraft), applyDraft=useLaloba((s)=>s.applyDraft);
  const restoreVersion=useLaloba((s)=>s.restoreVersion), addComment=useLaloba((s)=>s.addComment), updateProject=useLaloba((s)=>s.updateProject), rename=useLaloba((s)=>s.renameProject);
  const [tab,setTab]=useState<Tab>("preview"), [chatOpen,setChatOpen]=useState(true), [sideOpen,setSideOpen]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false), [shareOpen,setShareOpen]=useState(false), [publishOpen,setPublishOpen]=useState(false);
  const [commentsOpen,setCommentsOpen]=useState(false), [selectMode,setSelectMode]=useState(false), [streaming,setStreaming]=useState<string|null>(null);
  const busy=streaming!==null, started=useRef(false);

  async function run(prompt:string, mode:Mode) {
    if (busy) return;
    const userMsg={id:uid("m"),role:"user" as const,content:prompt,mode,createdAt:Date.now()};
    appendMessage(projectId,userMsg); setStreaming(""); const t0=Date.now();
    try {
      const text=await streamChat({mode,messages:[...project.messages,userMsg].map((m)=>({role:m.role,content:m.content})),currentHtml:mode==="build"?project.html:undefined,knowledge:project.knowledge||knowledge,onDelta:(c)=>setStreaming((s)=>(s??"")+c)});
      const extractedHtml=extractHtml(text); const validation=extractedHtml?validateGeneratedHtml(extractedHtml):null; const html=validation?.ok?validation.html:null;
      const visible=validation&&!validation.ok?`No apliqué el resultado: ${validation.reason}`:stripHtmlBlock(text)||(html?"Listo. Revisé la vista previa.":text);
      if(html&&mode==="build") setHtml(projectId,html,prompt.slice(0,40));
      const credits=mode==="plan"?0.4:1.1; spendCredits(credits);
      appendMessage(projectId,{id:uid("m"),role:"assistant",content:visible,mode,createdAt:Date.now(),credits,durationMs:Date.now()-t0,filesChanged:html?["index.html"]:[]});
    } catch(err) { appendMessage(projectId,{id:uid("m"),role:"assistant",content:err instanceof Error?err.message:"No se pudo completar",mode,createdAt:Date.now()}); }
    finally { setStreaming(null); }
  }
  useEffect(()=>{if(!autostart||started.current)return;const last=project.messages.at(-1);if(last?.role==="user"&&project.messages.filter((m)=>m.role==="assistant").length===0){started.current=true;void run(last.content,last.mode)}},[autostart]);
  const tabs:{id:Tab;label:string}[]=[{id:"preview",label:"Vista previa"},{id:"files",label:"Archivos"},{id:"code",label:"Código"},{id:"more",label:"Más"}];

  return <TooltipProvider><div className="flex h-dvh flex-col bg-bg text-fg">
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2">
      <button type="button" className="flex size-9 items-center justify-center rounded-full hover:bg-elevated" aria-label="Menú" onClick={()=>setSideOpen(true)}><Menu className="size-4"/></button>
      <Link to="/" className="hidden items-center sm:flex"><LogoMark className="size-6"/></Link>
      <Dropdown><DropdownTrigger asChild><button type="button" className="flex min-w-0 items-center gap-1 rounded-md px-2 py-1 hover:bg-elevated"><span className="truncate font-display text-sm font-semibold">{project.name}</span><ChevronDown className="size-3.5 text-subtle"/></button></DropdownTrigger><DropdownContent align="start"><DropdownLabel>Principal</DropdownLabel><DropdownItem onSelect={()=>toast("Vista principal")}>Vista principal</DropdownItem>{project.drafts.map((d)=><DropdownItem key={d.id} onSelect={()=>applyDraft(project.id,d.id)}>{d.name}</DropdownItem>)}<DropdownSep/><DropdownItem onSelect={()=>{const name=window.prompt("Nombre del borrador","Borrador");if(name)addDraft(project.id,name)}}><Sparkles className="size-4"/> Nuevo borrador</DropdownItem><DropdownItem onSelect={()=>{const n=window.prompt("Renombrar",project.name);if(n)rename(project.id,n)}}>Renombrar</DropdownItem></DropdownContent></Dropdown>
      <Tooltip content="Historial"><Button size="icon-sm" variant="ghost" onClick={()=>setHistoryOpen(true)} aria-label="Historial"><History className="size-4"/></Button></Tooltip>
      <Tooltip content={chatOpen?"Ocultar chat":"Mostrar chat"}><Button size="icon-sm" variant="ghost" className="hidden md:flex" onClick={()=>setChatOpen((v)=>!v)} aria-label="Chat"><PanelLeft className="size-4"/></Button></Tooltip>
      <div className="mx-auto hidden items-center rounded-full bg-elevated p-1 md:flex">{tabs.map((t)=><button key={t.id} type="button" onClick={()=>setTab(t.id)} className={cn("rounded-full px-3 py-1 text-xs text-muted",tab===t.id&&"bg-surface text-fg shadow-[var(--shadow-border)]")}>{t.label}</button>)}</div>
      <div className="ml-auto flex items-center gap-1">{tab==="preview"&&<Button size="sm" variant={selectMode?"default":"ghost"} onClick={()=>setSelectMode((v)=>!v)}>Editar</Button>}<Button size="icon-sm" variant="ghost" aria-label="Comentarios" onClick={()=>setCommentsOpen(true)}><MessageSquare className="size-4"/></Button><Button size="sm" variant="ghost" onClick={()=>setShareOpen(true)}><Share2 className="size-4"/> Compartir</Button><Button size="sm" onClick={()=>setPublishOpen(true)}>Publicar</Button></div>
    </header>
    <div className="min-h-0 flex-1">{chatOpen?<Group orientation="horizontal"><Panel defaultSize="32%" minSize="260px"><ChatPanel project={project} streaming={streaming} busy={busy} onSend={run}/></Panel><Separator className="w-px bg-border"/><Panel>{tab==="preview"?<PreviewPane html={project.html} selectMode={selectMode}/>:tab==="files"?<FilesPane project={project}/>:tab==="code"?<CodePane html={project.html}/>:<MorePanel project={project}/>}</Panel></Group>:tab==="preview"?<PreviewPane html={project.html} selectMode={selectMode}/>:tab==="files"?<FilesPane project={project}/>:tab==="code"?<CodePane html={project.html}/>:<MorePanel project={project}/>}</div>
  </div>
  <Sheet open={sideOpen} onOpenChange={setSideOpen}><SheetContent side="left"><div className="space-y-3 p-4"><LogoMark className="size-7"/><Link to="/">Panel</Link><Link to="/templates">Plantillas</Link><Link to="/connectors">Conectores</Link><Link to="/settings">Ajustes</Link></div></SheetContent></Sheet>
  <Dialog open={historyOpen} onOpenChange={setHistoryOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Historial</h2><div className="mt-3 space-y-2">{project.versions.map((v)=><button key={v.id} type="button" className="block w-full rounded-lg border border-border p-3 text-left" onClick={()=>{restoreVersion(project.id,v.id);setHistoryOpen(false)}}><div className="text-sm font-medium">{v.label}</div><div className="text-xs text-muted">{formatRelative(v.createdAt)}</div></button>)}</div></DialogContent></Dialog>
  <Dialog open={shareOpen} onOpenChange={setShareOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Compartir</h2><Input readOnly value={typeof window!=="undefined"?window.location.href:""}/></DialogContent></Dialog>
  <Dialog open={publishOpen} onOpenChange={setPublishOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Publicar</h2><p className="text-sm text-muted">La publicación será una operación separada y autorizada. El preview no concede credenciales de despliegue.</p><Button onClick={()=>setPublishOpen(false)}>Entendido</Button></DialogContent></Dialog>
  <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Comentarios</h2><Textarea id="new-comment" placeholder="Añade un comentario"/><Button onClick={()=>{const el=document.getElementById("new-comment") as HTMLTextAreaElement|null;if(el?.value.trim()){addComment(project.id,el.value.trim());setCommentsOpen(false)}}}>Añadir</Button></DialogContent></Dialog>
  </TooltipProvider>;
}
