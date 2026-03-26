import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast-context";
import { ProteinSourcesProvider } from "@/lib/protein-sources-context";
import Nav from "@/components/Nav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f1e",
};

export const metadata: Metadata = {
  title: "Healthy Envy",
  description: "Personal health experiment tracker",
  appleWebApp: {
    capable: true,
    title: "Healthy Envy",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full`}>
      <body className="min-h-full bg-bg text-app-text font-sans antialiased">
        <ToastProvider>
          <ProteinSourcesProvider>
            <main className="max-w-[480px] mx-auto min-h-screen pb-20 px-4">
              {children}
            </main>
            <Nav />
          </ProteinSourcesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
