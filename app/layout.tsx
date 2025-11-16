import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Providers } from "@/components/Providers";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CookieBanner from "./components/CookieBanner";

export const metadata: Metadata = {
  title: "Philogic-Hub · Control Center",
  description: "Die Zentrale deiner Firma – Steuerzentrale für echte Business-Intelligenz.",
  icons: {
    icon: "/philogichub-favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="de">
      <body className="bg-slate-950 text-slate-50 min-h-screen antialiased">
        <Providers>
          {session ? (
            // Authenticated layout with sidebar
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
            </div>
          ) : (
            // Public layout without sidebar
            <main className="min-h-screen">
              {children}
            </main>
          )}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
