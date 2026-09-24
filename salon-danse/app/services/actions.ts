"use server";

// Actions appelées par les formulaires et les boutons. Tout passe par api().
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api } from "./api";
import { TOKEN_COOKIE } from "./config";
import type { ActionResult, FormState } from "./types";

async function setSession(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // le token du back expire après 7 jours
  });
}

const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

/* ------------------------------ Authentification ------------------------------ */

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = field(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Renseignez votre e-mail et votre mot de passe." };

  const r = await api("/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.ok) return { error: r.message };
  const token = r.json?.data?.token;
  if (!token) return { error: "Réponse inattendue du serveur." };
  await setSession(token);
  redirect(r.json?.data?.user?.role === "admin" ? "/admin" : "/dashboard");
}

export async function registerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const errors: Record<string, string> = {};
  const password = String(fd.get("password") ?? "");
  const photo = fd.get("photo");

  for (const f of ["nom", "prenom", "telephone"]) if (!field(fd, f)) errors[f] = "Champ obligatoire.";
  if (password.length < 8) errors.password = "8 caractères minimum.";
  else if (password !== String(fd.get("password_confirmation") ?? "")) errors.password_confirmation = "Les mots de passe ne correspondent pas.";
  if (!(photo instanceof File) || photo.size === 0) errors.photo = "Une photo est obligatoire pour le badge.";
  else if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) errors.photo = "Format JPEG, PNG ou WebP.";
  else if (photo.size > 2 * 1024 * 1024) errors.photo = "2 Mo maximum.";
  if (Object.keys(errors).length) return { fieldErrors: errors, error: "Vérifiez les champs en rouge." };

  const body = new FormData();
  body.set("nom", field(fd, "nom"));
  body.set("prenom", field(fd, "prenom"));
  body.set("email", field(fd, "email"));
  body.set("telephone", field(fd, "telephone"));
  body.set("password", password);
  body.set("password_confirmation", String(fd.get("password_confirmation") ?? ""));
  body.set("code_invitation", field(fd, "code_invitation"));
  body.set("isMineur", fd.get("isMineur") ? "1" : "0");
  body.set("photo", photo as File);

  const r = await api("/register", { method: "POST", body });
  if (!r.ok) {
    const fe = { ...r.fieldErrors };
    const codeError = fe.code_invitation;
    delete fe.code_invitation;
    return { fieldErrors: fe, error: codeError ?? r.message };
  }
  const token = r.json?.data?.token;
  if (!token) redirect("/login");
  await setSession(token);
  redirect("/dashboard");
}

// Mot de passe oublié, étape 1 : le back envoie un code par e-mail.
export async function forgotPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = field(fd, "email");
  if (!email) return { fieldErrors: { email: "Entrez votre adresse e-mail." } };
  const r = await api("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  // 422 sur l'e-mail = format invalide. Pour le reste, on ne dit pas si le compte existe.
  if (!r.ok && r.status !== 404) return Object.keys(r.fieldErrors).length ? { fieldErrors: r.fieldErrors } : { error: r.message };
  return { ok: true, message: email };
}

// Étape 2 : code reçu + nouveau mot de passe. Le back déconnecte toutes les sessions du compte.
export async function resetPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = field(fd, "email");
  const token = field(fd, "token");
  const password = String(fd.get("password") ?? "");
  const confirmation = String(fd.get("password_confirmation") ?? "");
  const errors: Record<string, string> = {};
  if (!email) errors.email = "Entrez votre adresse e-mail.";
  if (!token) errors.token = "Entrez le code reçu par e-mail.";
  if (password.length < 8) errors.password = "8 caractères minimum.";
  else if (password !== confirmation) errors.password_confirmation = "Les mots de passe ne correspondent pas.";
  if (Object.keys(errors).length) return { fieldErrors: errors };
  const r = await api("/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, password, password_confirmation: confirmation }),
  });
  if (!r.ok) return Object.keys(r.fieldErrors).length ? { fieldErrors: r.fieldErrors } : { error: r.message };
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/login?mode=password&reset=1");
}

export async function logoutAction() {
  await api("/logout", { method: "POST" });
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/login");
}

/* ---------------------------------- Bénévole ---------------------------------- */

function refreshPlanning() {
  revalidatePath("/planning");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function reserveAction(creneauId: number): Promise<ActionResult> {
  const r = await api("/reservations", { method: "POST", body: JSON.stringify({ creneau_id: creneauId }) });
  refreshPlanning();
  if (!r.ok) return { ok: false, message: r.message };
  const enAttente = r.json?.data?.validation_admin === "en_attente";
  return { ok: true, message: enAttente ? "Demande envoyée : un administrateur doit la valider. Vous recevrez un e-mail." : undefined };
}

// reservationId = id de la RÉSERVATION (pas du créneau)
export async function cancelReservationAction(reservationId: number): Promise<ActionResult> {
  const r = await api(`/reservations/${reservationId}`, { method: "DELETE" });
  refreshPlanning();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function validatePlanningAction(): Promise<ActionResult> {
  const r = await api("/planning/valider", { method: "POST" });
  refreshPlanning();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

/* ----------------------------------- Admin ------------------------------------ */

function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function adminPlanningStatusAction(userId: number, action: "valider" | "deverrouiller"): Promise<ActionResult> {
  const r = await api(`/admin/users/${userId}/planning/${action}`, { method: "POST" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function adminAssignAction(userId: number, creneauId: number): Promise<ActionResult> {
  const r = await api("/admin/reservations", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, creneau_id: creneauId }),
  });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function adminRemoveReservationAction(reservationId: number): Promise<ActionResult> {
  const r = await api(`/admin/reservations/${reservationId}`, { method: "DELETE" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

// Dernier créneau d'un planning validé : on déverrouille d'abord (le back refuse sinon),
// puis on retire. Le planning repasse en brouillon et le bénévole devra le revalider.
export async function adminUnlockAndRemoveAction(userId: number, reservationId: number): Promise<ActionResult> {
  const unlock = await api(`/admin/users/${userId}/planning/deverrouiller`, { method: "POST" });
  if (!unlock.ok) { refreshAdmin(); return { ok: false, message: unlock.message }; }
  const r = await api(`/admin/reservations/${reservationId}`, { method: "DELETE" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function adminSetRoleAction(userId: number, role: "admin" | "benevole"): Promise<ActionResult> {
  const r = await api(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function adminUpdateUserAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = field(fd, "id");
  const body = new FormData();
  body.set("_method", "PATCH"); // le back attend PATCH ; multipart passe par POST + _method
  for (const f of ["nom", "prenom", "email", "telephone"]) body.set(f, field(fd, f));
  body.set("isMineur", fd.get("isMineur") ? "1" : "0");
  const photo = fd.get("photo");
  if (photo instanceof File && photo.size > 0) body.set("photo", photo);

  const r = await api(`/admin/users/${id}`, { method: "POST", body });
  if (!r.ok) return { error: r.message, fieldErrors: r.fieldErrors };
  refreshAdmin();
  return { ok: true, message: "Informations enregistrées." };
}

export async function sendInvitationAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = field(fd, "email");
  if (!email) return { error: "Entrez une adresse e-mail." };
  const r = await api("/admin/invitations", { method: "POST", body: JSON.stringify({ email }) });
  if (!r.ok) return { error: r.status === 503 ? "L'envoi d'e-mails n'est pas configuré sur le serveur. Contactez l'équipe technique." : r.message };
  return { ok: true, message: `Invitation envoyée à ${email}.` };
}

/* ------------------------- Admin : missions et créneaux ------------------------ */
// Routes CRUD de Louis (voir docs/routes-admin-editions-missions-creneaux.md).

export async function adminSaveEditionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = field(fd, "id");
  const nom = field(fd, "nom");
  const debut = field(fd, "date_debut");
  const fin = field(fd, "date_fin");
  const errors: Record<string, string> = {};
  if (!nom) errors.nom = "Donnez un nom à l'édition.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(debut)) errors.date_debut = "Date invalide.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fin)) errors.date_fin = "Date invalide.";
  else if (debut && fin < debut) errors.date_fin = "Doit être après le début.";
  if (Object.keys(errors).length) return { fieldErrors: errors };
  const payload: Record<string, unknown> = { nom, date_debut: debut, date_fin: fin };
  if (!id) payload.isActive = fd.get("isActive") === "1";
  const r = id
    ? await api(`/admin/editions/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
    : await api("/admin/editions", { method: "POST", body: JSON.stringify(payload) });
  if (!r.ok) return { error: r.message, fieldErrors: r.fieldErrors };
  refreshAdmin();
  return { ok: true, message: id ? "Édition modifiée." : `Édition « ${nom} » créée.` };
}

// Activer une édition désactive automatiquement les autres (règle du back).
export async function adminActivateEditionAction(editionId: number): Promise<ActionResult> {
  const r = await api(`/admin/editions/${editionId}`, { method: "PATCH", body: JSON.stringify({ isActive: true }) });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

// Archiver une édition, ou la restaurer (et l'activer).
export async function adminArchiveEditionAction(editionId: number, archive: boolean): Promise<ActionResult> {
  const body = archive ? { isArchived: true } : { isArchived: false, isActive: true };
  const r = await api(`/admin/editions/${editionId}`, { method: "PATCH", body: JSON.stringify(body) });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

export async function adminDeleteEditionAction(editionId: number): Promise<ActionResult> {
  const r = await api(`/admin/editions/${editionId}`, { method: "DELETE" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

const HHMM = /^\d{2}:\d{2}$/;

// Crée les créneaux d'une mission pour chaque jour × tranche horaire choisis.
// Les combinaisons qui existent déjà pour cette mission sont ignorées.
async function createCreneaux(missionId: number, jours: string[], plages: string[], capacite: number) {
  const existing = new Set<string>();
  const cur = await api(`/admin/creneaux?mission_id=${missionId}&per_page=100`);
  if (cur.ok && Array.isArray(cur.json?.data)) {
    for (const c of cur.json.data) existing.add(`${String(c.jour).slice(0, 10)}|${String(c.heure_debut).slice(0, 5)}-${String(c.heure_fin).slice(0, 5)}`);
  }
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const jour of jours) {
    for (const plage of plages) {
      if (existing.has(`${jour}|${plage}`)) { skipped += 1; continue; }
      const [debut, fin] = plage.split("-");
      const r = await api("/admin/creneaux", {
        method: "POST",
        body: JSON.stringify({ mission_id: missionId, jour, heure_debut: debut, heure_fin: fin, capacite_max: capacite }),
      });
      if (r.ok) created += 1;
      else if (!errors.includes(r.message)) errors.push(r.message);
    }
  }
  return { created, skipped, errors };
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function readSelection(fd: FormData) {
  const jours = fd.getAll("jours").map(String).filter((j) => /^\d{4}-\d{2}-\d{2}$/.test(j));
  const plages = fd.getAll("plages").map(String).filter((p) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(p));
  const capacite = Number(field(fd, "capacite_max"));
  return { jours, plages, capacite };
}

export async function adminSaveMissionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = field(fd, "id");
  const nom = field(fd, "nom");
  if (!nom) return { fieldErrors: { nom: "Donnez un nom à la mission." } };
  const editionId = Number(field(fd, "edition_id")) || undefined;
  const sel = readSelection(fd);
  if (!id && sel.plages.length > 0) {
    if (sel.jours.length === 0) return { fieldErrors: { jours: "Cochez au moins un jour." } };
    if (!Number.isInteger(sel.capacite) || sel.capacite < 1) return { fieldErrors: { capacite_max: "1 place minimum." } };
  }
  const body = JSON.stringify({ nom, isSensible: fd.get("isSensible") === "1", ...(id ? {} : { edition_id: editionId }) });
  const r = id
    ? await api(`/admin/missions/${id}`, { method: "PATCH", body })
    : await api("/admin/missions", { method: "POST", body });
  if (!r.ok) return { error: r.message, fieldErrors: r.fieldErrors };
  if (id) { refreshAdmin(); return { ok: true, message: "Mission modifiée." }; }

  const missionId = Number(r.json?.data?.id);
  if (sel.plages.length > 0 && missionId) {
    const res = await createCreneaux(missionId, sel.jours, sel.plages, sel.capacite);
    refreshAdmin();
    if (res.errors.length) return { ok: true, message: `Mission créée, ${plural(res.created, "créneau", "créneaux")} ajouté${res.created > 1 ? "s" : ""}. Erreur : ${res.errors[0]}` };
    return { ok: true, message: `Mission « ${nom} » créée avec ${plural(res.created, "créneau", "créneaux")}.` };
  }
  refreshAdmin();
  return { ok: true, message: `Mission « ${nom} » créée.` };
}

export async function adminDeleteMissionAction(missionId: number): Promise<ActionResult> {
  const r = await api(`/admin/missions/${missionId}`, { method: "DELETE" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

// Création : plusieurs jours × tranches d'un coup. Modification : un jour et une tranche.
export async function adminSaveCreneauAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = field(fd, "id");
  if (!id) {
    const missionId = Number(field(fd, "mission_id"));
    const sel = readSelection(fd);
    const errors: Record<string, string> = {};
    if (sel.jours.length === 0) errors.jours = "Cochez au moins un jour.";
    if (sel.plages.length === 0) errors.plages = "Cochez au moins une tranche horaire.";
    if (!Number.isInteger(sel.capacite) || sel.capacite < 1) errors.capacite_max = "1 place minimum.";
    if (Object.keys(errors).length) return { fieldErrors: errors };
    const res = await createCreneaux(missionId, sel.jours, sel.plages, sel.capacite);
    refreshAdmin();
    if (res.created === 0 && res.errors.length) return { error: res.errors[0] };
    if (res.created === 0) return { error: "Ces créneaux existent déjà pour cette mission." };
    const extra = res.skipped ? ` (${plural(res.skipped, "déjà existant ignoré", "déjà existants ignorés")})` : "";
    return { ok: true, message: `${plural(res.created, "créneau ajouté", "créneaux ajoutés")}${extra}.` };
  }

  const jour = field(fd, "jour");
  const [debut, fin] = field(fd, "plage").split("-");
  const capacite = Number(field(fd, "capacite_max"));
  const errors: Record<string, string> = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) errors.jour = "Choisissez un jour.";
  if (!HHMM.test(debut ?? "") || !HHMM.test(fin ?? "")) errors.plage = "Choisissez une tranche horaire.";
  if (!Number.isInteger(capacite) || capacite < 1) errors.capacite_max = "1 place minimum.";
  if (Object.keys(errors).length) return { fieldErrors: errors };
  const r = await api(`/admin/creneaux/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ jour, heure_debut: debut, heure_fin: fin, capacite_max: capacite }),
  });
  if (!r.ok) return { error: r.message, fieldErrors: r.fieldErrors };
  refreshAdmin();
  return { ok: true, message: "Créneau modifié." };
}

export async function adminDeleteCreneauAction(creneauId: number): Promise<ActionResult> {
  const r = await api(`/admin/creneaux/${creneauId}`, { method: "DELETE" });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

// Retirer un inscrit depuis la page d'un créneau. Si c'était le dernier créneau d'un planning
// validé, le back refuse : on déverrouille puis on retire (le planning repasse en brouillon).
export async function adminRemoveInscritAction(userId: number, reservationId: number, locked: boolean): Promise<ActionResult> {
  let r = await api(`/admin/reservations/${reservationId}`, { method: "DELETE" });
  if (!r.ok && locked && (r.status === 409 || r.status === 422)) {
    const unlock = await api(`/admin/users/${userId}/planning/deverrouiller`, { method: "POST" });
    if (unlock.ok) r = await api(`/admin/reservations/${reservationId}`, { method: "DELETE" });
  }
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}

/* ------------------------- Admin : demandes sensibles -------------------------- */

// Accepter ou refuser une demande sur mission sensible.
// Refus : le back supprime la réservation et repasse le planning du bénévole en brouillon.
export async function adminDecideAction(reservationId: number, decision: "acceptee" | "refusee"): Promise<ActionResult> {
  const r = await api(`/admin/reservations/${reservationId}/validation`, { method: "PATCH", body: JSON.stringify({ decision }) });
  refreshAdmin();
  return { ok: r.ok, message: r.ok ? undefined : r.message };
}
