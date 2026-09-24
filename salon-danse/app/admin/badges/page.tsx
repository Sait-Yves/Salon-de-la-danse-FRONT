import Link from "next/link";
import { fetchAllUsers, findUser } from "../../services/loaders";
import { badgeId, badgeQrSvg, siteUrl } from "../../services/badges";
import ErrorCard from "../../_components/ErrorCard";
import PrintButton from "../../_components/PrintButton";
import Badge from "../../_components/Badge";
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
        <span className="text-xs text-[#3E150F]/70">Au scan, le QR code ouvre la page à jour du badge : missions, horaires, photo.</span>
      </div>

      {users.length === 0 ? (
        <p className="official-card p-6 text-center text-sm print:hidden">Aucun bénévole à badger avec ce filtre.</p>
      ) : (
        <div className="overflow-x-auto print:overflow-visible">
        <div className="badge-sheet grid justify-center gap-4 sm:grid-cols-[repeat(auto-fill,105mm)]">
          {users.map((u, i) => (
            <Badge key={u.id} user={u} qrSvg={qrs[i]} photoSrc={`/api/photo?user=${u.id}`} id={badgeId(u.id)} />
          ))}
        </div>
        </div>
      )}
    </>
  );
}
