import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, Database, FileUp, Mic, Paperclip, Plus, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/components/ui/dropdown";
import { useLaloba } from "@/lib/store";
import type { Mode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PromptBox({compact,onSubmit,placeholder="Describe la app. Laloba la construye."}:{compact?:boolean;onSubmit?:(prompt:string,mode:Mode)=>void;placeholder?:string}) {
  const [value,setValue]=useState("");const [mode,setMode]=useState<Mode>("build");const [listening,setListening]=useState(false);
  const ta=useRef<HTMLTextAreaElement>(null);const fileRef=useRef<HTMLInputElement>(null);const navigate=useNavigate();const createProject=useLaloba((s)=>s.createProject);
  function send(){const prompt=value.trim();if(!prompt)return;if(onSubmit){onSubmit(prompt,mode);setValue("");return;}const project=createProject({prompt,mode});setValue("");void navigate({to:"/projects/$id",params:{id:project.id},search:{autostart:"1"}})}
  function mic(){
    const SR=(window as unknown as {webkitSpeechRecognition?:new()=>SpeechRecognition}).webkitSpeechRecognition??(window as unknown as {SpeechRecognition?:new()=>SpeechRecognition}).SpeechRecognition;
    if(!SR){toast("El dictado no está disponible en este navegador");return}
    const rec=new SR();rec.lang="es-ES";rec.onresult=(e)=>{const t=e.results[0]?.[0]?.transcript??"";setValue((v)=>(v?`${v} ${t}`:t));setListening(false)};rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);setListening(true);rec.start();
  }
  return <div className={cn("rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]",compact?"":"p-3")}>
    <textarea ref={ta} value={value} rows={compact?2:3} onChange={(e)=>setValue(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={placeholder} className="w-full resize-none bg-transparent px-2 py-2 text-sm text-fg outline-none placeholder:text-subtle"/>
    <div className="flex items-center gap-1">
      <Dropdown><DropdownTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Añadir contexto"><Plus className="size-4"/></Button></DropdownTrigger><DropdownContent align="start">
        <DropdownLabel>Añadir contexto</DropdownLabel>
        <DropdownItem onSelect={()=>fileRef.current?.click()}><Paperclip className="size-4"/> Adjuntar archivos</DropdownItem>
        <DropdownItem onSelect={()=>toast("Plantillas de diseño · demo")}><Sparkles className="size-4"/> Diseño</DropdownItem>
        <DropdownItem onSelect={()=>{void navigate({to:"/connectors"})}}><FileUp className="size-4"/> Conectores</DropdownItem>
        <DropdownItem onSelect={()=>toast("Laloba Cloud listo en el proyecto")}><Database className="size-4"/> Bases de datos</DropdownItem>
      </DropdownContent></Dropdown>
      <input ref={fileRef} type="file" className="hidden" multiple onChange={()=>toast("Archivo adjunto como contexto (demo)")}/>
      <button type="button" onClick={()=>setMode(mode==="build"?"plan":"build")} className="ml-1 rounded-full px-2.5 py-1 text-xs text-muted hover:bg-elevated hover:text-fg">{mode==="build"?"Build":"Plan"}</button>
      <div className="ml-auto flex items-center gap-1"><Button size="icon-sm" variant="ghost" aria-label="Dictar" onClick={mic} className={listening?"text-danger":""}><Mic className="size-4"/></Button><Button size="icon-sm" onClick={send} disabled={!value.trim()} aria-label="Enviar"><ArrowUp className="size-4"/></Button></div>
    </div>
  </div>;
}

type SpeechRecognition={lang:string;start:()=>void;onresult:((e:{results:{[k:number]:{[k:number]:{transcript:string}}}})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null};
