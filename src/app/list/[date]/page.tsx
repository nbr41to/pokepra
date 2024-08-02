import { PlayCard } from "@/components/PlayCard";
import { PositionBadge } from "@/components/PositionBadge";
import { Badge } from "@/components/ui/badge";
import { getCookie } from "@/utils/cookie";
import { DeleteButton } from "./_components/DeleteButton";
import { redirect } from "next/navigation";
import { PositionRangeButton } from "@/components/PositionRangeButton";

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
      <div className="divide-y py-4">
        {record.hands.map((hand, index) => (
          <div key={index} className="flex justify-between py-2">
            <div className="flex items-center">
              <p className="w-5 font-bold">{index + 1}.</p>
              <PlayCard value={hand.preflop[0]} size={40} />
              <PlayCard value={hand.preflop[1]} size={40} />

              <Badge
                className="ml-2"
                variant={hand.isJoin ? "destructive" : "outline"}
              >
                {hand.isJoin ? "Join" : "Fold"}
              </Badge>
            </div>

            <div>
              <PositionRangeButton position={hand.position} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t py-2 text-right">
        <DeleteButton />
      </div>
    </div>
  );
}
