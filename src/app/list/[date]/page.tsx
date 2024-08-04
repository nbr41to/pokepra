import { Badge } from "@/components/ui/badge";
import { getCookie } from "@/utils/cookie";
import { DeleteButton } from "./_components/DeleteButton";
import { redirect } from "next/navigation";
import { PositionRangeButton } from "@/components/PositionRangeButton";
import { toHandString } from "@/utils/toHandString";
import { Main } from "./_components/Main";

export default async function Page({
  params: { date },
}: {
  params: {
    date: string;
  };
}) {
  const recordsJson = await getCookie("records");
  const records: Records = recordsJson ? JSON.parse(recordsJson) : {};
  const record = records[date];

  if (!record) redirect("/list");

  return (
    <div className="px-6">
      <Main hands={record.hands} />

      <div className="py-2 text-right">
        <DeleteButton />
      </div>
    </div>
  );
}
