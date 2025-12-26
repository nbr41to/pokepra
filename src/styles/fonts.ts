import { Montserrat, Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["600", "800"],
  subsets: ["latin"],
  display: "swap",
});

export { notoSansJP, montserrat };
