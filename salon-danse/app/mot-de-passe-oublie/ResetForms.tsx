"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotPasswordAction, resetPasswordAction } from "../services/actions";
import { Alert, Field, SubmitButton } from "../_components/ui";
import type { FormState } from "../services/types";

// Deux étapes : 1) recevoir un code par e-mail, 2) le saisir avec le nouveau mot de passe.
// Un lien avec ?email=…&token=… ouvre directement l'étape 2.
export default function ResetForms({ email: initialEmail, token }: { email: string; token: string }) {
  const [asked, askAction] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  const [reset, resetAction] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const [skip, setSkip] = useState(!!token);
  const step2 = skip || asked.ok;
  const email = asked.ok ? asked.message ?? initialEmail : initialEmail;

  if (!step2) {
    const fe = asked.fieldErrors ?? {};
    return (
      <form action={askAction} className="space-y-4">
        <p className="text-sm">Entrez votre adresse : nous vous envoyons un code pour choisir un nouveau mot de passe.</p>
        <Field label="E-mail" name="email" type="email" required autoComplete="email" defaultValue={initialEmail} error={fe.email} />
        {asked.error && <Alert>{asked.error}</Alert>}
        <SubmitButton pending="Envoi…">Recevoir un code</SubmitButton>
        <p className="flex justify-between text-xs">
          <Link href="/login?mode=password" className="font-semibold text-[#7A291E] underline underline-offset-2">← Connexion</Link>
          <button type="button" onClick={() => setSkip(true)} className="font-semibold text-[#7A291E] underline underline-offset-2">J&apos;ai déjà un code</button>
        </p>
      </form>
    );
  }

  const fe = reset.fieldErrors ?? {};
  return (
    <form action={resetAction} className="space-y-4">
      {asked.ok && <Alert kind="ok">Si un compte existe pour {email}, un code vient d&apos;être envoyé. Pensez à vérifier les spams.</Alert>}
      <Field label="E-mail" name="email" type="email" required autoComplete="email" defaultValue={email} error={fe.email} />
      <Field label="Code reçu par e-mail" name="token" required autoComplete="one-time-code" defaultValue={token} error={fe.token} />
      <Field label="Nouveau mot de passe" name="password" type="password" required minLength={8} autoComplete="new-password" error={fe.password} />
      <Field label="Confirmer le mot de passe" name="password_confirmation" type="password" required autoComplete="new-password" error={fe.password_confirmation} />
      {reset.error && <Alert>{reset.error}</Alert>}
      <SubmitButton pending="Enregistrement…">Changer mon mot de passe</SubmitButton>
      <p className="text-center text-xs">Toutes vos sessions ouvertes seront déconnectées.</p>
    </form>
  );
}
