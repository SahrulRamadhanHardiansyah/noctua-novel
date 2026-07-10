import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noctua Novel",
  description: "Read and discover light novels, web novels, and community stories. A premium reading platform for novel enthusiasts.",
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  openGraph: {
    title: "Noctua Novel",
    description: "Read and discover light novels, web novels, and community stories",
    siteName: "NoctuaNovel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noctua Novel",
    description: "Read and discover light novels, web novels, and community stories",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={cn("min-h-screen bg-background font-sans antialiased", outfit.className)}>
          {children}
          <Toaster richColors position="top-center" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
