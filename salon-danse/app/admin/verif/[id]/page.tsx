import Link from "next/link";
import { fetchEditions, fetchUserPlanning, findUser } from "../../../services/loaders";
import { formatJour } from "../../../services/config";
import { badgeId } from "../../../services/badges";
import { EtatReservation } from "../../../_components/ValidationBadge";

// Page ouverte en scannant le QR code d'un badge. Réservée aux admins (layout admin).
// L'admin compare la photo affichée avec la personne en face de lui.
export default async function VerifPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [user, planning, eds] = await Promise.all([findUser(id), fetchUserPlanning(id), fetchEditions()]);
  const u = user.ok ? user.data : null;
  const annee = ((eds.ok ? eds.data.find((e) => e.active)?.debut : undefined) ?? "2026").slice(0, 4);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const list = planning.ok
    ? [...planning.data].sort((a, b) => a.creneau.jour.localeCompare(b.creneau.jour) || a.creneau.debut.localeCompare(b.creneau.debut))
    : [];

  if (!u) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-6">
        <div className="rounded-3xl bg-red-700 p-6 text-center text-white">
          <p className="font-['Montserrat'] text-2xl font-black">Badge inconnu</p>
          <p className="mt-1 text-sm text-white/85">Aucun compte ne correspond à ce QR code (ID {id}). Ne laissez pas entrer sans vérification.</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-[#7A291E] underline">← Espace admin</Link>
      </div>
    );
  }

  const aujourdhui = list.filter((r) => r.creneau.jour === today);
  return (
    <div className="mx-auto max-w-md space-y-5 py-2">
      <div className="rounded-3xl bg-emerald-700 p-5 text-center text-white">
        <p className="font-['Montserrat'] text-2xl font-black">Badge valide</p>
        <p className="text-sm text-white/85">Vérifiez que la photo correspond à la personne.</p>
      </div>

      <section className="official-card flex flex-col items-center gap-3 p-6 text-center">
        {u.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo?user=${u.id}`} alt={`Photo de ${u.prenom} ${u.nom}`} className="h-48 w-40 rounded-2xl border border-[#7A291E]/20 object-cover" />
        ) : (
          <div className="flex h-48 w-40 items-center justify-center rounded-2xl bg-red-50 text-sm font-semibold text-red-700">Pas de photo : vérifiez une pièce d&apos;identité</div>
        )}
        <div>
          <p className="font-['Montserrat'] text-2xl font-black text-[#333]">{u.prenom} {u.nom}</p>
          <p className="font-mono text-sm text-[#3E150F]">{badgeId(u.id, annee)}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-[#7A291E] px-3 py-1 font-['Montserrat'] text-xs font-black tracking-widest text-white">{u.role === "admin" ? "ADMIN" : "BÉNÉVOLE"}</span>
          {u.isMineur && <span className="rounded-full border border-[#A65A00] px-3 py-1 text-xs font-bold text-[#A65A00]">MINEUR</span>}
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${u.statutPlanning === "valide" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{u.statutPlanning === "valide" ? "Planning validé" : "Planning non validé"}</span>
        </div>
      </section>

      <section className="official-card p-5">
        <h2 className="mb-3 font-['Montserrat'] text-base font-extrabold">Aujourd&apos;hui</h2>
        {aujourdhui.length === 0 ? (
          <p className="rounded-xl bg-[#7A291E]/5 p-3 text-sm">Aucun créneau prévu aujourd&apos;hui.</p>
        ) : (
          <ul className="space-y-2">
            {aujourdhui.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#7A291E]/15 p-3 text-sm">
                <span><b className="font-['Montserrat']">{r.creneau.debut}–{r.creneau.fin}</b> · {r.creneau.mission}</span>
                <EtatReservation v={r.validation} statut={r.statut} />
              </li>
            ))}
          </ul>
        )}
        {list.length > aujourdhui.length && (
          <>
            <h3 className="mb-2 mt-4 text-xs font-bold uppercase text-[#3E150F]/70">Tout son planning</h3>
            <ul className="space-y-1 text-sm">
              {list.map((r) => (
                <li key={r.id}>{formatJour(r.creneau.jour).long} · {r.creneau.debut}–{r.creneau.fin} · {r.creneau.mission}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Link href={`/admin/benevoles/${u.id}`} className="block text-center text-sm font-semibold text-[#7A291E] underline">Ouvrir la fiche complète</Link>
    </div>
  );
}
