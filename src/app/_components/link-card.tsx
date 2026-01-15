import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  description: string;
  className?: string;
};
export function LinkCard({ href, title, description, className }: Props) {
  return (
    <Link href={href} className={cn("w-full", className)}>
      <Card className="h-50 justify-between font-noto-sans-jp">
        <CardHeader className="px-5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button>始める</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
