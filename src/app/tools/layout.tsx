import { FooterLayout } from "@/components/footer-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FooterLayout menuName="tools" className="fixed bottom-0 left-0" />
    </>
  );
}
