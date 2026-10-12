import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AnimatePresence } from "motion/react";
import Script from "next/script";
import AppShell from "@/components/layout/app-shell";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import AnimatedFavicon from "@/components/ui/animated-favicon";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/metadata";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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

const themeScript =
  '(function(){try{var dark=localStorage.getItem("brunex:theme")==="dark";document.documentElement.classList.toggle("dark",dark)}catch(e){document.documentElement.classList.remove("dark")}})();';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Script id="brunex-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {/* The chrome lives here so every route shares it, and so navigating
            between routes never remounts the header or footer. AppShell picks
            the scroller: the document by default, or a ScrollArea on routes
            that have no scroll-driven animation reading the window. */}
        <AppShell>
          <SiteHeader />
          {/* flex-1 absorbs any leftover viewport height so the footer sits
              at the bottom on short pages instead of floating right under
              the content with empty space trailing it. Tall pages just push
              this taller and the footer follows normally. */}
          <div className="w-full flex flex-1 flex-col items-center">
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </div>
          <SiteFooter />
        </AppShell>
        <AnimatedFavicon />
      </body>
    </html>
  );
}
