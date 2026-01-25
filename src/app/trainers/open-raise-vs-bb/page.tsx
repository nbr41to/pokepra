import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Open Raise vs BB" };

export default function Page() {
  return (
    <>
      <PageTitle title="Open Raise vs BB" />
      <Main />
    </>
  );
}
