"use client";

import { useActionState, useEffect } from "react";
import { adminSaveCreneauAction, adminSaveEditionAction, adminSaveMissionAction } from "../../services/actions";
import { formatJour, PLAGES, plageKey, plageLabel } from "../../services/config";
import { Alert, SubmitButton } from "../../_components/ui";
import type { Creneau, Edition, FormState, Mission } from "../../services/types";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs font-semibold text-red-700">{msg}</p> : null;
}

// Ferme le formulaire après un succès et remonte le message (affiché par la page).
function useCloseOnSuccess(state: FormState, onDone: (message?: string) => void) {
  useEffect(() => {
    if (state.ok) onDone(state.message);
  }, [state, onDone]);
}

// Choix des jours et des tranches horaires fixes (création de plusieurs créneaux d'un coup).
function PlagesPicker({ jours, fe, k, required }: { jours: string[]; fe: Record<string, string>; k: string; required: boolean }) {
  const pill = "flex cursor-pointer items-center gap-2 rounded-full border border-[#7A291E]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#7A291E] has-[:checked]:border-[#7A291E] has-[:checked]:bg-[#7A291E] has-[:checked]:text-white";
  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="field-label">Jours</legend>
        <div className="flex flex-wrap gap-2">
          {jours.map((j) => (
            <label key={j} className={pill}>
              <input type="checkbox" name="jours" value={j} defaultChecked className="sr-only" />
              {formatJour(j).long}
            </label>
          ))}
        </div>
        <Err msg={fe.jours} />
      </fieldset>
      <fieldset>
        <legend className="field-label">Tranches horaires{required ? "" : " (facultatif)"}</legend>
        <div className="flex flex-wrap gap-2">
          {PLAGES.map((p) => (
            <label key={plageKey(p)} className={pill}>
              <input type="checkbox" name="plages" value={plageKey(p)} className="sr-only" />
              {plageLabel(p)}
            </label>
          ))}
        </div>
        <Err msg={fe.plages} />
      </fieldset>
      <div className="max-w-40">
        <label htmlFor={`cap-${k}`} className="field-label">Places par créneau</label>
        <input id={`cap-${k}`} name="capacite_max" type="number" min={1} max={500} defaultValue={4} className="field" />
        <Err msg={fe.capacite_max} />
      </div>
    </div>
  );
}

// Création ou modification d'une mission.
export function MissionForm({ mission, editionId, jours, onDone }: { mission?: Mission; editionId?: number; jours?: string[]; onDone: (message?: string) => void }) {
  const [state, action] = useActionState<FormState, FormData>(adminSaveMissionAction, {});
  useCloseOnSuccess(state, onDone);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="animate-fade-in space-y-3 rounded-2xl bg-[#7A291E]/5 p-4">
      {mission && <input type="hidden" name="id" value={mission.id} />}
      {!mission && editionId != null && <input type="hidden" name="edition_id" value={editionId} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor={`nom-${mission?.id ?? "new"}`} className="field-label">Nom de la mission</label>
          <input id={`nom-${mission?.id ?? "new"}`} name="nom" defaultValue={mission?.nom ?? ""} className="field" placeholder="Ex. Vestiaires" required autoFocus />
          <Err msg={fe.nom} />
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input type="checkbox" name="isSensible" value="1" defaultChecked={mission?.sensible} /> Mission sensible
        </label>
      </div>
      {!mission && jours && jours.length > 0 && (
        <div className="rounded-xl border border-[#7A291E]/10 bg-white/60 p-3">
          <p className="mb-2 text-sm font-semibold text-[#333]">Créer les créneaux en même temps</p>
          <PlagesPicker jours={jours} fe={fe} k="new-mission" required={false} />
        </div>
      )}
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary text-sm !py-2">{mission ? "Enregistrer" : "Créer la mission"}</SubmitButton>
        <button type="button" onClick={() => onDone()} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}

// Création (plusieurs jours × tranches d'un coup) ou modification d'un créneau d'une mission.
export function CreneauForm({ missionId, creneau, jours, onDone }: { missionId: number; creneau?: Creneau; jours: string[]; onDone: (message?: string) => void }) {
  const [state, action] = useActionState<FormState, FormData>(adminSaveCreneauAction, {});
  useCloseOnSuccess(state, onDone);
  const fe = state.fieldErrors ?? {};
  const k = creneau?.id ? String(creneau.id) : `new-${missionId}`;
  const current = creneau ? `${creneau.debut}-${creneau.fin}` : "";
  const horsGrille = creneau && !PLAGES.some((p) => plageKey(p) === current);
  return (
    <form action={action} className="animate-fade-in space-y-3 rounded-2xl bg-[#7A291E]/5 p-4">
      <input type="hidden" name="mission_id" value={missionId} />
      {creneau ? (
        <>
          <input type="hidden" name="id" value={creneau.id} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`jour-${k}`} className="field-label">Jour</label>
              <select id={`jour-${k}`} name="jour" defaultValue={creneau.jour} className="field">
                {jours.map((j) => <option key={j} value={j}>{formatJour(j).long}</option>)}
              </select>
              <Err msg={fe.jour} />
            </div>
            <div>
              <label htmlFor={`plage-${k}`} className="field-label">Tranche horaire</label>
              <select id={`plage-${k}`} name="plage" defaultValue={current} className="field">
                {horsGrille && <option value={current}>{plageLabel(creneau)} (actuel)</option>}
                {PLAGES.map((p) => <option key={plageKey(p)} value={plageKey(p)}>{plageLabel(p)}</option>)}
              </select>
              <Err msg={fe.plage} />
            </div>
            <div>
              <label htmlFor={`cap-${k}`} className="field-label">Places</label>
              <input id={`cap-${k}`} name="capacite_max" type="number" min={1} max={500} defaultValue={creneau.capacite} className="field" required />
              <Err msg={fe.capacite_max} />
            </div>
          </div>
        </>
      ) : (
        <PlagesPicker jours={jours} fe={fe} k={k} required />
      )}
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary text-sm !py-2">{creneau ? "Enregistrer" : "Ajouter les créneaux"}</SubmitButton>
        <button type="button" onClick={() => onDone()} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}

// Création ou modification d'une édition (nom et dates).
export function EditionForm({ edition, onDone }: { edition?: Edition; onDone: (message?: string) => void }) {
  const [state, action] = useActionState<FormState, FormData>(adminSaveEditionAction, {});
  useCloseOnSuccess(state, onDone);
  const fe = state.fieldErrors ?? {};
  const k = edition?.id ?? "new";
  return (
    <form action={action} className="animate-fade-in space-y-3 rounded-2xl bg-[#7A291E]/5 p-4">
      {edition && <input type="hidden" name="id" value={edition.id} />}
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label htmlFor={`ed-nom-${k}`} className="field-label">Nom de l&apos;édition</label>
          <input id={`ed-nom-${k}`} name="nom" defaultValue={edition?.nom ?? ""} className="field" placeholder="Ex. Salon de la Danse 2027" required autoFocus />
          <Err msg={fe.nom} />
        </div>
        <div>
          <label htmlFor={`ed-deb-${k}`} className="field-label">Premier jour</label>
          <input id={`ed-deb-${k}`} name="date_debut" type="date" defaultValue={edition?.debut ?? ""} className="field" required />
          <Err msg={fe.date_debut} />
        </div>
        <div>
          <label htmlFor={`ed-fin-${k}`} className="field-label">Dernier jour</label>
          <input id={`ed-fin-${k}`} name="date_fin" type="date" defaultValue={edition?.fin ?? ""} className="field" required />
          <Err msg={fe.date_fin} />
        </div>
      </div>
      {!edition && (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" value="1" /> En faire l&apos;édition active</label>
      )}
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary text-sm !py-2">{edition ? "Enregistrer" : "Créer l'édition"}</SubmitButton>
        <button type="button" onClick={() => onDone()} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}
