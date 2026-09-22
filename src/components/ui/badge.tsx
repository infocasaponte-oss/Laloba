import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({className,tone="mute",...props}:ComponentProps<"span">&{tone?:"mute"|"ok"|"warn"|"danger"|"live"}) {
  return <span className={cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
    tone==="mute"&&"bg-elevated text-muted shadow-[var(--shadow-border)]",
    tone==="ok"&&"bg-success/15 text-success",
    tone==="warn"&&"bg-warn/15 text-warn",
    tone==="danger"&&"bg-danger/15 text-danger",
    tone==="live"&&"bg-steel/15 text-steel",
    className,
  )}{...props}/>;
}
