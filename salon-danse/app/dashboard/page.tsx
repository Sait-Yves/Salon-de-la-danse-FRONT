"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="surface-grain min-h-[calc(100vh-5rem)] p-6 max-w-4xl mx-auto space-y-8 pb-16">
      {/* En-tête de bienvenue */}
      <div className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A291E] to-[#3E150F] p-8 text-white shadow-[0_18px_40px_-15px_rgba(62,21,15,0.6)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 font-['Montserrat'] text-[11px] font-bold uppercase tracking-wider">
            Espace bénévole
          </span>
          <h1 className="mt-3 font-['Montserrat'] text-2xl font-extrabold md:text-3xl">
            Bienvenue dans votre espace bénévole 👋
          </h1>
          <p className="mt-1 text-sm text-white/75">
            Salon de la Danse d&apos;Angers – du 14 au 16 mai 2027.
          </p>
        </div>
      </div>

      {/* Règles / onboarding */}
      <div className="official-card animate-fade-up delay-1 p-6 md:p-8">
        <div className="mb-5 flex items-center gap-3 border-b border-[#7A291E]/10 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A291E]/10 text-lg">
            📋
          </span>
          <h2 className="font-['Montserrat'] text-lg font-bold text-[#7A291E]">
            Règles d&apos;inscription au planning
          </h2>
        </div>
        <ul className="space-y-3 text-sm text-[#555353]">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7A291E]/10 text-[11px] font-bold text-[#7A291E]">1</span>
            <span>
              Volume horaire requis : Entre <strong className="text-[#333333]">1 et 3 créneaux</strong> sur
              tout le week-end (2h à 6h).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7A291E]/10 text-[11px] font-bold text-[#7A291E]">2</span>
            <span>Interdiction d&apos;avoir 2 missions sur le même créneau horaire.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7A291E]/10 text-[11px] font-bold text-[#7A291E]">3</span>
            <span>Pause obligatoire : Interdiction d&apos;enchaîner 3 créneaux consécutifs.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7A291E]/10 text-[11px] font-bold text-[#7A291E]">4</span>
            <span>Une fois validé définitivement, le planning est verrouillé.</span>
          </li>
        </ul>
      </div>

      <div className="animate-fade-up delay-2 flex justify-end">
        <Link href="/planning" className="btn-pill btn-pill-primary">
          Accéder à la sélection des créneaux &rarr;
        </Link>
      </div>
    </main>
  );
}
