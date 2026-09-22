import { Link,useNavigate,useRouterState } from "@tanstack/react-router";
import { Bell,ChevronDown,Folder,Inbox,LayoutGrid,Menu,Moon,PanelLeft,Plug,Plus,Search,Settings,Sparkles,Star,Sun } from "lucide-react";
import { useMemo,useState,type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { CommandPalette,useCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent } from "@/components/ui/dialog";
import { Dropdown,DropdownContent,DropdownItem,DropdownLabel,DropdownSep,DropdownTrigger } from "@/components/ui/dropdown";
import { Sheet,SheetContent } from "@/components/ui/sheet";
import { Tooltip,TooltipProvider } from "@/components/ui/tooltip";
import { useLaloba } from "@/lib/store";
import { cn,initials } from "@/lib/utils";
import { toast } from "sonner";

const NAV=[{to:"/",label:"Panel",icon:LayoutGrid},{to:"/templates",label:"Plantillas",icon:Sparkles},{to:"/connectors",label:"Conectores",icon:Plug},{to:"/inbox",label:"Bandeja",icon:Inbox}] as const;

export function AppShell({children}:{children:ReactNode}) {
 const collapsed=useLaloba((s)=>s.sidebarCollapsed),{open,setOpen}=useCommandPalette(),[mobile,setMobile]=useState(false);
 return <TooltipProvider><div className="flex min-h-dvh bg-bg text-fg">
  <aside className={cn("hidden shrink-0 flex-col border-r border-border bg-surface md:flex",collapsed?"w-[72px]":"w-[260px]")}><Sidebar collapsed={collapsed} onSearch={()=>setOpen(true)}/></aside>
  <div className="flex min-w-0 flex-1 flex-col"><header className="flex h-14 items-center gap-2 border-b border-border px-3 md:hidden"><button type="button" className="flex size-10 items-center justify-center rounded-full hover:bg-elevated" onClick={()=>setMobile(true)} aria-label="Abrir menú"><Menu className="size-5"/></button><LogoMark/><span className="font-display font-semibold">Laloba</span><div className="ml-auto flex items-center gap-1"><Button size="icon-sm" variant="ghost" onClick={()=>setOpen(true)} aria-label="Buscar"><Search className="size-4"/></Button><Link to="/inbox" className="flex size-10 items-center justify-center rounded-full hover:bg-elevated"><Bell className="size-4"/></Link></div></header><main className="min-w-0 flex-1">{children}</main></div>
  <Sheet open={mobile} onOpenChange={setMobile}><SheetContent title="Navegación"><Sidebar collapsed={false} onSearch={()=>{setMobile(false);setOpen(true)}} onNavigate={()=>setMobile(false)}/></SheetContent></Sheet>
  <CommandPalette open={open} onOpenChange={setOpen}/>
 </div></TooltipProvider>;
}

function Sidebar({collapsed,onSearch,onNavigate}:{collapsed:boolean;onSearch:()=>void;onNavigate?:()=>void}) {
 const pathname=useRouterState({select:(s)=>s.location.pathname}),workspace=useLaloba((s)=>s.workspaceName),projects=useLaloba((s)=>s.projects),folders=useLaloba((s)=>s.folders),credits=useLaloba((s)=>s.credits),cap=useLaloba((s)=>s.creditsCap);
 const recents=useMemo(()=>[...projects].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,5),[projects]),starred=projects.filter((p)=>p.starred),[upgrade,setUpgrade]=useState(false);
 const item=(active:boolean)=>cn("flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted hover:bg-elevated hover:text-fg",collapsed&&"justify-center px-0",active&&"bg-elevated text-fg");
 return <div className="flex h-full flex-col">
  <div className={cn("flex h-14 items-center gap-2 px-3",collapsed&&"justify-center px-2")}><Dropdown><DropdownTrigger asChild><button type="button" className={cn("flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-elevated",collapsed&&"px-0")} onClick={collapsed?()=>useLaloba.getState().setSidebarCollapsed(false):undefined}><LogoMark/>{!collapsed&&<><span className="max-w-[120px] truncate font-display text-sm font-semibold">{workspace}</span><ChevronDown className="size-3.5 shrink-0 text-subtle"/></>}</button></DropdownTrigger><DropdownContent align="start"><DropdownLabel>Workspaces</DropdownLabel><DropdownItem>{workspace}</DropdownItem><DropdownItem onSelect={()=>toast("Workspace Personal (demo)")}>Personal</DropdownItem><DropdownSep/><DropdownItem onSelect={()=>toast("Crear workspace es una demo")}><Plus className="size-4"/> Nuevo workspace</DropdownItem></DropdownContent></Dropdown>{!collapsed&&<button type="button" className="ml-auto hidden size-8 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg md:flex" onClick={()=>useLaloba.getState().setSidebarCollapsed(true)} aria-label="Colapsar barra"><PanelLeft className="size-4"/></button>}</div>
  <nav className="flex flex-col gap-0.5 px-2">{NAV.map((n)=>{const Icon=n.icon;const node=<Link key={n.to} to={n.to} className={item(pathname===n.to)} onClick={onNavigate}><Icon className="size-4 shrink-0"/>{!collapsed&&n.label}</Link>;return collapsed?<Tooltip key={n.to} content={n.label}>{node}</Tooltip>:node})}{collapsed?<Tooltip content="Buscar"><button type="button" className={item(false)} onClick={onSearch}><Search className="size-4"/></button></Tooltip>:<button type="button" className={item(false)} onClick={onSearch}><Search className="size-4"/>Buscar<kbd className="ml-auto rounded bg-elevated px-1.5 py-0.5 text-[10px] text-subtle">⌘K</kbd></button>}</nav>
  {!collapsed&&<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2"><p className="px-2.5 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">Proyectos</p><Link to="/" className={item(pathname==="/")} onClick={onNavigate}><Folder className="size-4"/> Todos</Link>{folders.map((f)=><Link key={f.id} to="/" search={{folder:f.id} as never} className={item(false)} onClick={onNavigate}><Folder className="size-4"/> {f.name}</Link>)}<Link to="/" search={{starred:true} as never} className={item(false)} onClick={onNavigate}><Star className="size-4"/> Destacados<span className="ml-auto tabular-nums text-xs text-subtle">{starred.length}</span></Link><p className="mt-4 px-2.5 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">Recientes</p>{recents.map((p)=><Link key={p.id} to="/projects/$id" params={{id:p.id}} className={item(pathname===`/projects/${p.id}`)} onClick={onNavigate}><span className="size-2 shrink-0 rounded-full" style={{background:`hsl(${p.hue} 18% 48%)`}}/><span className="truncate">{p.name}</span></Link>)}</div>}
  <div className="mt-auto space-y-2 p-2">{!collapsed&&<button type="button" onClick={()=>setUpgrade(true)} className="w-full rounded-lg bg-elevated p-3 text-left shadow-[var(--shadow-border)]"><p className="text-xs font-medium">Plan Free</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full bg-primary" style={{width:`${(credits/cap)*100}%`}}/></div><p className="mt-1.5 text-[11px] text-muted tabular-nums">{credits} / {cap} créditos</p></button>}<UserMenu collapsed={collapsed} onNavigate={onNavigate}/></div><UpgradeDialog open={upgrade} onOpenChange={setUpgrade}/>
 </div>;
}

function UserMenu({collapsed,onNavigate}:{collapsed:boolean;onNavigate?:()=>void}) {
 const name=useLaloba((s)=>s.displayName),inbox=useLaloba((s)=>s.inbox),theme=useLaloba((s)=>s.theme),setTheme=useLaloba((s)=>s.setTheme),unread=inbox.filter((i)=>!i.read).length,navigate=useNavigate();
 return <Dropdown><DropdownTrigger asChild><button type="button" className={cn("relative flex h-11 w-full items-center gap-2 rounded-md px-2 hover:bg-elevated",collapsed&&"justify-center px-0")}><span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">{initials(name)}</span>{!collapsed&&<span className="truncate text-sm">{name}</span>}{unread>0&&<span className="absolute top-1.5 left-7 size-2 rounded-full bg-danger"/>}</button></DropdownTrigger><DropdownContent><DropdownItem onSelect={()=>{onNavigate?.();void navigate({to:"/settings"})}}>Perfil</DropdownItem><DropdownItem onSelect={()=>{onNavigate?.();void navigate({to:"/inbox"})}}><Inbox className="size-4"/> Bandeja{unread>0&&<span className="ml-auto text-xs text-muted">{unread}</span>}</DropdownItem><DropdownItem onSelect={()=>{onNavigate?.();void navigate({to:"/settings"})}}><Settings className="size-4"/> Ajustes</DropdownItem><DropdownSep/><DropdownLabel>Apariencia</DropdownLabel><DropdownItem onSelect={()=>setTheme("dark")}><Moon className="size-4"/> Oscuro {theme==="dark"?"·":""}</DropdownItem><DropdownItem onSelect={()=>setTheme("light")}><Sun className="size-4"/> Claro</DropdownItem><DropdownItem onSelect={()=>setTheme("system")}>Sistema</DropdownItem><DropdownSep/><DropdownItem onSelect={()=>toast("Centro de ayuda (demo)")}>Soporte</DropdownItem><DropdownItem onSelect={()=>toast("Documentación (demo)")}>Documentación</DropdownItem><DropdownItem onSelect={()=>toast("Sesión local · no hay cuentas")}>Cerrar sesión</DropdownItem></DropdownContent></Dropdown>;
}

function UpgradeDialog({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}) {
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent title="Planes de Laloba" className="max-w-3xl"><div className="grid gap-3 sm:grid-cols-3">{[
  {name:"Free",price:"0 €",items:["5 créditos/día","Vista previa","Plantillas"]},
  {name:"Pro",price:"25 €",items:["100 créditos/mes","Editar código","Dominio"]},
  {name:"Business",price:"50 €",items:["SSO","Plantillas de diseño","Roles"]},
 ].map((p)=><article key={p.name} className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]"><h3 className="font-display font-semibold">{p.name}</h3><p className="mt-1 text-2xl font-medium tabular-nums">{p.price}</p><ul className="mt-3 space-y-1 text-sm text-muted">{p.items.map((i)=><li key={i}>{i}</li>)}</ul><Button className="mt-4 w-full" variant={p.name==="Pro"?"default":"secondary"} onClick={()=>toast("Planes de demostración")}>Elegir</Button></article>)}</div></DialogContent></Dialog>;
}
