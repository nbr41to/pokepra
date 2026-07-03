import { Gamepad2, Spade } from "lucide-react";
import { TabsContent } from "@/components/shadcn/tabs";
import { PageTitle } from "@/components/ui/page-title";

export function TrainersContent() {
  return (
    <TabsContent value="trainers" className="flex w-full flex-col items-center">
      <Gamepad2
        size={160}
        className="fixed -top-2 left-0 -z-10 -rotate-12 text-muted-foreground brightness-200 dark:brightness-20"
      />
      <Spade
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed right-0 bottom-20 -z-20 translate-x-1/5 rotate-12 text-blue-400 dark:text-blue-950"
      />
      <PageTitle
        title="Trainers"
        description="ゲームを通して確率を体感することができます。"
      />
    </TabsContent>
  );
}
