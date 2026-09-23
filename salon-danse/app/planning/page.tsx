"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreneauData {
  id: number;
  mission_nom: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
  places_restantes: number;
}

const MOCK_CRENEAUX: CreneauData[] = [
  {
    id: 1,
    mission_nom: "Accueil exposants",
    jour: "2027-05-14",
    heure_debut: "08:30",
    heure_fin: "10:00",
    capacite_max: 10,
    places_restantes: 5,
  },
  {
    id: 2,
    mission_nom: "Vestiaires",
    jour: "2027-05-14",
    heure_debut: "10:00",
    heure_fin: "12:00",
    capacite_max: 8,
    places_restantes: 1,
  },
  {
    id: 3,
    mission_nom: "Point Info",
    jour: "2027-05-14",
    heure_debut: "12:00",
    heure_fin: "14:00",
    capacite_max: 6,
    places_restantes: 0,
  },
  {
    id: 4,
    mission_nom: "Logistique (Niveau 0)",
    jour: "2027-05-14",
    heure_debut: "14:00",
    heure_fin: "16:00",
    capacite_max: 12,
    places_restantes: 8,
  },
  {
    id: 5,
    mission_nom: "Scène principale",
    jour: "2027-05-14",
    heure_debut: "16:00",
    heure_fin: "18:00",
    capacite_max: 5,
    places_restantes: 3,
  },

  {
    id: 6,
    mission_nom: "Accueil exposants",
    jour: "2027-05-15",
    heure_debut: "08:30",
    heure_fin: "10:00",
    capacite_max: 10,
    places_restantes: 4,
  },
  {
    id: 7,
    mission_nom: "Vestiaires",
    jour: "2027-05-15",
    heure_debut: "10:00",
    heure_fin: "12:00",
    capacite_max: 8,
    places_restantes: 2,
  },
  {
    id: 8,
    mission_nom: "Point Info",
    jour: "2027-05-15",
    heure_debut: "12:00",
    heure_fin: "14:00",
    capacite_max: 6,
    places_restantes: 3,
  },
  {
    id: 9,
    mission_nom: "Logistique (Niveau 0)",
    jour: "2027-05-15",
    heure_debut: "14:00",
    heure_fin: "16:00",
    capacite_max: 12,
    places_restantes: 6,
  },
  {
    id: 10,
    mission_nom: "Scène principale",
    jour: "2027-05-15",
    heure_debut: "16:00",
    heure_fin: "18:00",
    capacite_max: 5,
    places_restantes: 1,
  },
];

export default function PlanningPage() {
  const router = useRouter();
  const [selectedCreneaux, setSelectedCreneaux] = useState<CreneauData[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasThreeConsecutive = (newSelection: CreneauData[]) => {
    const sorted = [...newSelection].sort((a, b) => a.id - b.id);
    let consecutiveCount = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1].id === sorted[i].id + 1) {
        consecutiveCount++;
        if (consecutiveCount >= 3) return true;
      } else {
        consecutiveCount = 1;
      }
    }
    return false;
  };

  const handleSelectCreneau = (creneau: CreneauData) => {
    if (isLocked) return;
    setErrorMessage("");

    const isAlreadySelected = selectedCreneaux.some((c) => c.id === creneau.id);

    if (isAlreadySelected) {
      setSelectedCreneaux(selectedCreneaux.filter((c) => c.id !== creneau.id));
      return;
    }

    if (selectedCreneaux.length >= 3) {
      setErrorMessage(
        "Volume horaire maximum atteint (3 créneaux / 6h au total).",
      );
      return;
    }

    const conflitHoraire = selectedCreneaux.some(
      (c) => c.jour === creneau.jour && c.heure_debut === creneau.heure_debut,
    );
    if (conflitHoraire) {
      setErrorMessage(
        "Conflit : Vous avez déjà une mission sur cette tranche horaire.",
      );
      return;
    }

    const nouvelleSelection = [...selectedCreneaux, creneau];

    if (hasThreeConsecutive(nouvelleSelection)) {
      setErrorMessage(
        "Règle d'engagement : Interdiction d'enchaîner 3 créneaux consécutifs. Une pause est obligatoire.",
      );
      return;
    }

    setSelectedCreneaux(nouvelleSelection);
  };

  const handleValidatePlanning = () => {
    if (selectedCreneaux.length < 1) {
      setErrorMessage("Veuillez sélectionner au moins 1 créneau.");
      return;
    }

    if (
      confirm(
        "Attention : après validation définitive, votre planning sera verrouillé. Confirmer ?",
      )
    ) {
      setIsLocked(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  };

  return (
    <main className="surface-grain min-h-screen p-5 md:p-8 max-w-[1080px] mx-auto pb-32 space-y-6">
      {/* En-tête de section */}
      <div className="banner-gradient animate-rise flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="font-['Montserrat'] text-2xl md:text-3xl font-black tracking-tight">
            Sélection de votre Planning
          </h1>
          <p className="font-['Open_Sans'] text-sm text-white/70 mt-1">
            Choisissez entre 1 et 3 créneaux pour le week-end
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && (
            <span className="bg-white/95 text-[#7A291E] text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              🔒 Verrouillé
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
        <div className="animate-rise flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm font-['Open_Sans'] shadow-sm">
          <span className="text-lg leading-none">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grille des créneaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_CRENEAUX.map((creneau) => {
          const isSelected = selectedCreneaux.some((c) => c.id === creneau.id);
          const isFull = creneau.places_restantes === 0;

          let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let statusText = `${creneau.places_restantes} places dispo`;
          if (creneau.places_restantes === 1) {
            badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
            statusText = "Dernière place";
          } else if (isFull) {
            badgeStyle = "bg-red-50 text-red-700 border-red-200";
            statusText = "Complet";
          }

          return (
            <button
              key={creneau.id}
              type="button"
              disabled={isFull}
              aria-pressed={isSelected}
              onClick={() => handleSelectCreneau(creneau)}
              className={`createur-card group relative text-left p-6 flex flex-col justify-between gap-4 disabled:cursor-not-allowed disabled:opacity-55 ${
                isSelected
                  ? "is-selected"
                  : isFull
                    ? ""
                    : "hover:-translate-y-1 hover:shadow-xl hover:border-[#7A291E]/30"
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#7A291E] text-xs font-bold text-white shadow-lg">
                  ✓
                </span>
              )}

              <div className="flex justify-between items-start gap-3 w-full">
                <div>
                  <span className="font-['Montserrat'] text-[11px] font-bold text-[#7A291E] uppercase tracking-widest">
                    {creneau.jour}
                  </span>
                  <h3 className="font-['Montserrat'] text-[17px] font-bold text-[#333333] mt-1">
                    {creneau.mission_nom}
                  </h3>
                </div>
                <span
                  className={`shrink-0 font-['Open_Sans'] text-[11px] px-3 py-1 rounded-full border font-semibold ${badgeStyle}`}
                >
                  {statusText}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 w-full">
                <span className="inline-flex items-center gap-1.5 font-['Open_Sans'] text-sm text-[#555353]">
                  <span className="text-[#7A291E]">🕒</span>
                  {creneau.heure_debut} – {creneau.heure_fin}
                </span>
                <span
                  className={`font-['Montserrat'] text-sm font-bold ${isSelected ? "text-[#7A291E]" : "text-[#999]"}`}
                >
                  {isSelected
                    ? "Sélectionné"
                    : isFull
                      ? "Indisponible"
                      : "Sélectionner"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isLocked && (
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
