import { fetchAllCreneaux, fetchPlanning, getMe } from "../../services/loaders";
import ErrorCard from "../../_components/ErrorCard";
import PlanningBoard from "./PlanningBoard";

export default async function PlanningPage() {
  const user = (await getMe())!;
  const [creneaux, planning] = await Promise.all([fetchAllCreneaux(), fetchPlanning()]);
  if (!creneaux.ok) return <div className="p-5 py-16"><ErrorCard message={creneaux.error} status={creneaux.status} /></div>;
  if (!planning.ok) return <div className="p-5 py-16"><ErrorCard message={planning.error} status={planning.status} /></div>;
  if (creneaux.data.length === 0) {
    return <div className="p-5 py-16"><ErrorCard title="Planning pas encore ouvert" message="Aucun créneau n'est disponible pour le moment. Revenez plus tard." /></div>;
  }
  return <PlanningBoard creneaux={creneaux.data} reservations={planning.data} locked={user.statutPlanning === "valide"} />;
}
