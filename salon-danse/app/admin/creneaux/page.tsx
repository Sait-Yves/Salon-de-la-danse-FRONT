import { fetchAllCreneaux, fetchEditions, fetchMissions } from "../../services/loaders";
import { editionJours } from "../../services/config";
import ErrorCard from "../../_components/ErrorCard";
import MissionsBoard from "./MissionsBoard";
import type { Edition } from "../../services/types";

// Jours entre deux dates incluses (AAAA-MM-JJ).
function joursEntre(debut: string, fin: string): string[] {
  const out: string[] = [];
  const d = new Date(`${debut}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  while (d <= end && out.length < 31) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export default async function CreneauxAdmin({ searchParams }: { searchParams: Promise<{ edition?: string }> }) {
  const { edition: wanted } = await searchParams;
  const eds = await fetchEditions();
  const editions = eds.ok ? eds.data : null;
  // Édition affichée : celle demandée dans l'URL, sinon l'active, sinon la plus récente.
  const edition: Edition | null = editions
    ? editions.find((e) => e.id === Number(wanted)) ?? editions.find((e) => e.active) ?? editions.find((e) => !e.archived) ?? null
    : null;

  const r = await fetchAllCreneaux(true, edition?.id);
  if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
  const { missions } = await fetchMissions(r.data, edition?.id);
  const jours = edition ? joursEntre(edition.debut, edition.fin) : editions ? [] : editionJours();

  return <MissionsBoard missions={missions} creneaux={r.data} jours={jours} editions={editions} edition={edition} />;
}
