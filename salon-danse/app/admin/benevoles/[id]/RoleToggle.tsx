"use client";

import { useState, useTransition } from "react";
import { adminSetRoleAction } from "../../../services/actions";
import type { Role } from "../../../services/types";

// Deux clics : le premier arme le bouton, le second confirme (pas de boîte de dialogue navigateur).
export default function RoleToggle({ userId, role }: { userId: number; role: Role }) {
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");
  const next: Role = role === "admin" ? "benevole" : "admin";
  const label = role === "admin" ? "Retirer les droits admin" : "Passer admin";

  function click() {
    if (!armed) { setArmed(true); setError(""); return; }
    start(async () => {
      const r = await adminSetRoleAction(userId, next);
      setArmed(false);
      setError(r.ok ? "" : r.message ?? "Erreur");
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" disabled={pending} onClick={click} onBlur={() => setArmed(false)} className="btn-pill btn-pill-ghost text-xs !px-3 !py-1.5 disabled:opacity-60">
        {pending ? "…" : armed ? "Confirmer ?" : label}
      </button>
      {error && <span className="mt-1 text-[11px] font-semibold text-red-700">{error}</span>}
    </span>
  );
}
