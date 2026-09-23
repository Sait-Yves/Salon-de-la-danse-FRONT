import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NavBar from "./_components/NavBar";
import MobileMenu from "./_components/MobileMenu";
import { fetchCurrentUser } from "./services/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salon de la Danse - Espace Bénévoles",
  description: "Plateforme officielle de gestion des bénévoles - JayDance Fam",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchCurrentUser();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-white text-[#666666] antialiased">
        {/* --- HEADER OFFICIEL --- */}
        <header className="sticky top-0 z-50 border-b border-[#3E150F]/60 bg-[#3E150F]/95 backdrop-blur-xl shadow-lg shadow-[#3E150F]/20">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-6 h-20 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            >
              <Image
                src="https://salondeladanse.fr/wp-content/uploads/2026/01/logo-sdld-white.png"
                alt="Salon de la Danse d'Angers"
                width={180}
                height={40}
                unoptimized
                className="w-auto max-h-10 object-contain"
              />
            </Link>

            {/* Navigation principale (desktop) */}
            <NavBar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
            
            {/* Menu mobile (hamburger) */}
            <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          </div>
        </header>

        {/* --- CONTENU --- */}
        <main className="flex-1">{children}</main>

        {/* --- FOOTER SOMBRE --- */}
        <footer className="bg-[#3E150F] text-white pt-12 pb-10 mt-auto border-t border-white/10">
          <div className="max-w-[1080px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left font-['Open_Sans'] text-xs">
              <p className="font-bold text-white text-sm font-['Montserrat']">
                Salon de la Danse d&apos;Angers — Association JayDance Fam
              </p>
              <p className="mt-1 text-white/60">
                Centre de Congrès | 14, 15 et 16 mai 2027.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 font-['Montserrat'] text-xs font-semibold text-white/75">
              <Link href="/" className="transition hover:text-white">
                Accueil
              </Link>
              <Link href="/dashboard" className="transition hover:text-white">
                Règles &amp; Onboarding
              </Link>
              <Link href="/planning" className="transition hover:text-white">
                Créneaux
              </Link>
              <Link href="/profile" className="transition hover:text-white">
                Badge &amp; Profil
              </Link>
              <Link
                href="/admin"
                className="transition text-amber-200 hover:text-amber-100"
              >
                Espace Admin
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
