import { Grid3X3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shadcn/button";

export const RangeSettingLink = () => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <label htmlFor="range-table-setting">マイレンジ表</label>
      <Button className="font-bold" size="lg" asChild>
        <Link href="/settings/open-range">
          設定
          <Grid3X3 />
        </Link>
      </Button>
    </div>
  );
};
