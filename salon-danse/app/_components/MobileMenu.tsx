"use client";

import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { fetchCurrentUser } from "../services/auth";

export default function MobileMenu({ isLoggedIn, isAdmin }: { isLoggedIn: boolean, isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();


  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          {/* Voile */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-20 z-40 cursor-default bg-black/40 animate-fade-in"
          />
          {/* Panneau */}
          <nav className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-[#3E150F]/98 backdrop-blur-xl px-5 py-4 shadow-2xl animate-fade-up">
            <ul className="flex flex-col">
              {NAV_ITEMS.filter((item) => {
                if (item.admin && !isAdmin) return false;
                if (item.protected && !isLoggedIn) return false;
                return true;
              }).map(
                (item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? "page" : undefined}
                        className={`block rounded-xl px-4 py-3 font-['Montserrat'] text-sm font-semibold transition ${
                          item.admin
                            ? "text-amber-200"
                            : "text-white/85 hover:text-white"
                        } ${isActive ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
