import Link from "next/link";
import { fetchPlanning, getMe } from "../../services/loaders";
import { SALON } from "../../services/config";
import StatusBadge from "../../_components/StatusBadge";

const REGLES = [
  { t: "1 à 3 créneaux", d: "Vous pouvez vous engager sur 1 à 3 créneaux de 2 h maximum sur tout le week-end." },
  { t: "Pas de chevauchement", d: "Deux missions ne peuvent pas se tenir en même temps." },
  { t: "Une pause obligatoire", d: "Trois créneaux d'affilée sont interdits." },
  { t: "Places limitées", d: "Chaque créneau affiche ses places restantes. Vert : places disponibles. Orange : presque complet. Gris : complet." },
  { t: "Missions sensibles", d: "Certaines missions (billetterie, caisse…) sont soumises à la validation d'un administrateur. Votre demande reste en attente jusqu'à sa réponse, envoyée par e-mail." },
  { t: "Validation définitive", d: "Tant que vous n'avez pas validé, votre planning reste modifiable. Ensuite, seul un administrateur peut le changer." },
];

export default async function DashboardPage() {
  const user = (await getMe())!;
  const planning = await fetchPlanning();
  const n = planning.ok ? planning.data.length : null;
  const valide = user.statutPlanning === "valide";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-5 pb-20 md:p-8">
      <div className="banner-gradient animate-rise flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black tracking-tight md:text-3xl">Bonjour {user.prenom}</h1>
          <p className="mt-1 text-sm text-white/75">{SALON.nom} · {SALON.dates}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusBadge statut={user.statutPlanning} />
          {n != null && <span className="text-sm text-white/80">{n} / {SALON.quotaMax} créneau{n > 1 ? "x" : ""} choisi{n > 1 ? "s" : ""}</span>}
          {!valide && <Link href="/planning" className="btn-pill btn-pill-inverse mt-1 text-sm">{n ? "Continuer mon planning" : "Composer mon planning"} →</Link>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="official-card p-5">
          <p className="field-label">Dates</p>
          <p className="font-['Montserrat'] font-extrabold text-[#333]">{SALON.dates}</p>
        </div>
        <div className="official-card p-5">
          <p className="field-label">Lieu</p>
          <p className="font-['Montserrat'] font-extrabold text-[#333]">{SALON.lieu}</p>
        </div>
        <div className="official-card p-5">
          <p className="field-label">Quota</p>
          <p className="font-['Montserrat'] font-extrabold text-[#333]">{SALON.quotaMin} à {SALON.quotaMax} créneaux</p>
        </div>
      </div>

      <section className="official-card p-6">
        <h2 className="mb-4 font-['Montserrat'] text-lg font-extrabold">Les règles du planning</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {REGLES.map((r) => (
            <li key={r.t} className="rounded-2xl bg-[#7A291E]/5 p-4">
              <p className="font-['Montserrat'] text-sm font-bold text-[#7A291E]">{r.t}</p>
              <p className="mt-1 text-sm">{r.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/planning" className="btn-pill btn-pill-primary">{valide ? "Voir mon planning" : n ? "Modifier mon planning" : "Composer mon planning"}</Link>
        {valide && <Link href="/profile" className="btn-pill btn-pill-ghost">Récapitulatif et PDF</Link>}
      </div>
    </div>
  );
}
