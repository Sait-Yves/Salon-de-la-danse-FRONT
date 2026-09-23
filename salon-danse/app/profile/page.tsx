"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [benevole] = useState({
    nom: "Dupont",
    prenom: "Camille",
    email: "camille.dupont@example.com",
    telephone: "06 12 34 56 78",
    idUnique: "BEN-2027-8942",
    role: "BÉNÉVOLE",
    photo_path: "/placeholder-avatar.png",
    missions: [
      {
        jour: "14 mai 2027",
        horaire: "08:30-10:00",
        mission: "Accueil exposants",
      },
      {
        jour: "15 mai 2027",
        horaire: "14:00-16:00",
        mission: "Logistique (Niveau 0)",
      },
    ],
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="surface-grain min-h-[calc(100vh-5rem)] p-5 md:p-8 max-w-[1080px] mx-auto space-y-8 pb-16 font-['Open_Sans']">
      <div className="banner-gradient animate-rise flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-['Montserrat'] text-2xl md:text-3xl font-black tracking-tight">
            Mon Badge Officiel
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Salon de la Danse d&apos;Angers
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-pill btn-pill-inverse text-sm print-hidden"
        >
          Imprimer le Badge / PDF 🖨️
        </button>
      </div>

      {/* Carte du Badge officiel */}
      <div className="animate-fade-up delay-1 official-card-hover official-card relative mx-auto max-w-sm overflow-hidden bg-white p-8 text-center shadow-2xl space-y-6">
        {/* Bandeau supérieur dégradé */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#7A291E]/10 to-transparent" />

        <div className="relative">
          <div className="inline-block rounded-full bg-gradient-to-br from-[#7A291E] to-[#3E150F] px-5 py-2 font-['Montserrat'] text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
            {benevole.role}
          </div>

          <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#7A291E]/15 bg-slate-100 shadow-inner">
            <span className="text-xs font-semibold text-[#555353]">Photo</span>
          </div>

          <h2 className="mt-5 font-['Montserrat'] text-2xl font-black text-[#333333]">
            {benevole.prenom} {benevole.nom}
          </h2>
          <p className="mt-1 inline-block rounded-lg bg-[#7A291E]/8 px-3 py-1 font-['Montserrat'] text-xs font-bold tracking-wide text-[#7A291E]">
            ID : {benevole.idUnique}
          </p>

          <div className="mx-auto mt-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3E150F] to-[#7A291E] text-xs font-bold text-white/80 shadow-inner">
            [QR CODE]
          </div>

          <p className="mt-5 text-[11px] font-medium text-[#555353]">
            À présenter obligatoirement à l&apos;entrée du Centre de Congrès
          </p>
        </div>
      </div>

      <div className="animate-fade-up delay-2 official-card mx-auto max-w-2xl space-y-4 p-6 md:p-7">
        <div className="flex items-center gap-3 border-b border-[#7A291E]/10 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A291E]/10 text-lg">
            📅
          </span>
          <h3 className="font-['Montserrat'] text-[18px] font-bold text-[#7A291E]">
            Créneaux validés
          </h3>
        </div>
        <ul className="space-y-3">
          {benevole.missions.map((m, index) => (
            <li
              key={index}
              className="flex justify-between items-center gap-3 rounded-2xl border border-[#7A291E]/8 bg-[#7A291E]/[0.03] p-4 text-sm transition hover:border-[#7A291E]/20 hover:bg-[#7A291E]/[0.05]"
            >
              <div>
                <span className="font-['Montserrat'] font-bold text-[#333333]">
                  {m.jour}
                </span>
                <p className="mt-0.5 text-xs text-[#666666]">{m.mission}</p>
              </div>
              <span className="shrink-0 rounded-lg border border-[#7A291E]/15 bg-[#7A291E]/10 px-3 py-1 text-xs font-semibold text-[#7A291E]">
                {m.horaire}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
