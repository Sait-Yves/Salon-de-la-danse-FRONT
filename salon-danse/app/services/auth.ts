"use server";

import { cookies } from "next/headers";
import { fetchAPI } from "./api";

export type UserRole = "admin" | "benevole";

export interface CurrentUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  mission?: string;
  statut_planning?: string;
  isMineur?: boolean;
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { error: "Veuillez renseigner tous les champs." };
  }

  let response;
  try {
    response = await fetchAPI("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (e: any) {
    return { error: `[DEBUG] Fetch Exception: ${e.message}` };
  }

  let rawText = "";
  try {
    rawText = await response.text();
  } catch (e: any) {
    return { error: `[DEBUG] Impossible de lire la réponse texte: ${e.message}` };
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch (e: any) {
    return { error: `[DEBUG] JSON Parse Error (Status ${response.status}): ${rawText.substring(0, 100)}` };
  }

  if (response.ok) {
    const token = json.data?.token || json.token;
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      });
      return { success: true };
    } else {
      return { error: `[DEBUG] Status 200 OK, mais token introuvable. Contenu: ${JSON.stringify(json)}` };
    }
  }

  return { error: `[DEBUG] Erreur API (Status ${response.status}): ${json.message || JSON.stringify(json)}` };
}

export async function registerAction(formData: FormData, invitationCode: string) {
  // Construct a new FormData to send to the backend if needed, or send as JSON.
  // The API doc says POST /register, might accept JSON or multipart/form-data.
  // Since there is a photo, we should send it as FormData.
  
  const backendFormData = new FormData();
  backendFormData.append("nom", formData.get("nom") as string);
  backendFormData.append("prenom", formData.get("prenom") as string);
  backendFormData.append("email", formData.get("email") as string);
  backendFormData.append("telephone", formData.get("telephone") as string);
  backendFormData.append("password", formData.get("password") as string);
  backendFormData.append("invitation_code", invitationCode);

  const photo = formData.get("photo") as File;
  if (photo && photo.size > 0) {
    backendFormData.append("photo", photo);
  }

  const response = await fetchAPI("/register", {
    method: "POST",
    body: backendFormData,
    // When sending FormData, DO NOT set Content-Type header manually, fetch does it with boundaries.
    // fetchAPI removes it if it's FormData.
  });

  let json;
  try {
    json = await response.json();
  } catch {
    return { error: "Erreur de connexion au serveur." };
  }

  if (response.ok) {
    const token = json.data?.token || json.token;
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { success: true };
    }
    return { success: true, tokenRequired: false };
  }
  
  return { error: json.message || "Erreur lors de l'inscription. Veuillez vérifier le code d'invitation." };
}

export async function logoutAction() {
  await fetchAPI("/logout", { method: "POST" }).catch(() => {});
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetchAPI("/me", { method: "GET" });
  if (response.ok) {
    const json = await response.json();
    return json.data || json;
  }
  return null;
}
