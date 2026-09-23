"use server";

import { fetchAPI } from "./api";

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

export async function fetchCreneaux(): Promise<CreneauData[]> {
  const res = await fetchAPI("/creneaux");
  if (res.ok) {
    return res.json();
  }
  return [];
}

export async function fetchUserReservations(): Promise<{ selected: CreneauData[], locked: boolean }> {
  // GET /planning fetches the user's planning state (locked or not) and reservations
  // Since the API doc has GET /planning and GET /reservations, let's assume /planning gives the locked state.
  // Actually, let's fetch /planning. If it fails, fallback to empty.
  const res = await fetchAPI("/planning");
  if (res.ok) {
    const data = await res.json();
    return {
      selected: data.reservations || data.creneaux || [], // Adjust based on actual API payload
      locked: data.statut === "valide" || data.locked === true
    };
  }
  return { selected: [], locked: false };
}

export async function toggleReservation(creneauId: number, isAdding: boolean, reservationId?: number) {
  if (isAdding) {
    const res = await fetchAPI("/reservations", {
      method: "POST",
      body: JSON.stringify({ creneau_id: creneauId })
    });
    return res.ok;
  } else {
    // Si l'API attend l'ID de la réservation ou du créneau pour supprimer
    const idToDelete = reservationId || creneauId;
    const res = await fetchAPI(`/reservations/${idToDelete}`, {
      method: "DELETE"
    });
    return res.ok;
  }
}

export async function validerPlanning() {
  const res = await fetchAPI("/planning/valider", {
    method: "POST"
  });
  return res.ok;
}
