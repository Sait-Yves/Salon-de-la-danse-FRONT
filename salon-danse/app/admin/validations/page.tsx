import Link from "next/link";
import { fetchDemandes } from "../../services/loaders";
import { formatJour } from "../../services/config";
import { PlacesPill } from "../../_components/Gauge";
import StatusBadge from "../../_components/StatusBadge";
import ErrorCard from "../../_components/ErrorCard";
import DecisionButtons from "./DecisionButtons";

const quand = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
};

export default async function ValidationsPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const vue = statut === "acceptee" ? "acceptee" : "en_attente";
  const r = await fetchDemandes(vue);

  return (
    <>
      <div className="banner-gradient animate-rise">
        <h1 className="font-['Montserrat'] text-2xl font-black">Demandes sur missions sensibles</h1>
        <p className="text-sm text-white/75">Accepter confirme la place. Refuser la libère, et le planning du bénévole repasse en brouillon.</p>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/validations" className={`btn-pill text-xs !px-4 !py-2 ${vue === "en_attente" ? "btn-pill-primary" : "btn-pill-ghost"}`}>En attente{vue === "en_attente" && r.ok ? ` · ${r.data.total}` : ""}</Link>
        <Link href="/admin/validations?statut=acceptee" className={`btn-pill text-xs !px-4 !py-2 ${vue === "acceptee" ? "btn-pill-primary" : "btn-pill-ghost"}`}>Acceptées{vue === "acceptee" && r.ok ? ` · ${r.data.total}` : ""}</Link>
      </div>

      <section className="official-card p-6">
        {!r.ok ? (
          <ErrorCard message={r.error} status={r.status} />
        ) : r.data.items.length === 0 ? (
          <p className="rounded-2xl bg-[#7A291E]/5 p-5 text-center text-sm">{vue === "en_attente" ? "Aucune demande en attente." : "Aucune demande acceptée pour l'instant."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[#3E150F]/70">
                <tr><th className="py-2">Bénévole</th><th>Créneau</th><th className="hidden md:table-cell">Places</th><th className="hidden md:table-cell">Demandé le</th><th className="hidden sm:table-cell">Planning du bénévole</th>{vue === "en_attente" && <th className="text-right">Décision</th>}</tr>
              </thead>
              <tbody>
                {r.data.items.map((d) => {
                  const c = d.reservation.creneau;
                  return (
                    <tr key={d.reservation.id} className="border-t border-[#7A291E]/10 align-top">
                      <td className="py-3 pr-2">
                        <Link href={`/admin/benevoles/${d.user.id}`} className="font-semibold text-[#7A291E] underline-offset-2 hover:underline">{d.user.prenom} {d.user.nom}</Link>
                        {d.user.isMineur && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Mineur</span>}
                      </td>
                      <td className="py-3 pr-2">
                        <Link href={`/admin/creneaux/${c.id}`} className="font-semibold text-[#333] hover:underline">{c.mission}</Link>
                        {c.jour && <p className="text-xs">{formatJour(c.jour).long} · {c.debut}–{c.fin}</p>}
                      </td>
                      <td className="hidden py-3 pr-2 md:table-cell"><PlacesPill restantes={c.restantes} capacite={c.capacite} /></td>
                      <td className="hidden py-3 pr-2 whitespace-nowrap text-xs md:table-cell">{quand(d.creeLe)}</td>
                      <td className="hidden py-3 pr-2 sm:table-cell"><StatusBadge statut={d.reservation.statut} /></td>
                      {vue === "en_attente" && <td className="py-3 text-right"><DecisionButtons reservationId={d.reservation.id} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
