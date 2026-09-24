"use client";

import { useActionState } from "react";
import { adminUpdateUserAction } from "../../../services/actions";
import { Alert, Field, SubmitButton } from "../../../_components/ui";
import type { FormState, User } from "../../../services/types";

export default function UserEditForm({ user }: { user: User }) {
  const [state, action] = useActionState<FormState, FormData>(adminUpdateUserAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Prénom" name="prenom" defaultValue={user.prenom} error={fe.prenom} required />
        <Field label="Nom" name="nom" defaultValue={user.nom} error={fe.nom} required />
        <Field label="E-mail" name="email" type="email" defaultValue={user.email} error={fe.email} required />
        <Field label="Téléphone" name="telephone" type="tel" defaultValue={user.telephone} error={fe.telephone} required />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isMineur" defaultChecked={user.isMineur} /> Bénévole mineur</label>
      <div>
        <label htmlFor="photo" className="field-label">Nouvelle photo (facultatif)</label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="field" />
        {fe.photo && <p className="mt-1 text-xs font-semibold text-red-700">{fe.photo}</p>}
      </div>
      {state.error && <Alert>{state.error}</Alert>}
      {state.ok && <Alert kind="ok">{state.message}</Alert>}
      <SubmitButton pending="Enregistrement…" className="btn-pill btn-pill-primary">Enregistrer</SubmitButton>
    </form>
  );
}
