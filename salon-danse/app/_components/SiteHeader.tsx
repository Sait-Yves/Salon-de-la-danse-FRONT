import Image from "next/image";
import Link from "next/link";
import HeaderNav, { type NavItem } from "./HeaderNav";
import type { User } from "../services/types";

function itemsFor(user: User | null): NavItem[] {
  if (!user) return [{ href: "/", label: "Accueil", exact: true }, { href: "/login", label: "Connexion" }];
  if (user.role === "admin") {
    return [
      { href: "/admin", label: "Vue d'ensemble", exact: true },
      { href: "/admin/creneaux", label: "Créneaux" },
      { href: "/admin/invitations", label: "Invitations" },
    ];
  }
  return [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/planning", label: "Planning" },
    { href: "/profile", label: "Mon profil" },
  ];
}

export default function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 md:px-6">
      <div className={`nav-panel ${user?.role === "admin" ? "nav-panel-admin" : ""} relative mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8`}>
        <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/"} className="flex shrink-0 items-center rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25">
          <Image
            src="https://salondeladanse.fr/wp-content/uploads/2026/01/logo-sdld-white.png"
            alt="Salon de la Danse d'Angers"
            width={180}
            height={40}
            unoptimized
            className="max-h-10 w-auto object-contain"
          />
        </Link>
        <HeaderNav items={itemsFor(user)} loggedIn={!!user} who={user ? { name: `${user.prenom} ${user.nom}`.trim(), initials: `${user.prenom[0] ?? ""}${user.nom[0] ?? ""}`.toUpperCase(), isAdmin: user.role === "admin" } : undefined} />
      </div>
    </header>
  );
}
