import type { Metadata } from "next";
import { montserrat, notoSansJP } from "@/styles/fonts";
import "@/styles/globals.css";
import { ThemeProvider } from "@/features/setting";
import { SettingButton } from "./_components/setting-button";

export const metadata: Metadata = {
  title: "MY POKER",
  description: "A poker training app to improve your preflop decision making.",
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
        className={`${notoSansJP.variable} ${montserrat.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
