import Link from "next/link";
import { fetchPlanning, getMe } from "../../services/loaders";
import { formatJour } from "../../services/config";
import StatusBadge from "../../_components/StatusBadge";
import ErrorCard from "../../_components/ErrorCard";

export default async function ProfilePage() {
  const user = (await getMe())!;
  const planning = await fetchPlanning();
  const valide = user.statutPlanning === "valide";
  const list = planning.ok
    ? [...planning.data].sort((a, b) => a.creneau.jour.localeCompare(b.creneau.jour) || a.creneau.debut.localeCompare(b.creneau.debut))
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-5 pb-20 md:p-8">
      <div className="banner-gradient animate-rise flex items-center gap-5">
        {user.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/api/photo" alt={`Photo de ${user.prenom} ${user.nom}`} width={84} height={84} className="h-[84px] w-[84px] rounded-2xl border-2 border-white/30 object-cover" />
        ) : (
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-2xl bg-white/15 font-['Montserrat'] text-2xl font-black" aria-hidden>{user.prenom[0]}{user.nom[0]}</div>
        )}
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black">{user.prenom} {user.nom}</h1>
          <p className="text-sm text-white/75">{user.email} · {user.telephone}</p>
          <div className="mt-2"><StatusBadge statut={user.statutPlanning} /></div>
        </div>
      </div>

      <section className="official-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-['Montserrat'] text-lg font-extrabold">Mon récapitulatif</h2>
          <a href="/api/planning-pdf" className="btn-pill btn-pill-ghost text-xs !px-4 !py-2.5">Télécharger en PDF</a>
        </div>
        {!planning.ok ? (
          <ErrorCard message={planning.error} status={planning.status} />
        ) : list.length === 0 ? (
          <p className="rounded-2xl bg-[#7A291E]/5 p-5 text-center text-sm">
            Vous n&apos;avez pas encore choisi de créneau. <Link href="/planning" className="font-semibold text-[#7A291E] underline">Composer mon planning</Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => {
              const f = formatJour(r.creneau.jour);
              return (
                <li key={r.id} className="flex items-center gap-4 rounded-2xl border border-[#7A291E]/10 p-4">
                  <div className="min-w-14 rounded-xl bg-[#7A291E]/10 py-2 text-center font-['Montserrat'] font-extrabold text-[#7A291E]">
                    <span className="block text-lg leading-none">{f.num}</span>
                    <span className="block text-[10px] font-semibold uppercase">{f.court}</span>
                  </div>
                  <div>
                    <p className="font-['Montserrat'] text-sm font-bold text-[#333]">{r.creneau.mission}</p>
                    <p className="text-sm">{r.creneau.debut} – {r.creneau.fin}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!valide && list.length > 0 && (
          <p className="mt-4 text-sm">Votre planning est encore un brouillon. <Link href="/planning" className="font-semibold text-[#7A291E] underline">Le modifier ou le valider</Link></p>
        )}
      </section>

      <p className="text-center text-xs">Vos informations personnelles ne sont modifiables que par un administrateur. Pour toute demande, contactez l&apos;équipe du Salon.</p>
    </div>
  );
}
