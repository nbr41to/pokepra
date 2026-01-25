import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = {
  title: "Postflop",
};

export default function Page() {
  return (
    <>
      <PageTitle title="Postflop" hidable />
      <Main />
    </>
  );
}
