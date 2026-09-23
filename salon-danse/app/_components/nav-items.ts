export interface NavItem {
  href: string;
  label: string;
  admin?: boolean;
  protected?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/login", label: "Connexion" },
  { href: "/dashboard", label: "Dashboard", protected: true },
  { href: "/planning", label: "Planning", protected: true },
  { href: "/profile", label: "Mon Badge", protected: true },
  { href: "/admin", label: "🛡️ Admin", admin: true, protected: true },
];
