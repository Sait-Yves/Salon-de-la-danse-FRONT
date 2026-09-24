// Remplissage d'un créneau : vert = places dispo, orange = 25 % de places restantes ou moins,
// gris = complet. Couleurs choisies pour un contraste AA sur fond blanc.
export const TONE = { ok: "#2E7D5B", warn: "#A65A00", full: "#6B6B6B", none: "#6B6B6B" };

export function gaugeTone(restantes: number | null, capacite: number) {
  if (restantes == null || capacite <= 0) return { color: TONE.none, label: "", short: "", tone: "none" as const };
  if (restantes <= 0) return { color: TONE.full, label: "Complet", short: "Complet", tone: "full" as const };
  const s = restantes > 1 ? "s" : "";
  const label = `${restantes} place${s} restante${s}`;
  const short = `${restantes} place${s}`;
  if (restantes / capacite <= 0.25) return { color: TONE.warn, label, short, tone: "warn" as const };
  return { color: TONE.ok, label, short, tone: "ok" as const };
}

// Pastille « 7 places » / « Complet ».
export function PlacesPill({ restantes, capacite }: { restantes: number | null; capacite: number }) {
  const t = gaugeTone(restantes, capacite);
  if (!t.short) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
      style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}10` }}
      title={t.label}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} aria-hidden />
      {t.short}
    </span>
  );
}

// Barre de remplissage (vues admin agrégées).
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
