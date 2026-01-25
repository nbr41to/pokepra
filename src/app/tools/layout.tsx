import { FooterLayout } from "@/components/ui/footer-layout";
import { PageLayout } from "@/components/ui/page-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageLayout>
      {children}
      <FooterLayout menuName="tools" className="fixed bottom-6 left-4" />
    </PageLayout>
  );
}
