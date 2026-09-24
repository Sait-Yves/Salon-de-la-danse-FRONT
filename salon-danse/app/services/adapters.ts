// Seul endroit qui connaît le format JSON du back (Laravel, API Resources).
// Source : Salondeladanseback/app/Http/Resources/*.php
// Si le back change un nom de champ, c'est ici (et seulement ici) qu'on corrige.

import type {
  Creneau,
  InvitationCode,
  Page,
  Reservation,
  StatutPlanning,
  User,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

const str = (v: Raw) => (v == null ? "" : String(v));
const hhmm = (v: Raw) => str(v).slice(0, 5); // "08:30:00" -> "08:30"

export function toStatut(v: Raw): StatutPlanning {
  return v === "valide" ? "valide" : "brouillon";
}

// UserResource : id, nom, prenom, email, telephone, role, isMineur,
// statut_planning, photo_url
export function toUser(r: Raw): User {
  return {
    id: Number(r.id),
    nom: str(r.nom),
    prenom: str(r.prenom),
    email: str(r.email),
    telephone: str(r.telephone),
    role: r.role === "admin" ? "admin" : "benevole",
    isMineur: !!r.isMineur,
    statutPlanning: toStatut(r.statut_planning),
    hasPhoto: !!r.photo_url,
  };
}

// CreneauResource : id, jour, heure_debut, heure_fin, capacite_max,
// places_restantes (liste seulement), mission { id, edition_id, nom, isSensible (admin) }
export function toCreneau(r: Raw): Creneau {
  return {
    id: Number(r.id),
    missionId: r.mission?.id != null ? Number(r.mission.id) : null,
    mission: str(r.mission?.nom) || "Mission",
    sensible: !!r.mission?.isSensible,
    jour: str(r.jour).slice(0, 10),
    debut: hhmm(r.heure_debut),
    fin: hhmm(r.heure_fin),
    capacite: Number(r.capacite_max ?? 0),
    restantes: r.places_restantes == null ? null : Number(r.places_restantes),
  };
}

// ReservationResource : id, statut, user_id (admin), creneau
export function toReservation(r: Raw): Reservation {
  return {
    id: Number(r.id),
    statut: toStatut(r.statut),
    userId: r.user_id != null ? Number(r.user_id) : null,
    creneau: toCreneau(r.creneau ?? {}),
  };
}

// InvitationCodeResource : id, code, isActive
export function toInvitation(r: Raw): InvitationCode {
  return { id: Number(r.id), code: str(r.code), isActive: !!r.isActive };
}

// Liste simple : { data: [...] }
export function toList<T>(json: Raw, map: (r: Raw) => T): T[] {
  return Array.isArray(json?.data) ? json.data.map(map) : [];
}

// Liste paginée Laravel : { data: [...], links, meta: { total, current_page, last_page } }
export function toPage<T>(json: Raw, map: (r: Raw) => T): Page<T> {
  const items = toList(json, map);
  const meta = json?.meta ?? {};
  return {
    items,
    total: Number(meta.total ?? items.length),
    page: Number(meta.current_page ?? 1),
    lastPage: Number(meta.last_page ?? 1),
  };
}
