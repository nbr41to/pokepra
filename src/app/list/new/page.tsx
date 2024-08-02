import { getCookie } from "@/utils/cookie";
import { Main } from "./_components/Main";
import { getDateString } from "@/utils/date";

export default async function Page() {
  const records = await getCookie("records");
  const dateString = getDateString();
  const todayRecord = records ? JSON.parse(records)[dateString] : {};
  const people = todayRecord?.people || 2;
  const hands: Hand[] = todayRecord?.hands || [];

  return (
    <div className="h-full">
      <Main people={people} hands={hands} />
    </div>
  );
}
