// Client unique vers l'API de Louis. Exécuté uniquement côté serveur.
// (Pas de "use server" ici : ce fichier ne doit pas être appelable depuis le navigateur.)

import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE, USE_MOCK } from "./config";
import { mockFetch } from "./mock";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResult {
  ok: boolean;
  status: number;
  json: any;
  message: string;
  fieldErrors: Record<string, string>;
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

async function rawFetch(path: string, init: RequestInit, token: string | null): Promise<Response> {
  if (USE_MOCK) return mockFetch(path, init, token);
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
}

function describe(status: number, json: any): { message: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  if (json?.errors && typeof json.errors === "object") {
    for (const [k, v] of Object.entries(json.errors)) {
      fieldErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  const first = Object.values(fieldErrors)[0];
  const apiMessage: string = typeof json?.message === "string" ? json.message : "";
  if (status === 401) return { message: "Session expirée. Reconnectez-vous.", fieldErrors };
  if (status === 403) return { message: "Accès refusé.", fieldErrors };
  if (status === 429) return { message: "Trop de tentatives. Réessayez dans une minute.", fieldErrors };
  if (status === 422) return { message: first || apiMessage || "Données invalides.", fieldErrors };
  if (status >= 500 && status !== 503) return { message: "Erreur du serveur. Réessayez dans un instant.", fieldErrors };
  return { message: apiMessage || "Requête refusée.", fieldErrors };
}

// Appel JSON. Ne lève jamais d'exception : renvoie toujours un ApiResult.
export async function api(path: string, init: RequestInit = {}): Promise<ApiResult> {
  const token = await getToken();
  let res: Response;
  try {
    res = await rawFetch(path, init, token);
  } catch {
    return {
      ok: false,
      status: 0,
      json: null,
      message: "Le serveur ne répond pas. Réessayez dans un instant.",
      fieldErrors: {},
    };
  }
  let json: any = null;
  if (res.status !== 204) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }
  if (res.ok) {
    return { ok: true, status: res.status, json, message: typeof json?.message === "string" ? json.message : "", fieldErrors: {} };
  }
  const { message, fieldErrors } = describe(res.status, json);
  return { ok: false, status: res.status, json, message, fieldErrors };
}

// Fichier protégé par token (photo, PDF, CSV) : on le relaie au navigateur.
export async function apiFile(path: string): Promise<Response> {
  const token = await getToken();
  if (!token) return new Response("Non connecté", { status: 401 });
  let res: Response;
  try {
    res = await rawFetch(path, { method: "GET" }, token);
  } catch {
    return new Response("Serveur injoignable", { status: 502 });
  }
  if (!res.ok) return new Response("Fichier indisponible", { status: res.status });
  const headers = new Headers();
  for (const h of ["content-type", "content-disposition"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "private, no-store");
  return new Response(res.body, { status: 200, headers });
}
