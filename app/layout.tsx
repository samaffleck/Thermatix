import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";
import { DefaultLayoutWrapper } from "@/components/default-layout-wrapper";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const defaultUrl = "https://stokesian.com"; // Use the actual production URL

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "StokeSim",
  description: "Design adsorption systems in your browser. StokeSim allows you to design processes in minutes, not days.",
  icons: {
    icon: '/favicon_circle.png',
    shortcut: '/favicon_circle.png',
    apple: '/favicon_circle.png',
  },
  openGraph: {
    title: "StokeSim",
    description: "Design adsorption systems in your browser. StokeSim allows you to design processes in minutes, not days.",
    url: defaultUrl,
    siteName: "StokeSim",
    images: [
      {
        url: "https://stokesian.com/og-image.png", // Use absolute URL
        width: 1200,
        height: 630,
        alt: "Stokesian Logo",
        type: "image/png",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stokesian",
    description: "Design chemical reactors in your browser. Stokesian automates the parameter optimisation process, allowing you to design reactors in minutes, not days.",
    images: ["/og-image.png"],
  },
  // WhatsApp specifically looks for these meta tags
  other: {
    "og:image": "https://stokesian.com/og-image.png",
    "og:image:secure_url": "https://stokesian.com/og-image.png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:alt": "Stokesian Logo",
    "og:image:type": "image/png",
    // Force no cache for WhatsApp
    "cache-control": "no-cache, no-store, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
  }
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
