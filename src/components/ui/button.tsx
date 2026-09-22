import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants=cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]",{variants:{variant:{default:"bg-primary text-primary-fg hover:opacity-90",secondary:"bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",ghost:"text-muted hover:bg-elevated hover:text-fg",danger:"bg-danger text-fg hover:opacity-90",outline:"text-fg shadow-[var(--shadow-border)] hover:bg-elevated"},size:{default:"h-10 px-4",sm:"h-8 px-3 text-xs",lg:"h-11 px-5",icon:"size-10","icon-sm":"size-8"}},defaultVariants:{variant:"default",size:"default"}});
export function Button({className,variant,size,asChild=false,...props}:React.ComponentProps<"button">&VariantProps<typeof buttonVariants>&{asChild?:boolean}) {
 const Comp=asChild?Slot:"button"; return <Comp className={cn(buttonVariants({variant,size,className}))}{...props}/>;
}
