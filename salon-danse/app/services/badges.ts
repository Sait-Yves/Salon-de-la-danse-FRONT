// Badges bénévoles : identifiant unique et QR code de vérification (côté serveur uniquement).
import { headers } from "next/headers";
import QRCode from "qrcode";

// ID imprimé sur le badge, ex. SDLD-2026-00042.
export function badgeId(userId: number, annee: string) {
  return `SDLD-${annee}-${String(userId).padStart(5, "0")}`;
}

// URL publique du site (Vercel ou local), pour que le QR code pointe au bon endroit.
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "salon-de-la-danse-front.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Le QR code ouvre la page de vérification, réservée aux admins connectés.
// Il ne contient que l'identifiant : un faux badge montrerait la vraie photo de la personne à l'admin qui scanne.
export async function badgeQrSvg(base: string, userId: number) {
  return QRCode.toString(`${base}/admin/verif/${userId}`, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
}
