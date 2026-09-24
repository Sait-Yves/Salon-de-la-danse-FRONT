"use client";

import { useActionState } from "react";
import { sendInvitationAction } from "../../services/actions";
import { Alert, Field, SubmitButton } from "../../_components/ui";
import type { FormState } from "../../services/types";

export default function InvitationForms() {
  const [mail, mailAction] = useActionState<FormState, FormData>(sendInvitationAction, {});

  return (
    <section className="official-card max-w-xl p-6">
      <h2 className="mb-1 font-['Montserrat'] text-lg font-extrabold">Inviter par e-mail</h2>
      <p className="mb-4 text-sm text-[#3E150F]/70">Le bénévole reçoit un code d&apos;accès personnel, valable uniquement avec cette adresse.</p>
      <form action={mailAction} className="space-y-4">
        <Field label="Adresse e-mail" name="email" type="email" placeholder="prenom.nom@exemple.fr" required />
        {mail.error && <Alert>{mail.error}</Alert>}
        {mail.ok && <Alert kind="ok">{mail.message}</Alert>}
        <SubmitButton pending="Envoi…" className="btn-pill btn-pill-primary">Envoyer l&apos;invitation</SubmitButton>
      </form>
    </section>
  );
}
