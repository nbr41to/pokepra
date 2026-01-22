import { FooterLayout } from "@/components/footer-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FooterLayout menuName="tips" className="fixed bottom-2 left-4" />
    </>
  );
}
