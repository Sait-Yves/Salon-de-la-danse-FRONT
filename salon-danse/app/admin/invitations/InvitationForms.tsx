"use client";

import { useActionState, useState } from "react";
import { createCodesAction, sendInvitationAction } from "../../services/actions";
import { Alert, Field, SubmitButton } from "../../_components/ui";
import type { FormState } from "../../services/types";

export default function InvitationForms() {
  const [codes, codesAction] = useActionState<FormState, FormData>(createCodesAction, {});
  const [mail, mailAction] = useActionState<FormState, FormData>(sendInvitationAction, {});
  const [copied, setCopied] = useState(false);
  const list = codes.codes ?? [];

  async function copy() {
    try { await navigator.clipboard.writeText(list.map((c) => c.code).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="official-card p-6">
        <h2 className="mb-1 font-['Montserrat'] text-lg font-extrabold">Générer des codes</h2>
        <p className="mb-4 text-sm text-[#3E150F]/70">Chaque code permet à un bénévole de créer son compte.</p>
        <form action={codesAction} className="space-y-4">
          <Field label="Nombre de codes" name="nombre" type="number" min={1} max={200} defaultValue={10} />
          {codes.error && <Alert>{codes.error}</Alert>}
          {codes.ok && <Alert kind="ok">{codes.message}</Alert>}
          <SubmitButton pending="Génération…" className="btn-pill btn-pill-primary">Générer</SubmitButton>
        </form>
        {list.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold">Codes générés</h3><button type="button" onClick={copy} className="btn-pill btn-pill-ghost text-xs !px-3 !py-1.5">{copied ? "Copié ✓" : "Tout copier"}</button></div>
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">{list.map((c) => <li key={c.id} className="rounded-lg bg-[#7A291E]/5 px-3 py-1.5">{c.code}</li>)}</ul>
          </div>
        )}
      </section>
      <section className="official-card p-6">
        <h2 className="mb-1 font-['Montserrat'] text-lg font-extrabold">Inviter par e-mail</h2>
        <p className="mb-4 text-sm text-[#3E150F]/70">Le bénévole reçoit un code d&apos;accès personnel.</p>
        <form action={mailAction} className="space-y-4">
          <Field label="Adresse e-mail" name="email" type="email" placeholder="prenom.nom@exemple.fr" required />
          {mail.error && <Alert>{mail.error}</Alert>}
          {mail.ok && <Alert kind="ok">{mail.message}</Alert>}
          <SubmitButton pending="Envoi…" className="btn-pill btn-pill-primary">Envoyer l&apos;invitation</SubmitButton>
        </form>
      </section>
    </div>
  );
}
