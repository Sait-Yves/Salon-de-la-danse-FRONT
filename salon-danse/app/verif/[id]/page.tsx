import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchPlanning, fetchUserPlanning, findUser, getMe } from "../../services/loaders";
import { formatJour, SALON } from "../../services/config";
import { badgeId } from "../../services/badges";
import { EtatReservation } from "../../_components/ValidationBadge";
import type { Reservation, User } from "../../services/types";

// Page ouverte en scannant le QR code d'un badge : toujours à jour (missions, horaires, photo).
// Admin : n'importe quel badge. Bénévole : seulement le sien.
export default async function VerifPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const me = await getMe();
  if (!me) redirect(`/login?mode=password&next=/verif/${id}`);

  const isAdmin = me.role === "admin";
  let u: User | null = null;
  let list: Reservation[] = [];
  if (isAdmin) {
    const [user, planning] = await Promise.all([findUser(id), fetchUserPlanning(id)]);
    u = user.ok ? user.data : null;
    list = planning.ok ? planning.data : [];
  } else if (me.id === id) {
    u = me;
    const planning = await fetchPlanning();
    list = planning.ok ? planning.data : [];
  } else {
    return (
      <div className="mx-auto max-w-md space-y-4 p-5 py-10">
        <div className="rounded-3xl bg-[#3E150F] p-6 text-center text-white">
          <p className="font-['Montserrat'] text-xl font-black">Badge d&apos;un autre bénévole</p>
          <p className="mt-1 text-sm text-white/80">Seuls l&apos;équipe du Salon et le titulaire du badge peuvent voir ces informations.</p>
        </div>
        <Link href="/profile" className="block text-center text-sm font-semibold text-[#7A291E] underline">Voir mon badge</Link>
      </div>
    );
  }

  if (!u) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-5 py-10">
        <div className="rounded-3xl bg-red-700 p-6 text-center text-white">
          <p className="font-['Montserrat'] text-2xl font-black">Badge inconnu</p>
          <p className="mt-1 text-sm text-white/85">Aucun compte ne correspond à ce QR code (ID {id}). Ne laissez pas entrer sans vérification.</p>
        </div>
      </div>
    );
  }

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const sorted = [...list].sort((a, b) => a.creneau.jour.localeCompare(b.creneau.jour) || a.creneau.debut.localeCompare(b.creneau.debut));
  const photo = isAdmin ? `/api/photo?user=${u.id}` : "/api/photo";

  return (
    <div className="mx-auto max-w-md space-y-5 p-5 pb-16">
      <div className="rounded-3xl bg-emerald-700 p-5 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">{SALON.nom} · {SALON.dates}</p>
        <p className="mt-1 font-['Montserrat'] text-2xl font-black">Badge valide</p>
        {isAdmin && <p className="text-sm text-white/85">Vérifiez que la photo correspond à la personne.</p>}
      </div>

      <section className="official-card flex flex-col items-center gap-3 p-6 text-center">
        {u.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Photo de ${u.prenom} ${u.nom}`} className="h-48 w-40 rounded-2xl border border-[#7A291E]/20 object-cover" />
        ) : (
          <div className="flex h-48 w-40 items-center justify-center rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Pas de photo : vérifiez une pièce d&apos;identité</div>
        )}
        <div>
          <p className="font-['Montserrat'] text-2xl font-black text-[#333]">{u.prenom} <span className="uppercase">{u.nom}</span></p>
          <p className="font-mono text-sm text-[#3E150F]">{badgeId(u.id)}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-[#7A291E] px-3 py-1 font-['Montserrat'] text-xs font-black tracking-widest text-white">BÉNÉVOLE</span>
          {u.isMineur && <span className="rounded-full border border-[#A65A00] px-3 py-1 text-xs font-bold text-[#A65A00]">MINEUR</span>}
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${u.statutPlanning === "valide" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{u.statutPlanning === "valide" ? "Planning validé" : "Planning non validé"}</span>
        </div>
      </section>

      <section className="official-card p-5">
        <h2 className="mb-3 font-['Montserrat'] text-base font-extrabold">Missions et horaires</h2>
        {sorted.length === 0 ? (
          <p className="rounded-xl bg-[#7A291E]/5 p-3 text-sm">Aucune mission pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((r) => {
              const now = r.creneau.jour === today;
              return (
                <li key={r.id} className={`rounded-xl border p-3 text-sm ${now ? "border-emerald-600 bg-emerald-50" : "border-[#7A291E]/15"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span>
                      <b className="font-['Montserrat'] text-[#333]">{r.creneau.mission}</b>
                      <br />
                      {now ? "Aujourd'hui" : formatJour(r.creneau.jour).long} · {r.creneau.debut}–{r.creneau.fin}
                    </span>
                    <EtatReservation v={r.validation} statut={r.statut} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isAdmin && <Link href={`/admin/benevoles/${u.id}`} className="block text-center text-sm font-semibold text-[#7A291E] underline">Ouvrir la fiche complète</Link>}
    </div>
  );
}
