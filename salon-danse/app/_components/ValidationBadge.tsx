import type { ValidationAdmin } from "../services/types";

// Pastille de la validation admin d'une réservation sensible.
export default function ValidationBadge({ v }: { v: ValidationAdmin }) {
  if (v === "en_attente") return <span className="inline-flex rounded-full border border-[#A65A00]/40 bg-[#FFF4E5] px-2 py-0.5 text-[10px] font-bold text-[#A65A00]">En attente</span>;
  if (v === "acceptee") return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Accepté</span>;
  return null;
}

// État d'une réservation, dans l'ordre de priorité du back :
// la validation admin d'abord, puis le statut du planning.
export function EtatReservation({ v, statut }: { v: ValidationAdmin; statut: "brouillon" | "valide" }) {
  if (v === "en_attente") return <span className="inline-flex rounded-full border border-[#A65A00]/40 bg-[#FFF4E5] px-3 py-1 font-['Montserrat'] text-xs font-bold text-[#A65A00]">En attente de validation admin</span>;
  const ok = v === "acceptee" || statut === "valide";
  return <span className={`inline-flex rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{ok ? "Validé" : "Brouillon"}</span>;
}
