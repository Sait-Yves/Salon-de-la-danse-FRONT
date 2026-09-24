"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminDeleteCreneauAction, adminDeleteMissionAction } from "../../services/actions";
import { formatJour } from "../../services/config";
import { PlacesPill } from "../../_components/Gauge";
import type { Creneau, Edition, Mission } from "../../services/types";
import ConfirmButton from "./ConfirmButton";
import { CreneauForm, MissionForm } from "./Forms";
import EditionsBar from "./EditionsBar";

type Open =
  | { kind: "newMission" }
  | { kind: "editMission"; id: number }
  | { kind: "newCreneau"; missionId: number }
  | { kind: "editCreneau"; id: number }
  | null;

const occ = (c: Creneau) => (c.restantes == null ? 0 : Math.max(0, c.capacite - c.restantes));

export default function MissionsBoard({ missions, creneaux, jours, editions, edition }: {
  missions: Mission[];
  creneaux: Creneau[];
  jours: string[];
  editions: Edition[] | null; // null : route des éditions indisponible
  edition: Edition | null;
}) {
  const [open, setOpen] = useState<Open>(null);
  const [jour, setJour] = useState("");
  const [flash, setFlash] = useState("");
  const close = (message?: string) => { setOpen(null); if (message) setFlash(message); };
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 6000);
    return () => clearTimeout(t);
  }, [flash]);
  // Jours proposés à la création : ceux de l'édition (sinon ceux des créneaux existants).
  const joursCreation = jours.length ? jours : [...new Set(creneaux.map((c) => c.jour))].sort();

  const byMission = useMemo(() => {
    const map = new Map<number, Creneau[]>();
    for (const c of creneaux) {
      if (c.missionId == null) continue;
      map.set(c.missionId, [...(map.get(c.missionId) ?? []), c]);
    }
    for (const list of map.values()) list.sort((a, b) => a.jour.localeCompare(b.jour) || a.debut.localeCompare(b.debut));
    return map;
  }, [creneaux]);

  const sorted = useMemo(() => [...missions].sort((a, b) => a.nom.localeCompare(b.nom)), [missions]);
  const allJours = useMemo(() => [...new Set([...jours, ...creneaux.map((c) => c.jour)])].sort(), [jours, creneaux]);
  // Sans édition, on ne peut pas créer de mission (le back exige edition_id).
  // Une édition archivée est en lecture seule.
  const canCreate = editions == null || (edition != null && !edition.archived);

  const complets = creneaux.filter((c) => c.restantes === 0).length;
  const faibles = creneaux.filter((c) => c.restantes != null && c.capacite > 0 && occ(c) / c.capacite < 0.3).length;

  return (
    <>
      <div className="banner-gradient animate-rise flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-2xl font-black">Missions et créneaux</h1>
          <p className="text-sm text-white/75">
            {edition ? `${edition.nom} · ` : ""}{missions.length} missions · {creneaux.length} créneaux · {complets} complets · {faibles} remplis à moins de 30 %
          </p>
        </div>
        {canCreate && <button type="button" onClick={() => setOpen({ kind: "newMission" })} className="btn-pill btn-pill-inverse shrink-0 text-sm">+ Nouvelle mission</button>}
      </div>

      {editions && <EditionsBar editions={editions} current={edition} missionsCount={missions.length} />}
      {editions && editions.filter((e) => !e.archived).length === 0 && !edition && (
        <p className="official-card p-5 text-center text-sm">Aucune édition. Créez-en une avec « + Édition » pour ajouter des missions.</p>
      )}

      {flash && <p role="status" className="animate-fade-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">{flash}</p>}
      {open?.kind === "newMission" && <MissionForm editionId={edition?.id} jours={joursCreation} onDone={close} />}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par jour">
        <button type="button" onClick={() => setJour("")} className={`btn-pill text-xs !px-4 !py-2 ${!jour ? "btn-pill-primary" : "btn-pill-ghost"}`}>Tous les jours</button>
        {allJours.map((j) => (
          <button key={j} type="button" onClick={() => setJour(j)} className={`btn-pill text-xs !px-4 !py-2 ${jour === j ? "btn-pill-primary" : "btn-pill-ghost"}`}>
            {formatJour(j).court} {formatJour(j).num}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="official-card p-6 text-center text-sm">Aucune mission. Commencez par « + Nouvelle mission ».</p>
      )}

      <div className="space-y-5">
        {sorted.map((m) => {
          const all = byMission.get(m.id) ?? [];
          const list = all.filter((c) => !jour || c.jour === jour);
          const cap = all.reduce((s, c) => s + c.capacite, 0);
          const pris = all.reduce((s, c) => s + occ(c), 0);
          const inscrits = pris;
          return (
            <section key={m.id} className="official-card p-5" aria-labelledby={`m-${m.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id={`m-${m.id}`} className="font-['Montserrat'] text-lg font-extrabold text-[#333]">
                    {m.nom}
                    {m.sensible && <span className="ml-2 rounded-full bg-[#3E150F] px-2 py-0.5 align-middle text-[10px] font-bold text-white">Sensible</span>}
                  </h2>
                  <p className="text-xs text-[#3E150F]/70">{all.length} créneau{all.length > 1 ? "x" : ""} · {pris}/{cap} places prises</p>
                </div>
                {canCreate && <div className="flex flex-wrap items-start gap-2">
                  <button type="button" onClick={() => setOpen({ kind: "newCreneau", missionId: m.id })} className="btn-pill btn-pill-primary text-xs !px-3 !py-1.5">+ Créneau</button>
                  <button type="button" onClick={() => setOpen({ kind: "editMission", id: m.id })} className="rounded-full border border-[#7A291E]/25 px-3 py-1 text-xs font-semibold text-[#7A291E] hover:border-[#7A291E]">Modifier</button>
                  <ConfirmButton
                    label="Supprimer"
                    action={() => (all.length > 0
                      ? Promise.resolve({ ok: false, message: `Supprimez d'abord ${all.length > 1 ? `ses ${all.length} créneaux` : "son créneau"}${inscrits > 0 ? ` (${inscrits} inscrit${inscrits > 1 ? "s" : ""} à retirer)` : ""}.` })
                      : adminDeleteMissionAction(m.id))}
                  />
                </div>}
              </div>

              {open?.kind === "editMission" && open.id === m.id && <div className="mt-4"><MissionForm mission={m} onDone={close} /></div>}
              {open?.kind === "newCreneau" && open.missionId === m.id && <div className="mt-4"><CreneauForm missionId={m.id} jours={joursCreation} onDone={close} /></div>}

              {list.length === 0 ? (
                <p className="mt-4 rounded-xl bg-[#7A291E]/5 p-3 text-center text-sm text-[#3E150F]/70">{all.length ? "Aucun créneau ce jour-là." : "Pas encore de créneau."}</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-[#3E150F]/70">
                      <tr><th className="py-2">Jour</th><th>Horaire</th><th>Inscrits</th><th>Places</th>{canCreate && <th className="text-right">Actions</th>}</tr>
                    </thead>
                    <tbody>
                      {list.map((c) => (
                        <CreneauRow key={c.id} readOnly={!canCreate} c={c} jours={allJours} missionId={m.id} editing={open?.kind === "editCreneau" && open.id === c.id} onEdit={() => setOpen({ kind: "editCreneau", id: c.id })} onClose={close} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function CreneauRow({ c, jours, missionId, editing, onEdit, onClose, readOnly }: { readOnly: boolean; c: Creneau; jours: string[]; missionId: number; editing: boolean; onEdit: () => void; onClose: (message?: string) => void }) {
  const n = occ(c);
  return (
    <>
      <tr className="border-t border-[#7A291E]/10">
        <td className="py-2.5 pr-2 whitespace-nowrap">{formatJour(c.jour).court} {formatJour(c.jour).num}</td>
        <td className="pr-2 whitespace-nowrap">{c.debut}–{c.fin}</td>
        <td className="pr-2">
          <Link href={`/admin/creneaux/${c.id}`} className="font-semibold text-[#7A291E] underline-offset-2 hover:underline">{n}/{c.capacite} · voir</Link>
        </td>
        <td className="pr-2"><PlacesPill restantes={c.restantes} capacite={c.capacite} /></td>
        {!readOnly && <td className="py-2 text-right">
          <span className="inline-flex flex-wrap items-start justify-end gap-2">
            <button type="button" onClick={onEdit} className="rounded-full border border-[#7A291E]/25 px-3 py-1 text-xs font-semibold text-[#7A291E] hover:border-[#7A291E]">Modifier</button>
            <ConfirmButton
              label="Supprimer"
              action={() => (n > 0 ? Promise.resolve({ ok: false, message: `${n} inscrit${n > 1 ? "s" : ""} : retirez-les d'abord (lien « voir »).` }) : adminDeleteCreneauAction(c.id))}
            />
          </span>
        </td>}
      </tr>
      {editing && (
        <tr><td colSpan={5} className="pb-3"><CreneauForm missionId={missionId} creneau={c} jours={jours} onDone={onClose} /></td></tr>
      )}
    </>
  );
}
