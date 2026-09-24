import type { StatutPlanning } from "../services/types";

export default function StatusBadge({ statut }: { statut: StatutPlanning }) {
  const valid = statut === "valide";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold ${valid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
      {valid ? "Planning validé" : "Brouillon"}
    </span>
  );
}
