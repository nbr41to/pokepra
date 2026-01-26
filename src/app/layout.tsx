import type { Metadata } from "next";
import { montserrat, notoSansJP } from "@/styles/fonts";
import "@/styles/globals.css";
import { ThemeProvider } from "@/features/setting";
import { ServiceWorkerRegister } from "./_components/service-worker-register";
import { SettingButton } from "./_components/setting-button";

export const metadata: Metadata = {
  title: {
    template: "%s | MCPT",
    default: "MCPT",
  },
  applicationName: "Monte Carlo Poker Trainer",
  description: "初心者と感覚派のための楽しいポーカートレーナー",
  keywords: ["poker"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} ${montserrat.variable} mx-auto max-w-xl antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          <SettingButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
