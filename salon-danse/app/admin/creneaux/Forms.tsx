"use client";

import { useActionState, useEffect } from "react";
import { adminSaveCreneauAction, adminSaveEditionAction, adminSaveMissionAction } from "../../services/actions";
import { formatJour } from "../../services/config";
import { Alert, SubmitButton } from "../../_components/ui";
import type { Creneau, Edition, FormState, Mission } from "../../services/types";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs font-semibold text-red-700">{msg}</p> : null;
}

function useCloseOnSuccess(state: FormState, onDone: () => void) {
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);
}

// Création ou modification d'une mission.
export function MissionForm({ mission, editionId, onDone }: { mission?: Mission; editionId?: number; onDone: () => void }) {
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
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary text-sm !py-2">{mission ? "Enregistrer" : "Créer la mission"}</SubmitButton>
        <button type="button" onClick={onDone} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}

// Création ou modification d'un créneau d'une mission.
export function CreneauForm({ missionId, creneau, jours, onDone }: { missionId: number; creneau?: Creneau; jours: string[]; onDone: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(adminSaveCreneauAction, {});
  useCloseOnSuccess(state, onDone);
  const fe = state.fieldErrors ?? {};
  const k = creneau?.id ?? `new-${missionId}`;
  return (
    <form action={action} className="animate-fade-in space-y-3 rounded-2xl bg-[#7A291E]/5 p-4">
      <input type="hidden" name="mission_id" value={missionId} />
      {creneau && <input type="hidden" name="id" value={creneau.id} />}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label htmlFor={`jour-${k}`} className="field-label">Jour</label>
          <select id={`jour-${k}`} name="jour" defaultValue={creneau?.jour ?? jours[0]} className="field">
            {jours.map((j) => <option key={j} value={j}>{formatJour(j).long}</option>)}
          </select>
          <Err msg={fe.jour} />
        </div>
        <div>
          <label htmlFor={`deb-${k}`} className="field-label">Début</label>
          <input id={`deb-${k}`} name="heure_debut" type="time" step={900} defaultValue={creneau?.debut ?? "10:00"} className="field" required />
          <Err msg={fe.heure_debut} />
        </div>
        <div>
          <label htmlFor={`fin-${k}`} className="field-label">Fin</label>
          <input id={`fin-${k}`} name="heure_fin" type="time" step={900} defaultValue={creneau?.fin ?? "12:00"} className="field" required />
          <Err msg={fe.heure_fin} />
        </div>
        <div>
          <label htmlFor={`cap-${k}`} className="field-label">Places</label>
          <input id={`cap-${k}`} name="capacite_max" type="number" min={1} max={500} defaultValue={creneau?.capacite ?? 4} className="field" required />
          <Err msg={fe.capacite_max} />
        </div>
      </div>
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary text-sm !py-2">{creneau ? "Enregistrer" : "Ajouter le créneau"}</SubmitButton>
        <button type="button" onClick={onDone} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}

// Création ou modification d'une édition (nom et dates).
export function EditionForm({ edition, onDone }: { edition?: Edition; onDone: () => void }) {
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
        <button type="button" onClick={onDone} className="btn-pill btn-pill-ghost text-sm !py-2">Annuler</button>
      </div>
    </form>
  );
}
