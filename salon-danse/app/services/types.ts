// Types utilisés par toutes les pages. Ils sont produits par adapters.ts,
// jamais lus directement depuis la réponse brute de l'API.

export type Role = "admin" | "benevole";
export type StatutPlanning = "brouillon" | "valide";
// Validation admin d'une réservation sur mission sensible (null = pas de validation nécessaire).
export type ValidationAdmin = "en_attente" | "acceptee" | "refusee" | null;

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  isMineur: boolean;
  statutPlanning: StatutPlanning;
  hasPhoto: boolean;
  demandesEnAttente: number; // demandes sensibles en attente (0 si non renvoyé)
}

export interface Creneau {
  id: number;
  missionId: number | null;
  mission: string;
  sensible: boolean;
  jour: string; // AAAA-MM-JJ
  debut: string; // HH:MM
  fin: string; // HH:MM
  capacite: number;
  // null quand l'API ne le renvoie pas (planning perso)
  restantes: number | null;
}

export interface Reservation {
  // identifiant de la RÉSERVATION (pas du créneau) : sert au DELETE
  id: number;
  statut: StatutPlanning;
  validation: ValidationAdmin;
  userId: number | null;
  creneau: Creneau;
}

// Une demande sensible dans la file des validations (GET /admin/validations).
export interface Demande {
  reservation: Reservation;
  user: User;
  creeLe: string; // ISO
}

export interface Edition {
  id: number;
  nom: string;
  debut: string; // AAAA-MM-JJ
  fin: string;
  active: boolean;
  archived: boolean;
}

export interface Mission {
  id: number;
  editionId: number | null;
  nom: string;
  sensible: boolean;
}

// Une personne inscrite sur un créneau (GET /admin/creneaux/{id}/inscrits).
export interface Inscrit {
  reservationId: number;
  statut: StatutPlanning;
  validation: ValidationAdmin;
  user: User;
}

export interface CreneauInscrits {
  creneau: Creneau | null;
  restantes: number | null;
  inscrits: Inscrit[];
}

// Un utilisateur et ses réservations (GET /admin/plannings).
export interface PlanningRow {
  user: User;
  reservations: Reservation[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface InvitationCode {
  id: number;
  code: string;
  isActive: boolean;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export interface ActionResult {
  ok: boolean;
  message?: string;
}

export interface FormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  codes?: InvitationCode[];
}
