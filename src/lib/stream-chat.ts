export type StreamProjectFile={path:string;content:string};

export async function streamChat(input:{
  mode:"build"|"plan";
  buildKind?:"initial"|"patch";
  messages:{role:string;content:string}[];
  currentHtml?:string;
  currentFiles?:StreamProjectFile[];
  knowledge?:string;
  onDelta:(chunk:string)=>void;
}):Promise<string>{
  const res=await fetch("/api/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      mode:input.mode,
      buildKind:input.buildKind,
      messages:input.messages,
      currentHtml:input.currentHtml,
      currentFiles:input.currentFiles,
      knowledge:input.knowledge,
    }),
  });
  if(!res.ok){
    const data=(await res.json().catch(()=>({}))) as {error?:string};
    throw new Error(data.error||`Error ${res.status}`);
  }
  if(!res.body)throw new Error("Sin respuesta");
  const reader=res.body.getReader();
  const decoder=new TextDecoder();
  let buffer="";let full="";
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    buffer+=decoder.decode(value,{stream:true});
    const parts=buffer.split("\n");
    buffer=parts.pop()??"";
    for(const line of parts){
      const trimmed=line.trim();
      if(!trimmed.startsWith("data:"))continue;
      const data=trimmed.slice(5).trim();
      if(data==="[DONE]")continue;
      try{
        const json=JSON.parse(data) as {choices?:{delta?:{content?:string}}[]};
        const piece=json.choices?.[0]?.delta?.content??"";
        if(piece){full+=piece;input.onDelta(piece)}
      }catch{
        // Ignore malformed provider SSE frames; the final contract parser remains fail-closed.
      }
    }
  }
  return full;
}
