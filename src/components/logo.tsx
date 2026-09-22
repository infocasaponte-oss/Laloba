import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={cn("size-7",className)} aria-hidden>
    <rect width="32" height="32" rx="9" className="fill-primary" />
    <path d="M8 22.5 12.2 8h3.1L11.2 22.5H8Zm8.4 0L20.6 8h3.2l-4.2 14.5h-3.2ZM9.2 6.2 16 3.4l6.8 2.8-1.1 2.2L16 6.6l-5.7 1.8-1.1-2.2Z" className="fill-primary-fg" />
    <path d="M16 11.2 18.4 22.5h-4.8L16 11.2Z" className="fill-primary-fg/70" />
  </svg>;
}
export function LogoWord({ className }: { className?: string }) {
  return <span className={cn("flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight",className)}><LogoMark />Laloba</span>;
}
