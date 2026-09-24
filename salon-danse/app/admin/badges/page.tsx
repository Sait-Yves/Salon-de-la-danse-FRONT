import Link from "next/link";
import { fetchAllUsers, fetchEditions, findUser } from "../../services/loaders";
import { SALON } from "../../services/config";
import { badgeId, badgeQrSvg, siteUrl } from "../../services/badges";
import ErrorCard from "../../_components/ErrorCard";
import PrintButton from "./PrintButton";
import type { User } from "../../services/types";

type SP = { statut?: string; user?: string };

// Planches A4 de 8 badges (105 × 74 mm), prêtes à imprimer ou à enregistrer en PDF depuis le navigateur.
export default async function BadgesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const seul = Number(sp.user) || 0;
  const vue = sp.statut === "tous" ? "tous" : "valide";

  let users: User[] = [];
  if (seul) {
    const r = await findUser(seul);
    if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
    users = r.data ? [r.data] : [];
  } else {
    const r = await fetchAllUsers({ role: "benevole", statut: vue === "valide" ? "valide" : undefined });
    if (!r.ok) return <ErrorCard message={r.error} status={r.status} />;
    users = r.data.sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom));
  }

  const eds = await fetchEditions();
  const active = eds.ok ? eds.data.find((e) => e.active) : undefined;
  const annee = (active?.debut ?? "2026").slice(0, 4);
  const base = await siteUrl();
  const qrs = await Promise.all(users.map((u) => badgeQrSvg(base, u.id)));

  const pill = (on: boolean) => `btn-pill text-xs !px-4 !py-2 ${on ? "btn-pill-primary" : "btn-pill-ghost"}`;

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { background: #fff !important; }
          .badge-sheet { width: 210mm; display: grid; grid-template-columns: repeat(2, 105mm); grid-auto-rows: 74mm; gap: 0; }
          .badge { break-inside: avoid; border: 0.2mm dashed #bbb !important; box-shadow: none !important; border-radius: 0 !important; }
          .badge:nth-child(8n) { break-after: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="banner-gradient animate-rise flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black">Badges</h1>
          <p className="text-sm text-white/75">{users.length} badge{users.length > 1 ? "s" : ""} · planches A4 de 8, à imprimer ou enregistrer en PDF.</p>
        </div>
        <PrintButton disabled={users.length === 0} />
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {seul ? (
          <Link href="/admin/badges" className="btn-pill btn-pill-ghost text-xs !px-4 !py-2">← Tous les badges</Link>
        ) : (
          <>
            <Link href="/admin/badges" className={pill(vue === "valide")}>Plannings validés</Link>
            <Link href="/admin/badges?statut=tous" className={pill(vue === "tous")}>Tous les bénévoles</Link>
          </>
        )}
        <span className="text-xs text-[#3E150F]/70">Au scan, le QR code ouvre la fiche de vérification (réservée aux admins).</span>
      </div>

      {users.length === 0 ? (
        <p className="official-card p-6 text-center text-sm print:hidden">Aucun bénévole à badger avec ce filtre.</p>
      ) : (
        <div className="overflow-x-auto print:overflow-visible">
        <div className="badge-sheet grid justify-center gap-4 sm:grid-cols-[repeat(auto-fill,105mm)]">
          {users.map((u, i) => (
            <article key={u.id} className="badge relative flex h-[74mm] w-[105mm] flex-col overflow-hidden rounded-xl border border-[#7A291E]/15 bg-white shadow-sm">
              <header className="flex items-center justify-between bg-[linear-gradient(135deg,#7A291E,#3E150F)] px-[4mm] py-[2mm] text-white">
                <span className="font-['Montserrat'] text-[3mm] font-black uppercase tracking-wide">{SALON.nom}</span>
                <span className="text-[2.4mm] text-white/80">{active ? active.nom : SALON.dates}</span>
              </header>
              <div className="flex flex-1 gap-[4mm] p-[4mm]">
                {u.hasPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/photo?user=${u.id}`} alt="" className="h-[34mm] w-[27mm] shrink-0 rounded-[1.5mm] border border-[#7A291E]/20 object-cover" />
                ) : (
                  <div className="flex h-[34mm] w-[27mm] shrink-0 items-center justify-center rounded-[1.5mm] bg-[#7A291E]/10 font-['Montserrat'] text-[8mm] font-black text-[#7A291E]">{u.prenom[0]}{u.nom[0]}</div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-['Montserrat'] text-[6mm] font-black leading-tight text-[#333]">{u.prenom}</p>
                  <p className="truncate font-['Montserrat'] text-[4.2mm] font-bold uppercase leading-tight text-[#333]">{u.nom}</p>
                  <div className="mt-[2mm] flex flex-wrap gap-[1.5mm]">
                    <span className="rounded-full bg-[#7A291E] px-[3mm] py-[0.8mm] font-['Montserrat'] text-[3mm] font-black tracking-widest text-white">BÉNÉVOLE</span>
                    {u.isMineur && <span className="rounded-full border border-[#A65A00] px-[2mm] py-[0.6mm] text-[2.6mm] font-bold text-[#A65A00]">MINEUR</span>}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-[2mm]">
                    <span className="font-mono text-[2.8mm] font-semibold text-[#3E150F]">{badgeId(u.id, annee)}</span>
                    <span className="h-[20mm] w-[20mm] shrink-0 [&>svg]:h-full [&>svg]:w-full" aria-label="QR code de vérification" dangerouslySetInnerHTML={{ __html: qrs[i] }} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        </div>
      )}
    </>
  );
}
