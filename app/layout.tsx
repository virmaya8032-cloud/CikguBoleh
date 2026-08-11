import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MobileNav } from "@/components/ui/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { PageTracker } from "@/components/ui/PageTracker";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cikguboleh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CikguBoleh — Semua Alat Cikgu Dalam Satu Tempat",
    template: "%s · CikguBoleh",
  },
  description:
    "CikguBoleh menyediakan RPH, worksheet, generator soalan, PBD, PPKI, sijil, QR dan pelbagai alat untuk guru Malaysia. Isi sekali, semua siap.",
  keywords: ["RPH", "guru Malaysia", "PPKI", "worksheet", "PBD", "toolbox guru", "CikguBoleh"],
  applicationName: "CikguBoleh",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "CikguBoleh — Semua Alat Cikgu Dalam Satu Tempat",
    description: "Platform AI & Toolbox lengkap untuk guru Malaysia. Isi sekali, semua siap.",
    url: APP_URL,
    siteName: "CikguBoleh",
    locale: "ms_MY",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "CikguBoleh", description: "Semua Alat Cikgu Dalam Satu Tempat" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0d7c74",
  width: "device-width",
  initialScale: 1,
};

// Set theme before paint to avoid flash.
const themeScript = `try{var m=localStorage.getItem('cikguboleh_theme')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <div className="aurora-bg" aria-hidden="true" />
        <ToastProvider>
          <PageTracker />
          <Header />
          <main className="min-h-[60vh] pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
