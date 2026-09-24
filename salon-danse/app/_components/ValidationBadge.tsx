import type { ValidationAdmin } from "../services/types";

// Pastille de la validation admin d'une réservation sensible.
export default function ValidationBadge({ v }: { v: ValidationAdmin }) {
  if (v === "en_attente") return <span className="inline-flex rounded-full border border-[#A65A00]/40 bg-[#FFF4E5] px-2 py-0.5 text-[10px] font-bold text-[#A65A00]">En attente</span>;
  if (v === "acceptee") return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Accepté</span>;
  return null;
}
