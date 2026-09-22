import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const widths = { desktop: "100%", tablet: 768, phone: 390 } as const;

export function PreviewPane({ html, selectMode }: { html: string; selectMode: boolean }) {
  const [device, setDevice] = useState<keyof typeof widths>("desktop");
  const srcDoc = useMemo(() => {
    if (!selectMode) return html;
    const inject = `<script>
      document.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        if (t.closest('a,button')) e.preventDefault();
        t.setAttribute('contenteditable','true');
        t.focus();
      }, true);
    </script>`;
    return html.replace("</body>", `${inject}</body>`);
  }, [html, selectMode]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        <Button size="icon-sm" variant={device === "desktop" ? "secondary" : "ghost"} aria-label="Escritorio" onClick={() => setDevice("desktop")}><Monitor className="size-4" /></Button>
        <Button size="icon-sm" variant={device === "tablet" ? "secondary" : "ghost"} aria-label="Tableta" onClick={() => setDevice("tablet")}><Tablet className="size-4" /></Button>
        <Button size="icon-sm" variant={device === "phone" ? "secondary" : "ghost"} aria-label="Móvil" onClick={() => setDevice("phone")}><Smartphone className="size-4" /></Button>
        {selectMode && <span className="ml-2 text-xs text-muted">Edición visual · clic en un texto</span>}
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-3">
        <iframe title="Vista previa" srcDoc={srcDoc} className={cn("h-full rounded-lg bg-elevated shadow-[var(--shadow-border)]", device === "desktop" ? "w-full" : "")} style={device === "desktop" ? undefined : { width: widths[device], maxWidth: "100%" }} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" />
      </div>
    </div>
  );
}
