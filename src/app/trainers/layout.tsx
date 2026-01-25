import { FooterLayout } from "@/components/ui/footer-layout";
import { PageLayout } from "@/components/ui/page-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageLayout className="p-2 pb-0">
      {children}
      <FooterLayout
        menuName="trainers"
        className="fixed bottom-2 left-4 z-10"
      />
    </PageLayout>
  );
}
