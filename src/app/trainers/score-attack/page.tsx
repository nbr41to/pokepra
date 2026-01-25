import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Score Attack" };

export default function Page() {
  return (
    <>
      <PageTitle title="Score Attack" hidable />
      <Main />
    </>
  );
}
