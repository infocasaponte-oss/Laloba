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
import { stripHtmlBlock } from "@/lib/html-apps";
import { authorizeGenerationV2,prepareGenerationV2Authorization,type PendingGenerationV2Authorization } from "@/lib/generation-v2-authorization";
import { parseGenerationResultV2 } from "@/lib/generation-result-v2";
import { parseGenerationPatch } from "@/lib/generation-patch";
import { authorizePatch, preparePatchAuthorization, type PendingPatchAuthorization } from "@/lib/generation-patch-authorization";
import { createGenerationId } from "@/lib/generation-id";
import { loadProjectHistory, recordProjectGeneration, restoreProjectGeneration } from "@/lib/project-history-store";
import { entrypointHtml } from "@/lib/project-tree";
import { createProjectChangeSet, type ProjectChangeSet } from "@/lib/project-change-set";
import { streamChat } from "@/lib/stream-chat";
import { useHasHydrated, useLaloba } from "@/lib/store";
import type { Mode } from "@/lib/types";
import { cn, slugify, uid } from "@/lib/utils";
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
  const appendMessage=useLaloba((s)=>s.appendMessage), setProjectFiles=useLaloba((s)=>s.setProjectFiles), spendCredits=useLaloba((s)=>s.spendCredits);
  const knowledge=useLaloba((s)=>s.knowledge), addDraft=useLaloba((s)=>s.addDraft), applyDraft=useLaloba((s)=>s.applyDraft);
  const addComment=useLaloba((s)=>s.addComment), rename=useLaloba((s)=>s.renameProject);
  const [tab,setTab]=useState<Tab>("preview"), [chatOpen,setChatOpen]=useState(true), [sideOpen,setSideOpen]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false), [shareOpen,setShareOpen]=useState(false), [publishOpen,setPublishOpen]=useState(false);
  const [commentsOpen,setCommentsOpen]=useState(false), [selectMode,setSelectMode]=useState(false), [streaming,setStreaming]=useState<string|null>(null);
  const [pendingGeneration,setPendingGeneration]=useState<PendingGenerationV2Authorization|null>(null);
  const [pendingGenerationChanges,setPendingGenerationChanges]=useState<ProjectChangeSet|null>(null);
  const [pendingPatch,setPendingPatch]=useState<PendingPatchAuthorization|null>(null);
  const [pendingPatchChanges,setPendingPatchChanges]=useState<ProjectChangeSet|null>(null);
  const currentHtml=entrypointHtml(project.tree);
  if(!currentHtml)throw new Error("Project tree is missing a valid index.html");
  const busy=streaming!==null, started=useRef(false);
  const generationHistory = historyOpen ? loadProjectHistory(projectId) : null;

  async function run(prompt:string, mode:Mode, reuseLastUser=false) {
    if(busy)return;
    const last=project.messages.at(-1);
    const userMsg=reuseLastUser&&last?.role==="user"
      ? last
      : {id:uid("m"),role:"user" as const,content:prompt,mode,createdAt:Date.now()};
    if(!reuseLastUser)appendMessage(projectId,userMsg);
    setStreaming("");
    const t0=Date.now();
    try{
      const initialBuild=mode==="build"&&reuseLastUser&&project.messages.every((message)=>message.role!=="assistant");
      const buildKind=mode==="build"?(initialBuild?"initial":"patch"):undefined;
      const outboundMessages=(reuseLastUser?project.messages:[...project.messages,userMsg]).map((message)=>({role:message.role,content:message.content}));
      const text=await streamChat({
        mode,
        buildKind,
        messages:outboundMessages,
        currentHtml:buildKind==="initial"?currentHtml:undefined,
        currentFiles:buildKind==="patch"?project.tree.files:undefined,
        knowledge:project.knowledge||knowledge,
        onDelta:(chunk)=>setStreaming((value)=>(value??"")+chunk),
      });

      const initialResult=mode==="build"&&buildKind==="initial"?parseGenerationResultV2(text):null;
      const patchResult=mode==="build"&&buildKind==="patch"?parseGenerationPatch(text):null;
      let visible=stripHtmlBlock(text)||text;
      let filesChanged:string[]=[];

      if(initialResult){
        if(initialResult.ok){
          visible=initialResult.result.summary;
          filesChanged=initialResult.result.files.map((file)=>file.path);
          const pending=await prepareGenerationV2Authorization(
            createGenerationId(),
            projectId,
            prompt,
            initialResult.result,
            project.tree.files,
          );
          const preview=await authorizeGenerationV2(pending,projectId,project.tree.files);
          setPendingGenerationChanges(await createProjectChangeSet(project.tree.files,preview.files));
          setPendingGeneration(pending);
        }else{
          visible=`No apliqué el resultado: ${initialResult.reason}`;
        }
      }

      if(patchResult){
        if(patchResult.ok){
          visible=patchResult.patch.summary;
          filesChanged=patchResult.patch.operations.map((operation)=>operation.path);
          const pending=await preparePatchAuthorization(createGenerationId(),projectId,prompt,patchResult.patch,project.tree.files);
          const preview=await authorizePatch(pending,projectId,project.tree.files);
          setPendingPatchChanges(await createProjectChangeSet(project.tree.files,preview.files));
          setPendingPatch(pending);
        }else{
          visible=`No apliqué el patch: ${patchResult.reason}`;
        }
      }

      const credits=mode==="plan"?0.4:1.1;
      spendCredits(credits);
      appendMessage(projectId,{id:uid("m"),role:"assistant",content:visible,mode,createdAt:Date.now(),credits,durationMs:Date.now()-t0,filesChanged});
    }catch(err){
      appendMessage(projectId,{id:uid("m"),role:"assistant",content:err instanceof Error?err.message:"No se pudo completar",mode,createdAt:Date.now()});
    }finally{
      setStreaming(null);
    }
  }
  async function applyPendingGeneration(pending:PendingGenerationV2Authorization) {
    const current=useLaloba.getState().projects.find((candidate)=>candidate.id===projectId);
    if(!current)throw new Error("Project no longer exists");
    const {files,manifest,snapshot}=await authorizeGenerationV2(pending,projectId,current.tree.files);
    recordProjectGeneration(projectId,{id:pending.generationId,summary:pending.result.summary,snapshot});
    console.info("laloba:generation-v2",{generationId:pending.generationId,manifest,snapshot,authorized:true});
    setProjectFiles(projectId,pending.generationId,files,pending.prompt.slice(0,40));
    setPendingGenerationChanges(null);
  }

  async function applyPendingPatch(pending:PendingPatchAuthorization) {
    const current=useLaloba.getState().projects.find((candidate)=>candidate.id===projectId);
    if(!current)throw new Error("Project no longer exists");
    const {files,manifest,snapshot}=await authorizePatch(pending,projectId,current.tree.files);
    recordProjectGeneration(projectId,{id:pending.generationId,summary:pending.patch.summary,snapshot});
    console.info("laloba:patch",{generationId:pending.generationId,manifest,snapshot,operations:pending.patch.operations,authorized:true});
    setProjectFiles(projectId,pending.generationId,files,pending.patch.summary.slice(0,40));
    setPendingPatchChanges(null);
  }

  useEffect(()=>{if(!autostart||started.current)return;const last=project.messages.at(-1);if(last?.role==="user"&&project.messages.filter((m)=>m.role==="assistant").length===0){started.current=true;void run(last.content,last.mode,true)}},[autostart]);
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
    <div className="min-h-0 flex-1">{chatOpen?<Group orientation="horizontal"><Panel defaultSize="32%" minSize="260px"><ChatPanel project={project} streaming={streaming} busy={busy} onSend={run}/></Panel><Separator className="w-px bg-border"/><Panel>{tab==="preview"?<PreviewPane html={currentHtml} selectMode={selectMode}/>:tab==="files"?<FilesPane project={project}/>:tab==="code"?<CodePane project={project}/>:<MorePanel project={project}/>}</Panel></Group>:tab==="preview"?<PreviewPane html={currentHtml} selectMode={selectMode}/>:tab==="files"?<FilesPane project={project}/>:tab==="code"?<CodePane project={project}/>:<MorePanel project={project}/>}</div>
  </div>
  <Sheet open={sideOpen} onOpenChange={setSideOpen}><SheetContent side="left"><div className="space-y-3 p-4"><LogoMark className="size-7"/><Link to="/">Panel</Link><Link to="/templates">Plantillas</Link><Link to="/connectors">Conectores</Link><Link to="/settings">Ajustes</Link></div></SheetContent></Sheet>
  <Dialog open={historyOpen} onOpenChange={setHistoryOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Historial</h2><div className="mt-3 space-y-2">{generationHistory?.generations.slice().reverse().map((g)=><button key={g.id} type="button" className="block w-full rounded-lg border border-border p-3 text-left" onClick={async()=>{try{const history=await restoreProjectGeneration(projectId,g.id);const current=history.generations.find((x)=>x.id===history.currentGenerationId);const html=current?.snapshot.files.find((file)=>file.path==="index.html")?.content;if(!html)throw new Error("Snapshot sin index.html");setProjectFiles(projectId,g.id,current!.snapshot.files.map(({path,content})=>({path,content})),`Restaurar ${g.summary.slice(0,30)}`);setHistoryOpen(false);toast.success("Generación restaurada y verificada")}catch{toast.error("No se pudo verificar esta generación")}}}><div className="text-sm font-medium">{g.summary}</div><div className="text-xs text-muted">{g.id}</div></button>)}{!generationHistory?.generations.length && <p className="text-sm text-muted">Todavía no hay generaciones verificadas. Las versiones antiguas se conservan en los datos del proyecto, pero ya no se restauran sin verificación de integridad.</p>}</div></DialogContent></Dialog>
  <Dialog open={Boolean(pendingGeneration)} onOpenChange={(open)=>{if(!open){setPendingGeneration(null);setPendingGenerationChanges(null)}}}><DialogContent>
    <h2 className="font-display text-lg font-semibold">Autorizar generación inicial</h2>
    <p className="text-sm text-muted">Laloba ha preparado un proyecto multiarchivo validado. El árbol actual se volverá a comprobar justo antes de aplicar la generación.</p>
    {pendingGeneration&&<div className="mt-3 space-y-2">
      <div className="text-sm font-medium">{pendingGeneration.result.summary}</div>
      {(pendingGenerationChanges?.changes ?? []).map((change)=><div key={change.path} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
        <code className="min-w-0 truncate text-xs">{change.path}</code>
        <div className="flex shrink-0 items-center gap-2"><span className="text-[11px] tabular-nums text-muted">{"bytes" in change?`${change.bytes} B`:""}</span><span className="rounded-full bg-elevated px-2 py-1 text-[11px] uppercase text-muted">{change.op}</span></div>
      </div>)}
      {pendingGenerationChanges&&<div className="pt-1 font-mono text-[10px] text-subtle">base {pendingGenerationChanges.baseTreeSha256.slice(0,12)} → next {pendingGenerationChanges.nextTreeSha256.slice(0,12)}</div>}
    </div>}
    <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={()=>{setPendingGeneration(null);setPendingGenerationChanges(null)}}>Descartar</Button><Button onClick={async()=>{const pending=pendingGeneration;if(!pending)return;try{await applyPendingGeneration(pending);setPendingGeneration(null);setPendingGenerationChanges(null);toast.success("Generación autorizada y aplicada")}catch(error){toast.error(error instanceof Error?error.message:"No se pudo aplicar la generación")}}}>Autorizar y aplicar</Button></div>
  </DialogContent></Dialog>
  <Dialog open={Boolean(pendingPatch)} onOpenChange={(open)=>{if(!open){setPendingPatch(null);setPendingPatchChanges(null)}}}><DialogContent>
    <h2 className="font-display text-lg font-semibold">Autorizar patch generado</h2>
    <p className="text-sm text-muted">Laloba propone operaciones sobre el árbol exacto que estaba activo al generar este cambio. Si el proyecto cambió entretanto, la autorización fallará.</p>
    {pendingPatch&&<div className="mt-3 space-y-2">
      <div className="text-sm font-medium">{pendingPatch.patch.summary}</div>
      {(pendingPatchChanges?.changes ?? []).map((change)=><div key={change.path} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
        <code className="min-w-0 truncate text-xs">{change.path}</code>
        <div className="flex shrink-0 items-center gap-2"><span className="text-[11px] tabular-nums text-muted">{"bytes" in change?`${change.bytes} B`:""}</span><span className="rounded-full bg-elevated px-2 py-1 text-[11px] uppercase text-muted">{change.op}</span></div>
      </div>)}
      {pendingPatchChanges&&<div className="pt-1 font-mono text-[10px] text-subtle">base {pendingPatchChanges.baseTreeSha256.slice(0,12)} → next {pendingPatchChanges.nextTreeSha256.slice(0,12)}</div>}
    </div>}
    <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={()=>{setPendingPatch(null);setPendingPatchChanges(null)}}>Descartar</Button><Button onClick={async()=>{const pending=pendingPatch;if(!pending)return;try{await applyPendingPatch(pending);setPendingPatch(null);toast.success("Patch autorizado y aplicado")}catch(error){toast.error(error instanceof Error?error.message:"No se pudo aplicar el patch")}}}>Autorizar y aplicar</Button></div>
  </DialogContent></Dialog>
  <Dialog open={shareOpen} onOpenChange={setShareOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Compartir</h2><Input readOnly value={typeof window!=="undefined"?window.location.href:""}/></DialogContent></Dialog>
  <Dialog open={publishOpen} onOpenChange={setPublishOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Publicar</h2><p className="text-sm text-muted">La publicación será una operación separada y autorizada. El preview no concede credenciales de despliegue.</p><Button onClick={()=>setPublishOpen(false)}>Entendido</Button></DialogContent></Dialog>
  <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}><DialogContent><h2 className="font-display text-lg font-semibold">Comentarios</h2><Textarea id="new-comment" placeholder="Añade un comentario"/><Button onClick={()=>{const el=document.getElementById("new-comment") as HTMLTextAreaElement|null;if(el?.value.trim()){addComment(project.id,el.value.trim());setCommentsOpen(false)}}}>Añadir</Button></DialogContent></Dialog>
  </TooltipProvider>;
}
