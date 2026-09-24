"use client";

import Link from "next/link";
import { useState } from "react";
import { adminActivateEditionAction, adminArchiveEditionAction, adminDeleteEditionAction } from "../../services/actions";
import { formatJour } from "../../services/config";
import type { Edition } from "../../services/types";
import ConfirmButton from "./ConfirmButton";
import { EditionForm } from "./Forms";

const periode = (e: Edition) => {
  const a = formatJour(e.debut);
  const b = formatJour(e.fin);
  const annee = e.fin.slice(0, 4);
  return a.mois === b.mois ? `${a.num}–${b.num} ${b.mois} ${annee}` : `${a.num} ${a.mois} – ${b.num} ${b.mois} ${annee}`;
};

const ghost = "rounded-full border border-[#7A291E]/25 px-3 py-1 text-xs font-semibold text-[#7A291E] hover:border-[#7A291E]";

function Pill({ e, current }: { e: Edition; current: Edition | null }) {
  const on = current?.id === e.id;
  return (
    <Link
      href={`/admin/creneaux?edition=${e.id}`}
      aria-current={on ? "page" : undefined}
      className={`btn-pill text-xs !px-4 !py-2 ${on ? "btn-pill-primary" : "btn-pill-ghost"} ${e.archived && !on ? "opacity-70" : ""}`}
    >
      {e.nom}
      {e.active && <span className={`ml-2 rounded-full px-1.5 text-[10px] font-bold ${on ? "bg-white text-[#7A291E]" : "bg-emerald-100 text-emerald-800"}`}>Active</span>}
    </Link>
  );
}

// Choix de l'édition affichée, et gestion des éditions (créer, modifier, activer, archiver, supprimer).
export default function EditionsBar({ editions, current, missionsCount }: { editions: Edition[]; current: Edition | null; missionsCount: number }) {
  const [open, setOpen] = useState<"new" | "edit" | null>(null);
  const archives = editions.filter((e) => e.archived);
  const [showArchives, setShowArchives] = useState(!!current?.archived);
  const close = () => setOpen(null);

  return (
    <section className="official-card space-y-3 p-4" aria-label="Éditions">
      <div className="flex flex-wrap items-center gap-2">
        <span className="field-label !mb-0 mr-1">Édition</span>
        {editions.filter((e) => !e.archived).map((e) => <Pill key={e.id} e={e} current={current} />)}
        <button type="button" onClick={() => setOpen("new")} className="rounded-full border border-dashed border-[#7A291E]/40 px-3 py-1.5 text-xs font-semibold text-[#7A291E] hover:border-[#7A291E]">+ Édition</button>
        {archives.length > 0 && (
          <button type="button" aria-expanded={showArchives} onClick={() => setShowArchives((v) => !v)} className="ml-auto text-xs font-semibold text-[#3E150F]/70 underline underline-offset-2">
            Archives ({archives.length})
          </button>
        )}
      </div>
      {(showArchives || current?.archived) && archives.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#7A291E]/10 pt-3">
          <span className="text-xs font-semibold text-[#3E150F]/70">Archivées :</span>
          {archives.map((e) => <Pill key={e.id} e={e} current={current} />)}
        </div>
      )}

      {current && (
        <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
          <p>
            <span className="font-semibold text-[#333]">{periode(current)}</span>
            {current.archived
              ? <span className="ml-2 rounded-full bg-[#3E150F]/10 px-2 py-0.5 text-[11px] font-bold text-[#3E150F]">Archivée · lecture seule</span>
              : !current.active && <span className="ml-2 text-xs text-[#3E150F]/70">Pas visible par les bénévoles tant qu&apos;elle n&apos;est pas active.</span>}
          </p>
          <div className="flex flex-wrap items-start gap-2">
            {current.archived ? (
              <ConfirmButton label="Restaurer et activer" confirm="Restaurer (désactive les autres) ?" action={() => adminArchiveEditionAction(current.id, false)} />
            ) : (
              <>
                {!current.active && (
                  <ConfirmButton label="Rendre active" confirm="Activer (désactive les autres) ?" action={() => adminActivateEditionAction(current.id)} />
                )}
                <button type="button" onClick={() => setOpen("edit")} className={ghost}>Modifier</button>
                {!current.active && (
                  <ConfirmButton label="Archiver" confirm="Archiver ?" action={() => adminArchiveEditionAction(current.id, true)} />
                )}
                <ConfirmButton
                  label="Supprimer"
                  action={() => (missionsCount > 0
                    ? Promise.resolve({ ok: false, message: `Supprimez d'abord ${missionsCount > 1 ? `ses ${missionsCount} missions` : "sa mission"}, ou archivez-la.` })
                    : adminDeleteEditionAction(current.id))}
                />
              </>
            )}
          </div>
        </div>
      )}

      {open === "new" && <EditionForm onDone={close} />}
      {open === "edit" && current && <EditionForm key={current.id} edition={current} onDone={close} />}
    </section>
  );
}
