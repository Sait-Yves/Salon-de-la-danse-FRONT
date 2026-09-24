"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "../services/actions";
import { Alert, Field, SubmitButton } from "../_components/ui";
import type { FormState } from "../services/types";

export default function RegisterForm({ email, code }: { email: string; code: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(registerAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="code_invitation" value={code} />
      <Field label="E-mail" name="email" type="email" defaultValue={email} readOnly className="field bg-[#F5EEEC]" error={fe.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" name="prenom" required autoComplete="given-name" error={fe.prenom} />
        <Field label="Nom" name="nom" required autoComplete="family-name" error={fe.nom} />
      </div>
      <Field label="Téléphone" name="telephone" type="tel" required autoComplete="tel" error={fe.telephone} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mot de passe" name="password" type="password" required minLength={8} autoComplete="new-password" error={fe.password} />
        <Field label="Confirmer" name="password_confirmation" type="password" required minLength={8} autoComplete="new-password" error={fe.password_confirmation} />
      </div>
      <p className="-mt-2 text-xs">8 caractères minimum.</p>
      <div>
        <label htmlFor="photo" className="field-label">Photo récente (pour votre badge)</label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="field file:mr-3 file:rounded-full file:border-0 file:bg-[#7A291E] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white" aria-invalid={!!fe.photo} />
        {fe.photo ? <p className="mt-1 text-xs font-semibold text-red-700">{fe.photo}</p> : <p className="mt-1 text-xs">JPEG, PNG ou WebP · 2 Mo maximum.</p>}
      </div>
      <label className="flex items-start gap-3 rounded-xl bg-[#7A291E]/5 p-3 text-sm">
        <input type="checkbox" name="isMineur" className="mt-1 h-4 w-4 accent-[#7A291E]" />
        <span>Je suis mineur(e). Un administrateur validera mon profil.</span>
      </label>
      {state.error && <Alert>{state.error}</Alert>}
      <SubmitButton pending="Création du compte…">Créer mon compte</SubmitButton>
      <p className="text-center text-xs">
        Mauvais code ? <Link href="/login?mode=code" className="font-semibold text-[#7A291E] underline">Recommencer</Link>
      </p>
    </form>
  );
}
