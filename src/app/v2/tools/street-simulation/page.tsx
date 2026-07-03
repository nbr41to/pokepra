import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex h-dvh flex-col">
      <PageTitle
        hidable
        title="Street Simulation"
        description="状態をシミュレーションします"
      />
      <Main />
    </div>
  );
}
