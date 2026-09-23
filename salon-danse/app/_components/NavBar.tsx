"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "./nav-items";
import { fetchCurrentUser } from "../services/auth";

export default function NavBar({ isLoggedIn, isAdmin }: { isLoggedIn: boolean, isAdmin: boolean }) {
  const pathname = usePathname();



  return (
    <nav className="hidden lg:flex items-center gap-1 font-['Montserrat'] text-[15px] font-medium text-white/90">
      {NAV_ITEMS.filter((item) => {
        if (item.admin && !isAdmin) return false;
        if (item.protected && !isLoggedIn) return false;
        return true;
      }).map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25 after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white after:transition-transform after:duration-300 hover:text-white ${
              item.admin ? "font-bold text-amber-200" : ""
            } ${isActive ? "text-white after:scale-x-100" : "after:scale-x-0"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
