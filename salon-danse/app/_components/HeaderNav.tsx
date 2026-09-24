"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "../services/actions";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export interface Who { name: string; initials: string; isAdmin: boolean }

function WhoChip({ who }: { who: Who }) {
  return (
    <div className="mr-1 flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-4">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full font-['Montserrat'] text-xs font-extrabold ${who.isAdmin ? "bg-[#e9b9a8] text-[#3E150F]" : "bg-white/15 text-white"}`} aria-hidden>{who.initials}</span>
      <span className="flex flex-col leading-tight">
        <span className="font-['Montserrat'] text-[13px] font-semibold text-white">{who.name}</span>
        <span className={`w-fit rounded-full px-2 text-[10px] font-extrabold uppercase tracking-wider ${who.isAdmin ? "bg-[#e9b9a8] text-[#3E150F]" : "bg-white/10 text-white/70"}`}>{who.isAdmin ? "Admin" : "Bénévole"}</span>
      </span>
    </div>
  );
}

export default function HeaderNav({ items, loggedIn, who }: { items: NavItem[]; loggedIn: boolean; who?: Who }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (i: NavItem) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 font-['Montserrat'] text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25 ${
      active ? "bg-white/10 text-white" : "text-white/80 hover:text-white"
    }`;

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={isActive(i) ? "page" : undefined} className={linkClass(isActive(i))}>
            {i.label}
          </Link>
        ))}
        {loggedIn && who && <div className="ml-3"><WhoChip who={who} /></div>}
        {loggedIn && (
          <form action={logoutAction}>
            <button type="submit" className="ml-2 rounded-full border border-white/25 px-4 py-2 font-['Montserrat'] text-sm font-semibold text-white/90 transition hover:bg-white/10">
              Déconnexion
            </button>
          </form>
        )}
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
        >
          <span className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-white transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
        {open && (
          <>
            <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 top-20 z-40 cursor-default bg-black/40 animate-fade-in" />
            <nav className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-[#3E150F] px-5 py-4 shadow-2xl animate-fade-up" aria-label="Menu mobile">
              <ul className="flex flex-col">
                {who && <li className="mb-2 px-1"><WhoChip who={who} /></li>}
                {items.map((i) => (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(i) ? "page" : undefined}
                      className={`block rounded-xl px-4 py-3 font-['Montserrat'] text-sm font-semibold transition ${isActive(i) ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5 hover:text-white"}`}
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
                {loggedIn && (
                  <li>
                    <form action={logoutAction}>
                      <button type="submit" className="block w-full rounded-xl px-4 py-3 text-left font-['Montserrat'] text-sm font-semibold text-amber-200 hover:bg-white/5">
                        Déconnexion
                      </button>
                    </form>
                  </li>
                )}
              </ul>
            </nav>
          </>
        )}
      </div>
    </>
  );
}
