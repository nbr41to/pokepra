import { FooterLayout } from "@/components/footer-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FooterLayout
        menuName="tips"
        className="fixed top-[calc(100dvh-56px)] left-4"
      />
    </>
  );
}
