import Link from "next/link";
import { fetchAllCreneaux, fetchInscrits } from "../../../services/loaders";
import { formatJour } from "../../../services/config";
import { PlacesPill } from "../../../_components/Gauge";
import StatusBadge from "../../../_components/StatusBadge";
import ErrorCard from "../../../_components/ErrorCard";
import RemoveInscrit from "./RemoveInscrit";

export default async function CreneauPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [r, all] = await Promise.all([fetchInscrits(id), fetchAllCreneaux(true)]);
  if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
  const c = r.data.creneau ?? (all.ok ? all.data.find((x) => x.id === id) ?? null : null);
  const restantes = r.data.restantes ?? c?.restantes ?? null;
  const inscrits = [...r.data.inscrits].sort((a, b) => a.user.nom.localeCompare(b.user.nom));

  return (
    <>
      <Link href="/admin/creneaux" className="text-sm font-semibold text-[#7A291E] underline">← Missions et créneaux</Link>
      <div className="banner-gradient animate-rise flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black">
            {c?.mission ?? "Créneau"}
            {c?.sensible && <span className="ml-3 rounded-full bg-white px-2 py-0.5 align-middle text-[11px] font-bold text-[#7A291E]">Sensible</span>}
          </h1>
          {c && <p className="text-sm text-white/75">{formatJour(c.jour).long} · {c.debut} – {c.fin}</p>}
        </div>
        {c && (
          <p className="font-['Montserrat'] text-3xl font-black">{inscrits.length}<span className="text-lg text-white/70"> / {c.capacite} inscrits</span></p>
        )}
      </div>

      <section className="official-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-['Montserrat'] text-lg font-extrabold">Inscrits</h2>
          {c && <PlacesPill restantes={restantes} capacite={c.capacite} />}
        </div>
        {inscrits.length === 0 ? (
          <p className="rounded-2xl bg-[#7A291E]/5 p-5 text-center text-sm">Personne n&apos;est inscrit sur ce créneau pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[#3E150F]/70">
                <tr><th className="py-2">Nom</th><th className="hidden md:table-cell">E-mail</th><th className="hidden sm:table-cell">Téléphone</th><th>Planning</th><th className="text-right">Action</th></tr>
              </thead>
              <tbody>
                {inscrits.map((i) => (
                  <tr key={i.reservationId} className="border-t border-[#7A291E]/10">
                    <td className="py-3 pr-2">
                      <Link href={`/admin/benevoles/${i.user.id}`} className="font-semibold text-[#7A291E] underline-offset-2 hover:underline">{i.user.prenom} {i.user.nom}</Link>
                      {i.user.isMineur && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Mineur</span>}
                    </td>
                    <td className="hidden md:table-cell">{i.user.email}</td>
                    <td className="hidden sm:table-cell whitespace-nowrap">{i.user.telephone}</td>
                    <td><StatusBadge statut={i.user.statutPlanning === "valide" || i.statut === "valide" ? "valide" : "brouillon"} /></td>
                    <td className="text-right"><RemoveInscrit userId={i.user.id} reservationId={i.reservationId} locked={i.user.statutPlanning === "valide" || i.statut === "valide"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
