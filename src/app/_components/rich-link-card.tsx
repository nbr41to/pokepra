import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};
export function RichLinkCard({
  href,
  title,
  description,
  icon,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-24 w-full overflow-hidden rounded-xl border bg-background/60 px-4 py-3 font-noto-sans-jp text-card-foreground shadow-sm backdrop-blur-xs",
        className,
      )}
    >
      <div className="relative z-10 mr-2 flex-1">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground text-xs leading-snug">
          {description}
        </p>
        {children}
      </div>

      <div className="absolute top-1 -right-3 mt-1 rotate-12 text-muted-foreground brightness-200 dark:brightness-20 [&_svg]:size-28 [&_svg]:stroke-2">
        {icon}
      </div>
    </Link>
  );
}
