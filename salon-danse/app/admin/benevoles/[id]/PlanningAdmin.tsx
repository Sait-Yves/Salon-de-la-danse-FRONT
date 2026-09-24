"use client";

import { useState, useTransition } from "react";
import { adminAssignAction, adminRemoveReservationAction } from "../../../services/actions";
import { formatJour } from "../../../services/config";
import type { Creneau, Reservation } from "../../../services/types";

export default function PlanningAdmin({ userId, reservations, creneaux, locked }: { userId: number; reservations: Reservation[]; creneaux: Creneau[]; locked: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [choice, setChoice] = useState("");
  const taken = new Set(reservations.map((r) => r.creneau.id));
  const options = creneaux.filter((c) => !taken.has(c.id));

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => { const r = await fn(); setError(r.ok ? "" : r.message ?? "Erreur"); if (r.ok) setChoice(""); });

  return (
    <div className="space-y-4">
      {reservations.length === 0 ? (
        <p className="rounded-2xl bg-[#7A291E]/5 p-4 text-center text-sm">Aucun créneau choisi.</p>
      ) : (
        <ul className="space-y-2">
          {reservations.map((r) => {
            const f = formatJour(r.creneau.jour);
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#7A291E]/10 p-3">
                <span className="text-sm"><b className="font-['Montserrat']">{r.creneau.mission}</b>{r.creneau.sensible && <span className="ml-2 rounded-full bg-[#3E150F] px-2 py-0.5 text-[10px] text-white">Sensible</span>}<br />{f.long} · {r.creneau.debut}–{r.creneau.fin}</span>
                <button type="button" disabled={pending} onClick={() => run(() => adminRemoveReservationAction(r.id))} className="btn-pill btn-pill-ghost text-xs !px-3 !py-1.5 disabled:opacity-60">Retirer</button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-col gap-2 md:flex-row">
        <select value={choice} onChange={(e) => setChoice(e.target.value)} className="field flex-1" aria-label="Ajouter un créneau">
          <option value="">Ajouter un créneau…</option>
          {options.map((c) => <option key={c.id} value={c.id}>{formatJour(c.jour).court} {formatJour(c.jour).num} · {c.debut}–{c.fin} · {c.mission}{c.sensible ? " (sensible)" : ""}</option>)}
        </select>
        <button type="button" disabled={!choice || pending} onClick={() => run(() => adminAssignAction(userId, Number(choice)))} className="btn-pill btn-pill-primary text-sm disabled:opacity-60">Affecter</button>
      </div>
      {locked && <p className="text-xs text-[#3E150F]/70">Planning validé : en tant qu&apos;admin, vous pouvez quand même le modifier.</p>}
      {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
