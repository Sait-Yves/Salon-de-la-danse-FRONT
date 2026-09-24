"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// L'accueil a son propre bandeau (logo + boutons) : on n'y affiche pas l'en-tête de navigation.
export default function HeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
