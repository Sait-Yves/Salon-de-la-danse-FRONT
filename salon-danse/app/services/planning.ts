"use server";

import { fetchAPI } from "./api";
import type { CreneauData } from "./planning-constants";

// Ré-export pour ne pas casser le code existant qui importait CreneauData
// depuis "./planning".
export type { CreneauData };

export async function fetchCreneaux(): Promise<CreneauData[]> {
  const res = await fetchAPI("/creneaux");
  if (res.ok) {
    const json = await res.json();
    return json.data || json;
  }
  return [];
}

export async function fetchUserReservations(): Promise<{ selected: CreneauData[], locked: boolean }> {
  const res = await fetchAPI("/planning");
  if (res.ok) {
    const json = await res.json();
    const data = json.data || json;
    return {
      selected: data.reservations || data.creneaux || (Array.isArray(data) ? data : []),
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
