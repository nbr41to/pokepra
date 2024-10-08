import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/classNames";
import { ThemeProvider } from "@/libs/next-themes/theme-provider";
import { Header } from "./_header";
import { Toaster } from "sonner";
import { getCookie } from "@/utils/cookie";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const APP_NAME = "pokepra";
const APP_DEFAULT_TITLE = "pokepra";
const APP_TITLE_TEMPLATE = "%s - pokepra";
const APP_DESCRIPTION = "ポーカー練習じゃい";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};
// export const viewport: Viewport = {
//   themeColor: "#FFFFFF",
// };
export const generateViewport = async (): Promise<Viewport> => {
  const theme = await getCookie("theme");

  return {
    themeColor: theme === "dark" ? "#000000" : "#FFFFFF",
  };
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="mx-auto flex h-svh flex-col bg-background sm:max-w-sm">
            <Header />
            <main className="flex-grow pt-[42px]">{children}</main>
            <Toaster position="bottom-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
