import Link from "next/link";
import { fetchAllCreneaux, fetchUserPlanning, findUser, getMe } from "../../../services/loaders";
import StatusBadge from "../../../_components/StatusBadge";
import ErrorCard from "../../../_components/ErrorCard";
import StatusToggle from "../../StatusToggle";
import UserEditForm from "./UserEditForm";
import PlanningAdmin from "./PlanningAdmin";
import RoleToggle from "./RoleToggle";

export default async function BenevolePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const user = await findUser(id);
  if (!user.ok) return <ErrorCard message={user.error} status={user.status} />;
  if (!user.data) return <ErrorCard title="Bénévole introuvable" message="Ce compte n'existe pas." />;
  const u = user.data;
  const [planning, creneaux, me] = await Promise.all([fetchUserPlanning(id), fetchAllCreneaux(true), getMe()]);

  return (
    <>
      <Link href="/admin" className="text-sm font-semibold text-[#7A291E] underline">← Retour à la liste</Link>
      <div className="banner-gradient animate-rise flex flex-wrap items-center gap-5">
        {u.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo?user=${u.id}`} alt={`Photo de ${u.prenom} ${u.nom}`} width={84} height={84} className="h-[84px] w-[84px] rounded-2xl border-2 border-white/30 object-cover" />
        ) : (
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-2xl bg-white/15 font-['Montserrat'] text-2xl font-black" aria-hidden>{u.prenom[0]}{u.nom[0]}</div>
        )}
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black">{u.prenom} {u.nom}{u.role === "admin" && <span className="ml-3 rounded-full bg-white px-2 py-0.5 align-middle text-[11px] font-bold text-[#7A291E]">Admin</span>}</h1>
          <p className="text-sm text-white/75">{u.email} · {u.telephone}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3"><StatusBadge statut={u.statutPlanning} /><span className="rounded-full bg-white px-1"><StatusToggle userId={u.id} statut={u.statutPlanning} /></span>{me?.id !== u.id && <span className="rounded-full bg-white px-1"><RoleToggle userId={u.id} role={u.role} /></span>}</div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="official-card p-6">
          <h2 className="mb-4 font-['Montserrat'] text-lg font-extrabold">Informations</h2>
          <UserEditForm user={u} />
        </section>
        <section className="official-card p-6">
          <h2 className="mb-4 font-['Montserrat'] text-lg font-extrabold">Planning</h2>
          {planning.ok && creneaux.ok ? (
            <PlanningAdmin userId={u.id} reservations={planning.data} creneaux={creneaux.data} locked={u.statutPlanning === "valide"} />
          ) : (
            <ErrorCard message={(!planning.ok ? planning.error : !creneaux.ok ? creneaux.error : "")} />
          )}
        </section>
      </div>
    </>
  );
}
