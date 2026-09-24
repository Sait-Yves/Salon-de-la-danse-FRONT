// Badges bénévoles : identifiant unique et QR code (côté serveur uniquement).
import { headers } from "next/headers";
import QRCode from "qrcode";
import { EDITION } from "./config";

// ID imprimé sur le badge, identique partout (admin et bénévole), ex. SDLD-2026-00042.
export function badgeId(userId: number) {
  return `SDLD-${EDITION.debut.slice(0, 4)}-${String(userId).padStart(5, "0")}`;
}

// URL publique du site (Vercel ou local), pour que le QR code pointe au bon endroit.
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "salon-de-la-danse-front.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Le QR code ouvre /verif/{id} : la page à jour du badge (missions et horaires).
// Visible par les admins et par le bénévole lui-même, après connexion.
// Il ne contient que l'identifiant : un faux badge afficherait la vraie photo de la personne.
export async function badgeQrSvg(base: string, userId: number) {
  return QRCode.toString(`${base}/verif/${userId}`, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
}
