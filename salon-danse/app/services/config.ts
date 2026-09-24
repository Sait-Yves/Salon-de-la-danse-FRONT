// URL de l'API de Louis. Sur Vercel : variable API_URL (ou NEXT_PUBLIC_API_URL).
export const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://vps123924.serveur-vps.net/api"
).replace(/\/$/, "");

// Mode démo pour tester sans l'API (API_MOCK=1). Désactivé par défaut.
export const USE_MOCK = process.env.API_MOCK === "1";

export const TOKEN_COOKIE = "auth_token";

export const SALON = {
  nom: "Salon de la Danse d'Angers",
  dates: "9 au 11 octobre 2026",
  lieu: "Centre de Congrès d'Angers",
  quotaMin: 1,
  quotaMax: 3,
};

// Les 5 tranches horaires fixes du brief (2 h, sauf la première de 1 h 30), identiques chaque jour.
export const PLAGES: { debut: string; fin: string }[] = [
  { debut: "08:30", fin: "10:00" },
  { debut: "10:00", fin: "12:00" },
  { debut: "12:00", fin: "14:00" },
  { debut: "14:00", fin: "16:00" },
  { debut: "16:00", fin: "18:00" },
];
export const plageKey = (p: { debut: string; fin: string }) => `${p.debut}-${p.fin}`;
export const plageLabel = (p: { debut: string; fin: string }) => `${p.debut.replace(":", "h")} – ${p.fin.replace(":", "h")}`;

// Édition active (base de démo « Démonstration 2026 »). Il n'existe pas encore de route
// GET /editions : on garde les bornes ici pour proposer les jours à la création d'un créneau.
export const EDITION = { id: 1, debut: "2026-10-09", fin: "2026-10-11" };

// Liste des jours de l'édition, au format AAAA-MM-JJ.
export function editionJours(): string[] {
  const out: string[] = [];
  const d = new Date(`${EDITION.debut}T00:00:00Z`);
  const end = new Date(`${EDITION.fin}T00:00:00Z`);
  while (d <= end && out.length < 31) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// "2026-10-09" -> { court: "Ven", long: "Vendredi 9 octobre", num: "9" }
export function formatJour(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const nom = JOURS_LONGS[date.getUTCDay()];
  const cap = nom.charAt(0).toUpperCase() + nom.slice(1);
  return {
    court: cap.slice(0, 3),
    long: `${cap} ${d} ${MOIS[m - 1]}`,
    num: String(d),
    mois: MOIS[m - 1],
  };
}
