import Link from "next/link";
import { fetchAllCreneaux } from "../../services/loaders";
import { formatJour } from "../../services/config";
import Gauge from "../../_components/Gauge";
import ErrorCard from "../../_components/ErrorCard";

export default async function CreneauxAdmin({ searchParams }: { searchParams: Promise<{ jour?: string }> }) {
  const { jour } = await searchParams;
  const r = await fetchAllCreneaux(true);
  if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
  const jours = [...new Set(r.data.map((c) => c.jour))].sort();
  const current = jour && jours.includes(jour) ? jour : "";
  const list = r.data
    .filter((c) => !current || c.jour === current)
    .sort((a, b) => a.jour.localeCompare(b.jour) || a.debut.localeCompare(b.debut) || a.mission.localeCompare(b.mission));

  return (
    <>
      <div className="banner-gradient animate-rise">
        <h1 className="font-['Montserrat'] text-2xl font-black">Créneaux</h1>
        <p className="text-sm text-white/75">{r.data.length} créneaux, missions sensibles incluses.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/creneaux" className={`btn-pill text-xs !px-4 !py-2 ${!current ? "btn-pill-primary" : "btn-pill-ghost"}`}>Tous</Link>
        {jours.map((j) => (
          <Link key={j} href={`/admin/creneaux?jour=${j}`} className={`btn-pill text-xs !px-4 !py-2 ${current === j ? "btn-pill-primary" : "btn-pill-ghost"}`}>{formatJour(j).court} {formatJour(j).num}</Link>
        ))}
      </div>
      <section className="official-card overflow-x-auto p-6">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-[#3E150F]/70"><tr><th className="py-2">Jour</th><th>Horaire</th><th>Mission</th><th className="text-right">Occupation</th><th className="w-40 pl-4">Remplissage</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-[#7A291E]/10">
                <td className="py-3">{formatJour(c.jour).court} {formatJour(c.jour).num}</td>
                <td>{c.debut}–{c.fin}</td>
                <td>{c.mission}{c.sensible && <span className="ml-2 rounded-full bg-[#3E150F] px-2 py-0.5 text-[10px] text-white">Sensible</span>}</td>
                <td className="text-right">{c.restantes == null ? "—" : `${c.capacite - c.restantes}/${c.capacite}`}</td>
                <td className="pl-4"><Gauge restantes={c.restantes} capacite={c.capacite} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
