import Link from "next/link";
import { fetchAllPlannings, fetchStats, fetchUserPlanning, fetchUsers, getMe, type UserFilters } from "../services/loaders";
import { formatJour } from "../services/config";
import Gauge from "../_components/Gauge";
import StatusBadge from "../_components/StatusBadge";
import ErrorCard from "../_components/ErrorCard";
import StatusToggle from "./StatusToggle";

type SP = { q?: string; statut?: string; mineur?: string; page?: string };

function qs(sp: SP, over: Partial<SP>) {
  const p = new URLSearchParams();
  const m = { ...sp, ...over };
  for (const [k, v] of Object.entries(m)) if (v) p.set(k, String(v));
  return p.toString();
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters: UserFilters = {
    role: "benevole",
    q: sp.q || undefined,
    statut: sp.statut === "valide" || sp.statut === "brouillon" ? sp.statut : undefined,
    mineur: sp.mineur === "1" ? true : undefined,
    page: Math.max(1, Number(sp.page) || 1),
  };
  const [stats, users, admins, me, grouped] = await Promise.all([
    fetchStats(), fetchUsers(filters), fetchUsers({ role: "admin", perPage: 50 }), getMe(), fetchAllPlannings("benevole"),
  ]);
  // Créneaux choisis par chaque bénévole : un seul appel groupé (GET /admin/plannings).
  // Si la route échoue, on revient à un appel par bénévole affiché.
  const plannings = new Map<number, Awaited<ReturnType<typeof fetchUserPlanning>>>();
  if (users.ok) {
    if (grouped.ok) {
      users.data.items.forEach((u) => plannings.set(u.id, { ok: true, data: grouped.data.get(u.id) ?? [] }));
    } else {
      const all = await Promise.all(users.data.items.map((u) => fetchUserPlanning(u.id)));
      users.data.items.forEach((u, i) => plannings.set(u.id, all[i]));
    }
  }
  const taux = stats.ok && stats.data.capacite > 0 ? Math.round((stats.data.occupees / stats.data.capacite) * 100) : 0;
  const exportQs = qs({ q: sp.q, statut: sp.statut, mineur: sp.mineur }, {});

  return (
    <>
      <div className="banner-gradient animate-rise">
        <h1 className="font-['Montserrat'] text-2xl font-black">Vue d&apos;ensemble</h1>
        <p className="text-sm text-white/75">Suivi des bénévoles et du remplissage des créneaux.</p>
      </div>

      {stats.ok ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5" aria-label="Chiffres clés">
          {[
            ["Comptes créés", stats.data.comptes],
            ["Plannings validés", stats.data.valides],
            ["En attente", stats.data.attente],
            ["Mineurs", stats.data.mineurs],
            ["Remplissage", `${taux} %`],
          ].map(([l, v]) => (
            <div key={String(l)} className="official-card p-4 text-center">
              <p className="font-['Montserrat'] text-3xl font-black text-[#7A291E]">{v}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3E150F]/70">{l}</p>
            </div>
          ))}
        </section>
      ) : (
        <ErrorCard title="Chiffres indisponibles" message={stats.error} status={stats.status} />
      )}

      {stats.ok && stats.data.parMission.length > 0 && (
        <section className="official-card p-6">
          <h2 className="mb-4 font-['Montserrat'] text-lg font-extrabold">Remplissage par mission</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {stats.data.parMission.map((m) => (
              <li key={m.mission}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{m.mission}{m.sensible && <span className="ml-2 rounded-full bg-[#3E150F] px-2 py-0.5 text-[10px] text-white">Sensible</span>}</span>
                  <span className="text-[#3E150F]/70">{m.occupees}/{m.capacite}</span>
                </div>
                <Gauge restantes={m.capacite - m.occupees} capacite={m.capacite} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="official-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-['Montserrat'] text-lg font-extrabold">Bénévoles</h2>
          <a href={`/api/export${exportQs ? `?${exportQs}` : ""}`} className="btn-pill btn-pill-ghost text-xs !px-4 !py-2.5">Exporter en CSV</a>
        </div>
        <form method="get" className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Nom, prénom ou e-mail" className="field" aria-label="Rechercher" />
          <select name="statut" defaultValue={sp.statut ?? ""} className="field" aria-label="Statut du planning">
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="valide">Validé</option>
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="mineur" value="1" defaultChecked={sp.mineur === "1"} /> Mineurs</label>
          <button className="btn-pill btn-pill-primary text-sm">Filtrer</button>
        </form>

        {!users.ok ? (
          <ErrorCard message={users.error} status={users.status} />
        ) : users.data.items.length === 0 ? (
          <p className="rounded-2xl bg-[#7A291E]/5 p-5 text-center text-sm">Aucun bénévole ne correspond.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-[#3E150F]/70">
                  <tr><th className="py-2">Nom</th><th className="hidden md:table-cell">E-mail</th><th>Créneaux choisis</th><th>Statut</th><th className="text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {users.data.items.map((u) => (
                    <tr key={u.id} className="border-t border-[#7A291E]/10">
                      <td className="py-3 pr-2">
                        <Link href={`/admin/benevoles/${u.id}`} className="font-semibold text-[#7A291E] underline-offset-2 hover:underline">{u.prenom} {u.nom}</Link>
                        {u.isMineur && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Mineur</span>}
                      </td>
                      <td className="hidden md:table-cell">{u.email}</td>
                      <td className="py-3 pr-3">
                        {(() => {
                          const pl = plannings.get(u.id);
                          if (!pl || !pl.ok) return <span className="text-xs text-[#3E150F]/70">Indisponible</span>;
                          if (pl.data.length === 0) return <span className="text-xs text-[#3E150F]/70">Aucun créneau</span>;
                          const list = [...pl.data].sort((a, b) => a.creneau.jour.localeCompare(b.creneau.jour) || a.creneau.debut.localeCompare(b.creneau.debut));
                          return (
                            <div>
                              <p className="mb-1 text-xs font-bold text-[#7A291E]">{list.length} / 3</p>
                              <ul className="flex flex-wrap gap-1">
                                {list.map((r) => (
                                  <li key={r.id} className="rounded-full bg-[#7A291E]/8 px-2 py-0.5 text-[11px] text-[#3E150F]" title={`${formatJour(r.creneau.jour).long} ${r.creneau.debut}–${r.creneau.fin}`}>
                                    {formatJour(r.creneau.jour).court} {r.creneau.debut} · {r.creneau.mission}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                      </td>
                      <td><StatusBadge statut={u.statutPlanning} /></td>
                      <td className="text-right"><StatusToggle userId={u.id} statut={u.statutPlanning} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
              {users.data.page > 1 ? <Link className="btn-pill btn-pill-ghost text-xs !px-4 !py-2" href={`/admin?${qs(sp, { page: String(users.data.page - 1) })}`}>← Précédent</Link> : <span />}
              <span>Page {users.data.page} / {users.data.lastPage} · {users.data.total} bénévoles</span>
              {users.data.page < users.data.lastPage ? <Link className="btn-pill btn-pill-ghost text-xs !px-4 !py-2" href={`/admin?${qs(sp, { page: String(users.data.page + 1) })}`}>Suivant →</Link> : <span />}
            </nav>
          </>
        )}
      </section>

      {admins.ok && admins.data.items.length > 0 && (
        <section className="official-card p-6">
          <h2 className="font-['Montserrat'] text-lg font-extrabold">Administrateurs <span className="text-[#3E150F]/70">· {admins.data.total}</span></h2>
          <p className="mb-4 text-sm text-[#3E150F]/70">Comptes qui ont accès à cet espace. Pour en ajouter un : fiche du bénévole → « Passer admin ».</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[#3E150F]/70">
                <tr><th className="py-2">Nom</th><th className="hidden md:table-cell">E-mail</th><th className="text-right">Fiche</th></tr>
              </thead>
              <tbody>
                {admins.data.items.map((a) => (
                  <tr key={a.id} className="border-t border-[#7A291E]/10">
                    <td className="py-3 pr-2 font-semibold">
                      {a.prenom} {a.nom}
                      {me?.id === a.id && <span className="ml-2 rounded-full bg-[#7A291E]/10 px-2 py-0.5 text-[10px] font-bold text-[#7A291E]">Vous</span>}
                    </td>
                    <td className="hidden md:table-cell">{a.email}</td>
                    <td className="text-right"><Link href={`/admin/benevoles/${a.id}`} className="text-xs font-semibold text-[#7A291E] underline-offset-2 hover:underline">Voir la fiche →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
