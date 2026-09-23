"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EVENT_DAYS,
  formatDay,
  MOCK_CRENEAUX,
  readPlanning,
  savePlanning,
  type CreneauData,
} from "../services/planning";

export default function PlanningPage() {
  const router = useRouter();
  const [selectedCreneaux, setSelectedCreneaux] = useState<CreneauData[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [adminLocked, setAdminLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDay, setActiveDay] = useState(EVENT_DAYS[0].value);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readPlanning();
      setSelectedCreneaux(stored.selected);
      setIsLocked(stored.locked);
      setAdminLocked(
        window.localStorage.getItem("salon-danse-admin-planning-locked") ===
          "true",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const hasThreeConsecutive = (selection: CreneauData[]) =>
    EVENT_DAYS.some(({ value }) => {
      const starts = selection
        .filter((item) => item.jour === value)
        .map((item) =>
          ["08:30", "10:00", "12:00", "14:00", "16:00"].indexOf(
            item.heure_debut,
          ),
        )
        .sort();
      return starts.some(
        (start, index) =>
          starts[index + 1] === start + 1 && starts[index + 2] === start + 2,
      );
    });

  const handleSelectCreneau = (creneau: CreneauData) => {
    if (isLocked || adminLocked || creneau.places_restantes === 0) return;
    setErrorMessage("");
    const alreadySelected = selectedCreneaux.some(
      (item) => item.id === creneau.id,
    );
    if (alreadySelected) {
      const next = selectedCreneaux.filter((item) => item.id !== creneau.id);
      setSelectedCreneaux(next);
      savePlanning(next, false);
      return;
    }
    if (selectedCreneaux.length >= 3) {
      setErrorMessage("Volume horaire maximum atteint (3 créneaux / 6h).");
      return;
    }
    if (
      selectedCreneaux.some(
        (item) =>
          item.jour === creneau.jour &&
          item.heure_debut === creneau.heure_debut,
      )
    ) {
      setErrorMessage("Vous avez déjà une mission sur cette tranche horaire.");
      return;
    }
    const next = [...selectedCreneaux, creneau];
    if (hasThreeConsecutive(next)) {
      setErrorMessage(
        "Trois créneaux consécutifs sont interdits : une pause est obligatoire.",
      );
      return;
    }
    setSelectedCreneaux(next);
    savePlanning(next, false);
  };

  const handleValidatePlanning = () => {
    if (selectedCreneaux.length < 1) {
      setErrorMessage("Veuillez sélectionner au moins 1 créneau.");
      return;
    }
    if (
      window.confirm(
        "Après validation, votre planning sera verrouillé. Confirmer ?",
      )
    ) {
      setIsLocked(true);
      savePlanning(selectedCreneaux, true);
      router.push("/profile");
    }
  };

  const visibleCreneaux = MOCK_CRENEAUX.filter(
    (item) => item.jour === activeDay,
  );

  return (
    <main className="surface-grain min-h-screen p-5 md:p-8 max-w-[1080px] mx-auto pb-32 space-y-6">
      <div className="banner-gradient animate-rise flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="font-['Montserrat'] text-2xl md:text-3xl font-black tracking-tight">
            Sélection de votre planning
          </h1>
          <p className="font-['Open_Sans'] text-sm text-white/70 mt-1">
            Choisissez entre 1 et 3 créneaux sur les trois jours du Salon.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && (
            <span className="bg-white/95 text-[#7A291E] text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              Verrouillé
            </span>
          )}
          <div className="rounded-2xl border border-white/25 bg-white/15 px-5 py-2.5 text-center backdrop-blur-sm">
            <p className="font-['Montserrat'] text-2xl font-black leading-none">
              {selectedCreneaux.length}
              <span className="text-sm font-bold text-white/60"> / 3</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/75">
              Créneaux
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="animate-rise flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm shadow-sm">
          ⚠️ <span>{errorMessage}</span>
        </div>
      )}

      {adminLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Le planning est actuellement verrouillé par l&apos;administration.
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {EVENT_DAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setActiveDay(day.value)}
            className={`btn-pill whitespace-nowrap text-sm ${activeDay === day.value ? "btn-pill-primary" : "btn-pill-ghost"}`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleCreneaux.map((creneau) => {
          const isSelected = selectedCreneaux.some(
            (item) => item.id === creneau.id,
          );
          const isFull = creneau.places_restantes === 0;
          const badgeStyle = isFull
            ? "bg-red-50 text-red-700 border-red-200"
            : creneau.places_restantes <= 2
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";
          return (
            <button
              key={creneau.id}
              type="button"
              disabled={isFull || isLocked || adminLocked}
              aria-pressed={isSelected}
              onClick={() => handleSelectCreneau(creneau)}
              className={`createur-card group relative text-left p-6 flex flex-col justify-between gap-4 disabled:cursor-not-allowed disabled:opacity-55 ${isSelected ? "is-selected" : "hover:-translate-y-1 hover:shadow-xl hover:border-[#7A291E]/30"}`}
            >
              {isSelected && (
                <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#7A291E] text-xs font-bold text-white shadow-lg">
                  ✓
                </span>
              )}
              <div className="flex justify-between items-start gap-3 w-full">
                <div>
                  <span className="font-['Montserrat'] text-[11px] font-bold text-[#7A291E] uppercase tracking-widest">
                    {formatDay(creneau.jour)}
                  </span>
                  <h3 className="font-['Montserrat'] text-[17px] font-bold text-[#333333] mt-1">
                    {creneau.mission_nom}
                  </h3>
                </div>
                <span
                  className={`shrink-0 text-[11px] px-3 py-1 rounded-full border font-semibold ${badgeStyle}`}
                >
                  {isFull
                    ? "Complet"
                    : `${creneau.places_restantes} places dispo`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 w-full">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#555353]">
                  🕒 {creneau.heure_debut} – {creneau.heure_fin}
                </span>
                <span
                  className={`text-sm font-bold ${isSelected ? "text-[#7A291E]" : "text-[#999]"}`}
                >
                  {isSelected
                    ? "Sélectionné"
                    : isFull
                      ? "Indisponible"
                      : isLocked || adminLocked
                        ? "Verrouillé"
                        : "Sélectionner"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isLocked && !adminLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-[#7A291E]/10 p-4 shadow-[0_-10px_30px_rgba(62,21,15,0.12)] flex justify-center z-40">
          <button
            onClick={handleValidatePlanning}
            className="btn-pill btn-pill-primary text-base w-full sm:w-auto"
          >
            Valider définitivement mon planning
          </button>
        </div>
      )}
    </main>
  );
}
