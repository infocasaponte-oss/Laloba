import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export const Dialog=DialogPrimitive.Root;export const DialogTrigger=DialogPrimitive.Trigger;export const DialogClose=DialogPrimitive.Close;
export function DialogContent({className,children,title}:{className?:string;children:ReactNode;title?:string}) {
 return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70"/><DialogPrimitive.Content className={cn("fixed top-1/2 left-1/2 z-50 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-5 text-fg shadow-[var(--shadow-border),var(--shadow-lift)]",className)}>
 {title?<DialogPrimitive.Title className="mb-3 font-display text-lg font-semibold">{title}</DialogPrimitive.Title>:<DialogPrimitive.Title className="sr-only">Diálogo</DialogPrimitive.Title>}
 {children}<DialogPrimitive.Close className="absolute top-3 right-3 rounded-full p-2 text-muted hover:bg-elevated hover:text-fg"><X className="size-4"/></DialogPrimitive.Close>
 </DialogPrimitive.Content></DialogPrimitive.Portal>;
}
