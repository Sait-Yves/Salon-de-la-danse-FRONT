"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import LoginForms from "./login/LoginForms";

type View = "home" | "code" | "password";
const LOGO = "https://salondeladanse.fr/wp-content/uploads/2026/01/logo-sdld-white.png";

export default function HomeHero({ loggedIn, espace, dates, lieu }: { loggedIn: boolean; espace: string; dates: string; lieu: string }) {
  const [view, setView] = useState<View>("home");
  const open = view !== "home";
  const [moving, setMoving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Le logo ne s'anime que lors d'un clic ; à l'affichage / au rafraîchissement il est posé directement.
  function go(v: View) {
    setMoving(true);
    setView(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMoving(false), 1100);
  }

  // Le logo est un seul élément qui glisse (et rétrécit) entre sa place d'accueil et le coin haut-gauche.
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);
  const topRef = useRef<HTMLImageElement>(null);
  const [geo, setGeo] = useState<{ hx: number; hy: number; tx: number; ty: number; scale: number } | null>(null);

  const measure = useCallback(() => {
    const sec = sectionRef.current;
    const top = topRef.current;
    if (!sec || !top) return;
    const s0 = sec.getBoundingClientRect();
    const t = top.getBoundingClientRect();
    const h = heroRef.current?.getBoundingClientRect();
    setGeo((g) => {
      const hero = h && h.height > 0 ? h : null;
      const next = {
        tx: t.left - s0.left,
        ty: t.top - s0.top,
        hx: hero ? hero.left - s0.left : g?.hx ?? t.left - s0.left,
        hy: hero ? hero.top - s0.top : g?.hy ?? t.top - s0.top,
        scale: hero && hero.height > 0 ? t.height / hero.height : g?.scale ?? 1,
      };
      return g && Object.values(next).every((v, i) => Math.abs(v - Object.values(g)[i]) < 0.5) ? g : next;
    });
  }, []);

  useLayoutEffect(() => { measure(); }, [measure, view]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, view]);

  return (
    <div className="flex flex-1 p-3 sm:p-4 md:p-6">
      <div
        className={`relative grid w-full flex-1 overflow-hidden rounded-[28px] shadow-2xl shadow-[#3E150F]/25 transition-[grid-template-columns] duration-[450ms] ease-out md:rounded-[36px] ${
          open ? "md:grid-cols-[2.6fr_1fr]" : "md:grid-cols-[1fr_1fr]"
        }`}
      >
        {/* Partie infos / connexion : s'élargit sur la partie image */}
        <section ref={sectionRef} className="home-left relative flex flex-col justify-between gap-8 px-7 py-9 text-white sm:px-12 md:px-14 md:py-12 lg:px-20">
          {/* Haut : emplacement (invisible) du petit logo ; le vrai logo glisse jusqu'ici */}
          <div className="relative z-10 h-10">
            <Image ref={topRef} onLoad={measure} src={LOGO} alt="" aria-hidden width={180} height={40} unoptimized className="invisible max-h-10 w-auto object-contain" />
          </div>

          {/* Logo animé */}
          <Image
            src={LOGO}
            alt="Salon de la Danse d'Angers"
            width={360}
            height={270}
            unoptimized
            className="pointer-events-none absolute left-0 top-0 z-20 h-auto max-h-[6.5rem] w-auto origin-top-left object-contain sm:max-h-[8rem] lg:max-h-[9.5rem]"
            style={{
              opacity: geo ? 1 : 0,
              transform: geo ? (open ? `translate(${geo.tx}px, ${geo.ty}px) scale(${geo.scale})` : `translate(${geo.hx}px, ${geo.hy}px) scale(1)`) : undefined,
              transition: "none",
              willChange: "transform",
            }}
          />

          {!open ? (
            <div key="home" className="relative z-10 flex flex-col gap-7">
              <h1 className="sr-only">Salon de la Danse d&apos;Angers</h1>
              {/* Emplacement (invisible) du grand logo */}
              <Image ref={heroRef} onLoad={measure} src={LOGO} alt="" aria-hidden width={360} height={270} unoptimized className="invisible h-auto max-h-[6.5rem] w-auto object-contain sm:max-h-[8rem] lg:max-h-[9.5rem]" />
              <p className="animate-fade-up delay-1 -mt-2 font-['Montserrat'] text-xs font-semibold uppercase tracking-[0.18em] text-[#e9b9a8]">
                Espace bénévoles · {dates}
              </p>

              <p className="animate-fade-up delay-2 max-w-md font-['Open_Sans'] text-base leading-relaxed text-white/70 md:text-[1.05rem]">
                Entrez votre code d&apos;invitation, choisissez vos créneaux et retrouvez votre planning en un coup d&apos;œil.
              </p>
              <div className="animate-fade-up delay-3 flex flex-wrap items-center gap-3 pt-1">
                {loggedIn ? (
                  <Link href={espace} className="btn-arrow">Accéder à mon espace <span aria-hidden>→</span></Link>
                ) : (
                  <>
                    <button type="button" onClick={() => go("code")} className="btn-arrow">J&apos;ai mon code <span aria-hidden>→</span></button>
                    <button type="button" onClick={() => go("password")} className="btn-outline-light">Me connecter</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div key="login" className="animate-fade-up relative z-10 w-full">
              <button type="button" onClick={() => go("home")} className="mb-5 text-sm font-semibold text-white/70 transition hover:text-white">← Retour</button>
              <h2 className="mb-1 font-['Montserrat'] text-3xl font-extrabold">{view === "code" ? "Bienvenue" : "Bon retour"}</h2>
              <p className="mb-6 text-sm text-white/65">{view === "code" ? "Créez votre compte avec votre code d'invitation." : "Connectez-vous à votre espace bénévole."}</p>
              <div className="rounded-[2rem] bg-white p-10 text-[#666666] shadow-2xl shadow-black/30 md:p-14">
                <LoginForms key={view} initialMode={view === "code" ? "code" : "password"} expired={false} />
              </div>
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-white/40">
            <span>{lieu} · Association JayDance Fam</span>
            <Link href="/mentions-legales" className="transition hover:text-white/80">Mentions légales</Link>
          </div>
        </section>

        {/* Partie image (déposer la photo dans public/hero-salon.jpg) */}
        <aside className="home-right relative hidden overflow-hidden md:block" aria-hidden>
          <div className="silk silk-a" />
          <div className="silk silk-b" />
          <div className="silk silk-c" />
          <div className="hero-photo absolute inset-0" />
        </aside>
        {!open && <aside className="home-right relative min-h-[260px] overflow-hidden md:hidden" aria-hidden><div className="silk silk-a" /><div className="silk silk-b" /><div className="hero-photo absolute inset-0" /></aside>}
      </div>
    </div>
  );
}
