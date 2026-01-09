import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export const NavigationSection = ({ title, description, children }: Props) => {
  return (
    <section className="max-w-60 space-y-3">
      <div className="flex flex-wrap justify-between">
        <h2>{title}</h2>
        <p className="grow text-right font-noto-sans-jp text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
};
