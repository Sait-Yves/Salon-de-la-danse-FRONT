import { fetchAllCreneaux, fetchMissions } from "../../services/loaders";
import { editionJours } from "../../services/config";
import ErrorCard from "../../_components/ErrorCard";
import MissionsBoard from "./MissionsBoard";

export default async function CreneauxAdmin() {
  const r = await fetchAllCreneaux(true);
  if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
  const { missions } = await fetchMissions(r.data);
  return <MissionsBoard missions={missions} creneaux={r.data} jours={editionJours()} />;
}
