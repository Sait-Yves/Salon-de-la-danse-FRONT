import type { Metadata } from "next";
import SiteHeader from "./_components/SiteHeader";
import HeaderGate from "./_components/HeaderGate";
import { getMe } from "./services/loaders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salon de la Danse - Espace Bénévoles",
  description: "Plateforme officielle de gestion des bénévoles - JayDance Fam",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col bg-[#F6EEE6] text-[#666666] antialiased">
        <HeaderGate><SiteHeader user={user} /></HeaderGate>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
