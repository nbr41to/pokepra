import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  description: string;
  buttonLabel?: string;
  className?: string;
};
export function LinkCard({
  href,
  title,
  description,
  buttonLabel = "始める",
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-40 w-full flex-col justify-between gap-6 rounded-xl border bg-background/80 px-4 py-3 font-noto-sans-jp text-card-foreground shadow-sm",
        className,
      )}
    >
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground text-sm leading-snug">
          {description}
        </p>
      </div>
      <div className="flex justify-end">
        <Button className="min-w-24">{buttonLabel}</Button>
      </div>
    </Link>
  );
}
