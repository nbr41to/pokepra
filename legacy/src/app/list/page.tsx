import { Button } from "@/components/ui/button";
import { getCookie } from "@/utils/cookie";
import Link from "next/link";
import { DeleteButton } from "./_components/DeleteButton";

export default async function Page() {
  const recordsJson = await getCookie("records");
  const records: Records = recordsJson ? JSON.parse(recordsJson) : {};

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-3">
        <h2 className="font-bold">過去の記録</h2>
        <Button className="font-bold" asChild>
          <Link href="/list/new">記録をする</Link>
        </Button>
      </div>

      <div className="flex-grow divide-y">
        {Object.keys(records)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort by date in descending order
          .map((date) => (
            <Link
              key={date}
              href={`/list/${date}`}
              className="flex items-end gap-x-3 px-2 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <h2 className="font-bold">{date}</h2>
              <span className="text-sm">
                ({records[date].hands.length} hands)
              </span>
            </Link>
          ))}

        {Object.keys(records).length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">記録がありません。</p>
          </div>
        ) : (
          <div className="flex items-center justify-end p-3">
            <DeleteButton />
          </div>
        )}
      </div>
    </div>
  );
}
