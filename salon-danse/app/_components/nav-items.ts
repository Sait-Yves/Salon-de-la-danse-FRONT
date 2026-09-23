export interface NavItem {
  href: string;
  label: string;
  admin?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Inscription" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planning", label: "Planning" },
  { href: "/profile", label: "Mon Badge" },
  { href: "/admin", label: "🛡️ Admin", admin: true },
];
