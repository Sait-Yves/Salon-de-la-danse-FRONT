// Lectures de données côté serveur, utilisées par les pages.
import { cache } from "react";
import { api, getToken, type ApiResult } from "./api";
import { toCreneau, toCreneauInscrits, toEdition, toList, toMission, toPage, toPlanningRow, toReservation, toUser } from "./adapters";
import type { Creneau, CreneauInscrits, Edition, Mission, Page, PlanningRow, Reservation, Result, User } from "./types";

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = <T>(r: ApiResult): Result<T> => ({ ok: false, error: r.message, status: r.status });

// Utilisateur connecté (null si pas de token ou token refusé).
export const getMe = cache(async (): Promise<User | null> => {
  if (!(await getToken())) return null;
  const r = await api("/me");
  if (!r.ok) return null;
  return toUser(r.json?.data ?? r.json);
});

// Tous les créneaux (parcourt les pages de 100). admin = missions sensibles incluses.
// editionId (admin) : seulement les créneaux de cette édition.
export async function fetchAllCreneaux(admin = false, editionId?: number): Promise<Result<Creneau[]>> {
  const base = admin ? `/admin/creneaux${editionId ? `?edition_id=${editionId}&` : "?"}` : "/creneaux?";
  const items: Creneau[] = [];
  let page = 1;
  let last = 1;
  do {
    const r = await api(`${base}per_page=100&page=${page}`);
    if (!r.ok) return fail(r);
    const p = toPage(r.json, toCreneau);
    items.push(...p.items);
    last = p.lastPage;
    page += 1;
  } while (page <= last && page <= 20);
  return ok(items);
}

// Réservations du bénévole connecté (missions sensibles exclues par le back).
export async function fetchPlanning(): Promise<Result<Reservation[]>> {
  const r = await api("/planning");
  if (!r.ok) return fail(r);
  return ok(toList(r.json, toReservation));
}

// Planning d'un bénévole vu par un admin (missions sensibles incluses).
export async function fetchUserPlanning(userId: number): Promise<Result<Reservation[]>> {
  const r = await api(`/admin/users/${userId}/planning`);
  if (!r.ok) return fail(r);
  return ok(toList(r.json, toReservation));
}

export interface UserFilters {
  q?: string;
  statut?: "brouillon" | "valide";
  mineur?: boolean;
  role?: "benevole" | "admin";
  page?: number;
  perPage?: number;
}

function usersQuery(f: UserFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.statut) p.set("statut_planning", f.statut);
  if (f.mineur) p.set("isMineur", "1");
  if (f.role) p.set("role", f.role);
  if (f.page) p.set("page", String(f.page));
  p.set("per_page", String(f.perPage ?? 25));
  return p.toString();
}

export async function fetchUsers(f: UserFilters = {}): Promise<Result<Page<User>>> {
  const r = await api(`/admin/users?${usersQuery(f)}`);
  if (!r.ok) return fail(r);
  return ok(toPage(r.json, toUser));
}

// Fiche d'un utilisateur : GET /admin/users/{id}. Si la route répond mal, on parcourt la liste.
export async function findUser(id: number): Promise<Result<User | null>> {
  const direct = await api(`/admin/users/${id}`);
  if (direct.ok) return ok(toUser(direct.json?.data ?? direct.json));
  if (direct.status === 404 && !/route/i.test(String(direct.json?.message ?? ""))) return ok(null);
  let page = 1;
  let last = 1;
  do {
    const r = await fetchUsers({ page, perPage: 100 });
    if (!r.ok) return r;
    const found = r.data.items.find((u) => u.id === id);
    if (found) return ok(found);
    last = r.data.lastPage;
    page += 1;
  } while (page <= last && page <= 10);
  return ok(null);
}

// Tous les utilisateurs avec leurs réservations, en un seul appel (GET /admin/plannings).
export async function fetchAllPlannings(role?: "benevole" | "admin"): Promise<Result<Map<number, Reservation[]>>> {
  const r = await api(`/admin/plannings${role ? `?role=${role}` : ""}`);
  if (!r.ok) return fail(r);
  const rows: PlanningRow[] = toList(r.json, toPlanningRow);
  return ok(new Map(rows.map((row) => [row.user.id, row.reservations])));
}

// Inscrits d'un créneau (GET /admin/creneaux/{id}/inscrits).
export async function fetchInscrits(creneauId: number): Promise<Result<CreneauInscrits>> {
  const r = await api(`/admin/creneaux/${creneauId}/inscrits`);
  if (!r.ok) return fail(r);
  return ok(toCreneauInscrits(r.json));
}

// Id de l'édition active (null si aucune ou si la route échoue : pas de filtre).
export const getActiveEditionId = cache(async (): Promise<number | null> => {
  const r = await fetchEditions();
  if (!r.ok) return null;
  return r.data.find((e) => e.active)?.id ?? null;
});

// Éditions (GET /admin/editions). Une seule est active à la fois.
export async function fetchEditions(): Promise<Result<Edition[]>> {
  const r = await api("/admin/editions");
  if (!r.ok) return fail(r);
  return ok(toList(r.json, toEdition).sort((x, y) => y.debut.localeCompare(x.debut)));
}

// Missions d'une édition (GET /admin/missions?edition_id=).
// Si la route échoue, on les déduit des créneaux (une mission sans créneau n'apparaît pas).
export async function fetchMissions(creneaux: Creneau[], editionId?: number): Promise<{ missions: Mission[]; fromApi: boolean }> {
  const r = await api(`/admin/missions${editionId ? `?edition_id=${editionId}` : ""}`);
  if (r.ok && Array.isArray(r.json?.data)) {
    const list = toList(r.json, toMission);
    return { missions: editionId ? list.filter((m) => m.editionId == null || m.editionId === editionId) : list, fromApi: true };
  }
  const map = new Map<number, Mission>();
  for (const c of creneaux) {
    if (c.missionId != null && !map.has(c.missionId)) {
      map.set(c.missionId, { id: c.missionId, editionId: editionId ?? null, nom: c.mission, sensible: c.sensible });
    }
  }
  return { missions: [...map.values()], fromApi: false };
}

export interface Stats {
  comptes: number;
  valides: number;
  attente: number;
  mineurs: number;
  capacite: number;
  occupees: number;
  parMission: { mission: string; sensible: boolean; capacite: number; occupees: number }[];
  parJour: { jour: string; capacite: number; occupees: number }[];
  creneaux: Creneau[];
}

// Compteurs du tableau de bord, calculés à partir des routes existantes.
export async function fetchStats(): Promise<Result<Stats>> {
  const editionId = (await getActiveEditionId()) ?? undefined;
  const [all, valides, mineurs, creneaux] = await Promise.all([
    fetchUsers({ role: "benevole", perPage: 1 }),
    fetchUsers({ role: "benevole", statut: "valide", perPage: 1 }),
    fetchUsers({ role: "benevole", mineur: true, perPage: 1 }),
    fetchAllCreneaux(true, editionId),
  ]);
  if (!all.ok) return all;
  if (!valides.ok) return valides;
  if (!mineurs.ok) return mineurs;
  if (!creneaux.ok) return creneaux;

  const missions = new Map<string, { mission: string; sensible: boolean; capacite: number; occupees: number }>();
  const jours = new Map<string, { jour: string; capacite: number; occupees: number }>();
  let capacite = 0;
  let occupees = 0;
  for (const c of creneaux.data) {
    const occ = c.restantes == null ? 0 : Math.max(0, c.capacite - c.restantes);
    capacite += c.capacite;
    occupees += occ;
    const m = missions.get(c.mission) ?? { mission: c.mission, sensible: c.sensible, capacite: 0, occupees: 0 };
    m.capacite += c.capacite;
    m.occupees += occ;
    missions.set(c.mission, m);
    const j = jours.get(c.jour) ?? { jour: c.jour, capacite: 0, occupees: 0 };
    j.capacite += c.capacite;
    j.occupees += occ;
    jours.set(c.jour, j);
  }
  return ok({
    comptes: all.data.total,
    valides: valides.data.total,
    attente: Math.max(0, all.data.total - valides.data.total),
    mineurs: mineurs.data.total,
    capacite,
    occupees,
    parMission: [...missions.values()],
    parJour: [...jours.values()].sort((a, b) => a.jour.localeCompare(b.jour)),
    creneaux: creneaux.data,
  });
}
