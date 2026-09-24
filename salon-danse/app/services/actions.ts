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
  return { ok: r.ok, message: r.ok ? undefined : r.message };
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
