"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchCurrentUser, type CurrentUser } from "../services/auth";
import { fetchUserReservations } from "../services/planning";
import { formatDay, type CreneauData } from "../services/planning-constants";

export default function ProfilePage() {
  const [profile, setProfile] = useState<CurrentUser | null>(null);
  const [planning, setPlanning] = useState<{
    selected: CreneauData[];
    locked: boolean;
  }>({ selected: [], locked: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      try {
        setIsLoading(true);
        const [userRes, planningRes] = await Promise.all([
          fetchCurrentUser(),
          fetchUserReservations(),
        ]);
        setProfile(userRes);
        setPlanning(planningRes);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfileData();
  }, []);

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <main className="surface-grain min-h-[calc(100vh-5rem)] flex items-center justify-center text-center">
        <p className="font-['Montserrat'] text-xl font-bold text-[#7A291E] animate-pulse">Chargement de votre profil...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="surface-grain min-h-[calc(100vh-5rem)] p-8 text-center">
        <p>Veuillez vous connecter pour afficher votre badge.</p>
      </main>
    );
  }

  return (
    <main className="surface-grain min-h-[calc(100vh-5rem)] p-5 md:p-8 max-w-[1080px] mx-auto space-y-8 pb-16 font-['Open_Sans']">
      <div className="banner-gradient animate-rise flex flex-wrap justify-between items-center gap-4 print-hidden">
        <div>
          <h1 className="font-['Montserrat'] text-2xl md:text-3xl font-black tracking-tight">
            Mon badge officiel
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Salon de la Danse d&apos;Angers
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-pill btn-pill-inverse text-sm"
        >
          Imprimer le badge / PDF
        </button>
      </div>

      <div className="animate-fade-up official-card relative mx-auto max-w-sm overflow-hidden bg-white p-8 text-center shadow-2xl space-y-6">
        <div className="relative">
          <div className="inline-block rounded-full bg-gradient-to-br from-[#7A291E] to-[#3E150F] px-5 py-2 font-['Montserrat'] text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
            {profile.role === "admin" ? "ADMINISTRATEUR" : "BÉNÉVOLE"}
          </div>
          <div className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#7A291E]/15 bg-slate-100 shadow-inner">
            {/* Si l'API renvoie l'URL de la photo dans le profil, utilisez-la ici. Sinon, fallback sur un placeholder text. */}
            <span className="text-xs font-semibold text-[#555353]">
              Photo non disponible
            </span>
          </div>
          <h2 className="mt-5 font-['Montserrat'] text-2xl font-black text-[#333333]">
            {profile.prenom} {profile.nom}
          </h2>
          <p className="mt-1 inline-block rounded-lg bg-[#7A291E]/8 px-3 py-1 font-['Montserrat'] text-xs font-bold tracking-wide text-[#7A291E]">
            ID : BEN-{profile.id}
          </p>
          <div className="mx-auto mt-6 grid h-28 w-28 grid-cols-5 gap-1 rounded-2xl bg-white p-3 shadow-inner ring-1 ring-[#3E150F]/15">
            {Array.from({ length: 25 }, (_, index) => (
              <span
                key={index}
                className={`${(index * 7 + profile.id) % 3 === 0 ? "bg-[#3E150F]" : "bg-white"}`}
              />
            ))}
          </div>
          <p className="mt-5 text-[11px] font-medium text-[#555353]">
            À présenter à l&apos;entrée du Centre de Congrès
          </p>
        </div>
      </div>

      <div className="animate-fade-up official-card mx-auto max-w-2xl space-y-4 p-6 md:p-7">
        <div className="flex items-center gap-3 border-b border-[#7A291E]/10 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A291E]/10 text-lg">
            📅
          </span>
          <h3 className="font-['Montserrat'] text-[18px] font-bold text-[#7A291E]">
            Créneaux {planning.locked ? "validés" : "en brouillon"}
          </h3>
        </div>
        {planning.selected.length ? (
          <ul className="space-y-3">
            {planning.selected.map((slot: CreneauData) => (
              <li
                key={slot.id}
                className="flex justify-between items-center gap-3 rounded-2xl border border-[#7A291E]/8 bg-[#7A291E]/[0.03] p-4 text-sm"
              >
                <div>
                  <span className="font-['Montserrat'] font-bold text-[#333333]">
                    {formatDay(slot.jour)}
                  </span>
                  <p className="mt-0.5 text-xs text-[#666666]">
                    {slot.mission_nom || `Mission #${slot.mission_id}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg border border-[#7A291E]/15 bg-[#7A291E]/10 px-3 py-1 text-xs font-semibold text-[#7A291E]">
                  {slot.heure_debut}-{slot.heure_fin}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#666666]">Aucun créneau sélectionné.</p>
        )}
      </div>
    </main>
  );
}
