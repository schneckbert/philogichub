import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Philogic-Hub · Control Center",
  description: "Die Zentrale deiner Firma – Steuerzentrale für echte Business-Intelligenz.",
  icons: {
    icon: "/philogichub-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-slate-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
