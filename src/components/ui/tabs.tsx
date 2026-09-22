import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Tabs=TabsPrimitive.Root;
export function TabsList({className,...props}:ComponentProps<typeof TabsPrimitive.List>){return <TabsPrimitive.List className={cn("inline-flex gap-1 rounded-full bg-elevated p-1 shadow-[var(--shadow-border)]",className)} {...props}/>}
export function TabsTrigger({className,...props}:ComponentProps<typeof TabsPrimitive.Trigger>){return <TabsPrimitive.Trigger className={cn("rounded-full px-3 py-1.5 text-sm text-muted transition-colors duration-150 data-[state=active]:bg-surface data-[state=active]:text-fg",className)} {...props}/>}
export const TabsContent=TabsPrimitive.Content;
