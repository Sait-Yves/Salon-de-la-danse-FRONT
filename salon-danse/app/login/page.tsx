"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithOneTimeCode,
  loginWithPassword,
  requestPasswordReset,
  resetPassword,
} from "../services/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "code" | "reset">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "password" && loginWithPassword(email, password)) {
      router.push("/dashboard");
    } else if (mode === "code" && code.trim() === "DANSE2027-TEST") {
      router.push("/register");
    } else if (mode === "code" && loginWithOneTimeCode(code, email)) {
      router.push("/dashboard");
    } else if (mode === "reset") {
      if (!code) {
        const resetCode = requestPasswordReset(email);
        setMessage(
          resetCode
            ? `Code de réinitialisation de démonstration : ${resetCode}`
            : "Aucun compte ne correspond à cet e-mail.",
        );
      } else if (resetPassword(email, code, password)) {
        setMessage(
          "Mot de passe modifié. Vous pouvez maintenant vous connecter.",
        );
        setMode("password");
        setCode("");
      } else {
        setError("Code de réinitialisation invalide ou déjà utilisé.");
      }
    } else {
      setError(
        mode === "password"
          ? "E-mail ou mot de passe incorrect."
          : "Code invalide, déjà utilisé ou associé à un autre e-mail.",
      );
    }
  };

  const selectMode = (nextMode: "password" | "code" | "reset") => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setCode("");
  };

  return (
    <main className="surface-grain flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="animate-fade-up w-full max-w-md rounded-3xl border border-[#7A291E]/10 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(62,21,15,0.25)]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7A291E]/10 text-2xl">
            🎟️
          </div>
          <h1 className="font-['Montserrat'] text-2xl font-extrabold text-[#333333]">
            Salon de la Danse 2027
          </h1>
          <p className="mt-1 text-sm text-[#666666]">
            Espace sécurisé bénévoles et administrateurs
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => selectMode("password")}
            className={`btn-pill text-xs ${mode === "password" ? "btn-pill-primary" : "btn-pill-ghost"}`}
          >
            Mot de passe
          </button>
          <button
            type="button"
            onClick={() => selectMode("code")}
            className={`btn-pill text-xs ${mode === "code" ? "btn-pill-primary" : "btn-pill-ghost"}`}
          >
            Code d&apos;accès
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {mode !== "password" && (
            <div>
              <label htmlFor="email" className="field-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                required
              />
            </div>
          )}
          {mode === "password" && (
            <div>
              <label htmlFor="email" className="field-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                required
              />
            </div>
          )}
          {mode === "password" || mode === "reset" ? (
            <div>
              <label htmlFor="password" className="field-label">
                {mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                required={mode === "password" || Boolean(code)}
              />
            </div>
          ) : null}
          {mode === "code" || mode === "reset" ? (
            <div>
              <label htmlFor="code" className="field-label">
                {mode === "reset" ? "Code reçu" : "Code d&apos;accès"}
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: DANSE2027-..."
                className="field uppercase"
                required={mode === "code"}
              />
            </div>
          ) : null}

          {error && (
            <p className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              ⚠️ {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button type="submit" className="btn-pill btn-pill-primary w-full">
            {mode === "password"
              ? "Se connecter"
              : mode === "reset"
                ? "Réinitialiser le mot de passe"
                : "Valider le code"}
          </button>
        </form>
        {mode === "password" && (
          <button
            type="button"
            onClick={() => selectMode("reset")}
            className="mt-4 w-full text-sm font-semibold text-[#7A291E] hover:underline"
          >
            Mot de passe oublié ?
          </button>
        )}
        {mode === "code" && (
          <p className="mt-4 text-center text-xs text-[#666666]">
            Le code bénévole de première inscription est accepté ici. Les codes
            admin sont à usage unique.
          </p>
        )}
      </div>
    </main>
  );
}
