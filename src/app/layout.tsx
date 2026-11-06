import type { Metadata } from "next";
import {
  Architects_Daughter,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import "./plot.css";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import PlotIntro from "@/components/plot/plot-intro";
import Rulers from "@/components/plot/rulers";
import SelectionBox from "@/components/plot/selection-box";
import { SoundProvider } from "@/components/sound/sounds";
import AnimatedFavicon from "@/components/ui/animated-favicon";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/metadata";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});
/** Only for the plot's handwritten margin notes. */
const hand = Architects_Daughter({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Full-Stack Developer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Nweremizu Bruno",
    "Full-stack developer",
    "Software engineer portfolio",
    "React",
    "Next.js",
    "TypeScript",
    "AI-assisted development",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_NAME} | Full-Stack Developer`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} | Full-Stack Developer`,
    description: SITE_DESCRIPTION,
  },
};

/*
 * Runs inline in <head>, before first paint:
 * 1. applies the saved theme (no light flash for dark-mode visitors);
 * 2. arms the plot intro: `plotting` hides the page behind blue paper. No-JS
 *    and reduced-motion visitors never get it, and the 4s timer releases the
 *    page if the app never hydrates (the intro cancels it once mounted).
 */
const headScript = `(function(){var h=document.documentElement;try{h.classList.toggle("dark",localStorage.getItem("brunex:theme")==="dark")}catch(e){h.classList.remove("dark")}try{if(!location.pathname.startsWith("/admin")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){h.classList.add("plotting");window.__plotFailsafe=setTimeout(function(){h.classList.remove("plotting","plotlock")},4000)}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} ${hand.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party bootstrap that must run before paint.
          dangerouslySetInnerHTML={{ __html: headScript }}
        />
      </head>
      <body>
        <div id="plot-cover" aria-hidden />
        <Rulers />
        <PlotIntro />
        <SoundProvider>
          <SelectionBox />
          {/* One narrow column for every route, the way a letter is laid out. */}
          <div className="sheet mx-auto flex min-h-dvh w-full max-w-[40rem] flex-col px-5 sm:px-6 font-sans text-[15px] leading-relaxed">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </SoundProvider>
        <AnimatedFavicon />
      </body>
    </html>
  );
}
