export interface CreneauData {
  id: number;
  mission_nom: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
  places_restantes: number;
  sensible?: boolean;
}

export const EVENT_DAYS = [
  { value: "2027-05-14", label: "Vendredi 14 mai 2027" },
  { value: "2027-05-15", label: "Samedi 15 mai 2027" },
  { value: "2027-05-16", label: "Dimanche 16 mai 2027" },
];

const MISSIONS = [
  "Accueil exposants",
  "Vestiaires",
  "Point Info",
  "Masterclass / Conférences",
  "Loges danseurs",
  "Logistique (Niveau 0)",
  "Logistique (Niveau -2)",
  "Scène principale",
  "Stand JayDance",
  "Village Danses du Monde",
];

const TIMES = [
  ["08:30", "10:00"],
  ["10:00", "12:00"],
  ["12:00", "14:00"],
  ["14:00", "16:00"],
  ["16:00", "18:00"],
];

export const MOCK_CRENEAUX: CreneauData[] = EVENT_DAYS.flatMap(
  (day, dayIndex) =>
    TIMES.flatMap(([heure_debut, heure_fin], timeIndex) => {
      const mission = MISSIONS[(dayIndex * 3 + timeIndex) % MISSIONS.length];
      const capacite_max = 8 + ((dayIndex + timeIndex) % 3) * 2;
      const places_restantes = Math.max(
        0,
        capacite_max - ((dayIndex + timeIndex) % 5),
      );
      return [
        {
          id: dayIndex * TIMES.length + timeIndex + 1,
          mission_nom: mission,
          jour: day.value,
          heure_debut,
          heure_fin,
          capacite_max,
          places_restantes,
        },
      ];
    }),
);

export const PLANNING_STORAGE_KEY = "salon-danse-planning";
export const PROFILE_STORAGE_KEY = "salon-danse-profile";

export interface VolunteerProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photoDataUrl?: string;
  idUnique: string;
}

export function formatDay(value: string) {
  return EVENT_DAYS.find((day) => day.value === value)?.label || value;
}

export function readPlanning() {
  if (typeof window === "undefined")
    return { selected: [] as CreneauData[], locked: false };
  try {
    return (
      JSON.parse(
        window.localStorage.getItem(PLANNING_STORAGE_KEY) || "null",
      ) || { selected: [], locked: false }
    );
  } catch {
    return { selected: [], locked: false };
  }
}

export function savePlanning(selected: CreneauData[], locked: boolean) {
  window.localStorage.setItem(
    PLANNING_STORAGE_KEY,
    JSON.stringify({ selected, locked }),
  );
}

export function readProfile(): VolunteerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(
      window.localStorage.getItem(PROFILE_STORAGE_KEY) || "null",
    ) as VolunteerProfile | null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: VolunteerProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
