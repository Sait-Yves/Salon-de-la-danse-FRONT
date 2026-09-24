// Jauge de remplissage : vert = places dispo, orange = presque complet, gris = complet.
export function gaugeTone(restantes: number | null, capacite: number) {
  if (restantes == null || capacite <= 0) return { color: "#9A9A9A", label: "", tone: "none" as const };
  if (restantes <= 0) return { color: "#9A9A9A", label: "Complet", tone: "full" as const };
  const ratio = restantes / capacite;
  if (ratio <= 0.25 || restantes <= 2) return { color: "#E08A1E", label: `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`, tone: "warn" as const };
  return { color: "#2E7D5B", label: `${restantes} places restantes`, tone: "ok" as const };
}

export default function Gauge({ restantes, capacite }: { restantes: number | null; capacite: number }) {
  const t = gaugeTone(restantes, capacite);
  const used = restantes == null || capacite <= 0 ? 0 : Math.round(((capacite - restantes) / capacite) * 100);
  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#EFE6E3]" role="img" aria-label={t.label || "Occupation inconnue"}>
        <div className="h-full rounded-full transition-all" style={{ width: `${used}%`, background: t.color }} />
      </div>
      {t.label && <p className="mt-1 text-[11px] font-semibold" style={{ color: t.color }}>{t.label}</p>}
    </div>
  );
}
