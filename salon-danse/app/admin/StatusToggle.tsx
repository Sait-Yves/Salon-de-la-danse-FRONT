"use client";

import { useState, useTransition } from "react";
import { adminPlanningStatusAction } from "../services/actions";
import type { StatutPlanning } from "../services/types";

export default function StatusToggle({ userId, statut }: { userId: number; statut: StatutPlanning }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const action = statut === "valide" ? "deverrouiller" : "valider";
  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await adminPlanningStatusAction(userId, action); setError(r.ok ? "" : r.message ?? "Erreur"); })}
        className="btn-pill btn-pill-ghost text-xs !px-3 !py-1.5 disabled:opacity-60"
      >
        {pending ? "…" : statut === "valide" ? "Déverrouiller" : "Valider"}
      </button>
      {error && <span className="mt-1 text-[11px] font-semibold text-red-700">{error}</span>}
    </span>
  );
}
