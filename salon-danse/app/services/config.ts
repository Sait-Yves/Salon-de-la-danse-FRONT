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
  dates: "14 au 16 mai 2027",
  lieu: "Centre de Congrès d'Angers",
  quotaMin: 1,
  quotaMax: 3,
};

export const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// "2027-05-14" -> { court: "Ven", long: "Vendredi 14 mai", num: "14" }
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
