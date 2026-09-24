"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../services/actions";
import { Alert, Field, SubmitButton } from "../_components/ui";
import type { FormState } from "../services/types";

export default function LoginForms({ initialMode, expired }: { initialMode: "code" | "password"; expired: boolean }) {
  const [mode, setMode] = useState(initialMode);
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(loginAction, {});

  // "Code d'accès" : le code est vérifié à l'inscription (le back n'a pas de route de pré-contrôle).
  function goRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qs = new URLSearchParams({ email: String(fd.get("email")).trim(), code: String(fd.get("code")).trim() });
    router.push(`/register?${qs.toString()}`);
  }

  return (
    <div>
      <div role="tablist" className="mb-5 grid grid-cols-2 gap-2">
        {(["code", "password"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`btn-pill text-xs ${mode === m ? "btn-pill-primary" : "btn-pill-ghost"}`}
          >
            {m === "code" ? "Code d'accès" : "Mot de passe"}
          </button>
        ))}
      </div>

      {expired && mode === "password" && <div className="mb-4"><Alert kind="warn">Votre session a expiré. Reconnectez-vous.</Alert></div>}

      {mode === "code" ? (
        <form onSubmit={goRegister} className="space-y-4">
          <Field label="E-mail" name="email" type="email" required autoComplete="email" />
          <Field label="Code d'invitation" name="code" required placeholder="Reçu par e-mail" className="field uppercase" autoCapitalize="characters" />
          <button type="submit" className="btn-pill btn-pill-primary w-full">Continuer</button>
          <p className="text-center text-xs">Le code vous a été envoyé par e-mail par l&apos;équipe du Salon.</p>
        </form>
      ) : (
        <form action={formAction} className="space-y-4">
          <Field label="E-mail" name="email" type="email" required autoComplete="email" />
          <Field label="Mot de passe" name="password" type="password" required autoComplete="current-password" />
          {state.error && <Alert>{state.error}</Alert>}
          <SubmitButton pending="Connexion…">Se connecter</SubmitButton>
          <p className="text-center text-xs">Mot de passe oublié ? Contactez l&apos;équipe du Salon.</p>
        </form>
      )}
    </div>
  );
}
