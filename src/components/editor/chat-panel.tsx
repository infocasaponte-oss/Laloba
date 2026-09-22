import { Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ReactNode } from "react";
import { PromptBox } from "@/components/prompt-box";
import { useLaloba } from "@/lib/store";
import type { Mode, Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatPanel({
  project,
  streaming,
  onSend,
}: {
  project: Project;
  streaming: string | null;
  onSend: (prompt: string, mode: Mode) => void;
}) {
  const restoreVersion = useLaloba((s) => s.restoreVersion);
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {project.messages.length === 0 && !streaming && (
          <div className="rounded-lg bg-elevated p-4 text-sm text-muted shadow-[var(--shadow-border)]">
            Dile a Laloba qué construir. En Plan solo discute; en Build escribe la app.
          </div>
        )}
        {project.messages.map((m) => (
          <article key={m.id} className={cn("max-w-prose text-sm", m.role === "user" ? "ml-6" : "")}>
            <p className="mb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">
              {m.role === "user" ? "Tú" : "Laloba"}
              {m.mode === "plan" && m.role === "user" ? " · Plan" : ""}
            </p>
            <div className="whitespace-pre-wrap text-fg">{m.content}</div>
            {m.role === "assistant" && (
              <div className="mt-2 flex flex-wrap gap-1 text-muted">
                <IconBtn label="Copiar" onClick={() => { void navigator.clipboard.writeText(m.content); toast("Copiado"); }}><Copy className="size-3.5" /></IconBtn>
                <IconBtn label="Revertir" onClick={() => {
                  const v = project.versions[project.versions.length - 2];
                  if (v) restoreVersion(project.id, v.id); else toast("No hay versión anterior");
                }}><RotateCcw className="size-3.5" /></IconBtn>
                <IconBtn label="Útil" onClick={() => toast("Gracias")}><ThumbsUp className="size-3.5" /></IconBtn>
                <IconBtn label="No útil" onClick={() => toast("Anotado")}><ThumbsDown className="size-3.5" /></IconBtn>
                {m.credits != null && <span className="px-2 text-[11px] tabular-nums">{m.credits.toFixed(1)} cr · {Math.round((m.durationMs ?? 0) / 1000)}s</span>}
              </div>
            )}
          </article>
        ))}
        {streaming !== null && (
          <article className="max-w-prose text-sm">
            <p className="mb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">Laloba</p>
            <div className="whitespace-pre-wrap text-fg">{streaming || <span className="text-muted">Trabajando…</span>}</div>
          </article>
        )}
      </div>
      <div className="border-t border-border p-3">
        <PromptBox compact onSubmit={onSend} placeholder="Pide un cambio, un plan o un arreglo…" />
      </div>
    </div>
  );
}

function IconBtn({children,onClick,label}:{children:ReactNode;onClick:()=>void;label:string}) {
  return <button type="button" aria-label={label} onClick={onClick} className="rounded-full p-1.5 hover:bg-elevated hover:text-fg">{children}</button>;
}
