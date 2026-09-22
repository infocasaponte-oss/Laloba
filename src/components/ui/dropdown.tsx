import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
export const Dropdown=DropdownMenuPrimitive.Root;export const DropdownTrigger=DropdownMenuPrimitive.Trigger;
export function DropdownContent({className,children,align="end"}:{className?:string;children:ReactNode;align?:"start"|"center"|"end"}) {
 return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content align={align} sideOffset={6} className={cn("z-50 min-w-48 rounded-lg bg-surface p-1 text-sm text-fg shadow-[var(--shadow-border),var(--shadow-lift)]",className)}>{children}</DropdownMenuPrimitive.Content></DropdownMenuPrimitive.Portal>;
}
export function DropdownItem({className,destructive,...props}:ComponentProps<typeof DropdownMenuPrimitive.Item>&{destructive?:boolean}) {
 return <DropdownMenuPrimitive.Item className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 outline-none data-[highlighted]:bg-elevated",destructive&&"text-danger",className)} {...props}/>;
}
export function DropdownSep(){return <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border"/>}
export function DropdownLabel({children}:{children:ReactNode}){return <DropdownMenuPrimitive.Label className="px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-subtle uppercase">{children}</DropdownMenuPrimitive.Label>}
