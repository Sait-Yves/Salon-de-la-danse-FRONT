export interface CreneauData {
  id: number;
  mission_id?: number;
  mission_nom?: string;
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

export function formatDay(value: string) {
  return EVENT_DAYS.find((day) => day.value === value)?.label || value;
}
